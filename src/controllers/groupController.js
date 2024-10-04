import { UserRole } from "../models/User.js";
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
    const groups = await Group.find().populate('name description members admins');

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

    group.memberRequests.push(req.user._id);
    await group.save();

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

    res.status(200).send({ success: true, message: 'User approved and added to group' });
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error approving request: ' + err });
  }
}
