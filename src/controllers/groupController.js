import { UserRole, User } from "../models/User.js";
import { Group } from "../models/Group.js";

// api/groups/createGroup
export async function createGroup(req, res) {
  const { groupName, groupDescription } = req.body;

  try {
    if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
      return res.status(401).send({ success: false, message: 'Unauthorized to create group' });
    }

    const group = new Group({
      name: groupName,
      description: groupDescription,
      admins: [req.user._id],
      members: [req.user._id],
    });

    await group.save();

    const user = await User.findById(req.user._id);
    user.groups.push(group._id);
    await user.save();

    res.status(201).send({ success: true, message: 'Group created successfully', group });
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error creating group: ' + err });
  }
}

// api/groups/myGroups
export async function getMyGroups(req, res) {
  try {
    const groups = await Group.find({ members: req.user._id }).populate('admins name description members channels');

    if (!groups || groups.length === 0) {
      return res.status(404).send({ success: false, message: 'No groups found' });
    }

    res.status(200).send({ success: true, message: 'Groups retrieved successfully', groups });
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error fetching user groups: ' + err });
  }
}

// api/groups/all
export async function getAllGroups(req, res) {
  try {
    const groups = await Group.find().populate('name description channels members memberRequests admins')
      .populate({
        path: 'channels', // Populate the channels field first
        populate: {
          path: 'bannedUsers', // Sub-populate the bannedUsers field within channels
          model: 'User', // Assuming bannedUsers references the User model
          select: 'username email', // Optionally select the fields you want to return from the User model
        },
      }); // Populate the members field within groups

    if (!groups || groups.length === 0) {
      return res.status(404).send({ success: false, message: 'No groups found' });
    }

    res.status(200).send({ success: true, message: 'All groups retrieved successfully', groups });
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error fetching all groups: ' + err });
  }
}

// api/groups/details
export async function getGroupDetails(req, res) {
  const { groupId } = req.body;

  try {
    const group = await Group.findById(groupId).populate('admins name description members channels');

    if (!group) {
      return res.status(404).send({ success: false, message: 'Group not found' });
    }

    res.status(200).send({ success: true, message: 'Group details retrieved successfully', group });
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error fetching group details: ' + err });
  }
}

// api/groups/deleteGroup
export async function deleteGroup(req, res) {
  const { groupId } = req.body;

  if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(401).send({ success: false, message: 'Unauthorized to delete group, not an admin.' });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).send({ success: false, message: 'Group not found' });
    }

    if (!group.admins.includes(req.user._id)) {
      return res.status(401).send({ success: false, message: 'Unauthorized to delete group, not an admin of this group.' });
    }

    await group.deleteOne();

    // Remove group from all users
    const users = await User.find({ groups: groupId });
    for (const user of users) {
      user.groups.pull(groupId);
      user.groupRequests.pull(groupId);
      await user.save();
    }


    res.status(200).send({ success: true, message: 'Group deleted successfully' });
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error deleting group: ' + err });
  }
}

// api/groups/requestAccess
export async function requestAccess(req, res) {
  const { groupId } = req.body;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).send({ success: false, message: 'Group not found' });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).send({ success: false, message: 'Already a member of this group' });
    }

    if (group.memberRequests.includes(req.user._id)) {
      return res.status(400).send({ success: false, message: 'Access request already sent' });
    }

    group.memberRequests.push(req.user._id);
    await group.save();

    // Add group to user's groupRequests
    const user = await User.findById(req.user._id);
    user.groupRequests.push(groupId);
    await user.save();

    res.status(200).send({ success: true, message: 'Access request sent successfully' });
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error requesting access: ' + err });
  }
}

// api/groups/acceptAccess
export async function approveRequest(req, res) {
  const { groupId, userId } = req.body;

  try {
    if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
      return res.status(401).send({ success: false, message: 'Unauthorized to approve request, not an admin.' });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).send({ success: false, message: 'Group not found' });
    }

    if (!group.admins.includes(req.user._id)) {
      return res.status(401).send({ success: false, message: 'Unauthorized to approve request, not an admin of this group.' });
    }

    group.memberRequests.pull(userId);
    group.members.push(userId);
    await group.save();

    // Add group to user's groups, remove from groupRequests
    const user = await User.findById(userId);
    user.groups.push(groupId);
    user.groupRequests.pull(groupId);
    await user.save();

    res.status(200).send({ success: true, message: 'User approved and added to group' });
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error approving request: ' + err });
  }
}

// api/groups/removeUser
export async function removeUser(req, res) {
  const { groupId, userId } = req.body;

  try {
    if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
      return res.status(401).send({ success: false, message: 'Unauthorized to remove user, not an admin.' });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).send({ success: false, message: 'Group not found' });
    }

    if (!group.admins.includes(req.user._id)) {
      return res.status(401).send({ success: false, message: 'Unauthorized to remove user, not an admin of this group.' });
    }

    group.members.pull(userId);
    group.memberRequests.pull(userId);
    await group.save();

    // Remove group from user's groups
    const user = await User.findById(userId);
    user.groups.pull(groupId);
    await user.save();

    res.status(200).send({ success: true, message: 'User removed from group' });
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error removing user: ' + err });
  }
}


// api/groups/rejectAccess
export async function rejectAccess(req, res) {
  const { groupId, userId } = req.body;

  try {
    if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
      return res.status(401).send({ success: false, message: 'Unauthorized to reject request, not an admin.' });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).send({ success: false, message: 'Group not found' });
    }

    if (!group.admins.includes(req.user._id)) {
      return res.status(401).send({ success: false, message: 'Unauthorized to reject request, not an admin of this group.' });
    }

    group.memberRequests.pull(userId);
    group.members.pull(userId);
    await group.save();

    // Remove group from user's groupRequests
    const user = await User.findById(userId);
    user.groupRequests.pull(groupId);
    await user.save();

    res.status(200).send({ success: true, message: 'User request rejected' });
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error rejecting request: ' + err });
  }
}