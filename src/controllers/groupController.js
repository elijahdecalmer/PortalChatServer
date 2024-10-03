import { UserRole } from "../models/User.js";
import { Group } from "../models/Group.js";

export async function createGroup(req, res) {
    const { groupName, groupDescription } = req.body;

    try {
        if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
            return res.status(401).send('Unauthorized to create group');
        }

        const group = new Group({ name: groupName, description: groupDescription, admins: [req.user._id], members: [req.user._id] });

        await group.save();

        res.status(201).send(group);        
    } catch (err) {
      res.status(400).send('Error: ' + err);
    }
  }

  export async function getMyGroups(req, res) {
    try {
      const groups = await Group.find({ members: req.user._id }).populate('admins name description members channels');
  
      if (!groups) {
        return res.status(404).send('No groups found');
      }
  
      res.status(200).send(groups);
    } catch (err) {
      res.status(400).send('Error fetching user groups: ', err);
    }
  }

  export async function getAllGroups(req, res) {
    try {
      const groups = await Group.find().populate('name description members admins');
  
      if (!groups) {
        return res.status(404).send('No groups found');
      }
  
      res.status(200).send(groups);
    } catch (err) {
      res.status(400).send('Error fetching all groups: ' + err);
    }
  }

  export async function getGroupDetails(req, res) {
    const { groupId } = req.body;
  
    try {
      const group = await Group.findById(groupId).populate('admins name description members channels');
  
      if (!group) {
        return res.status(404).send('Group not found');
      }
  
      res.status(200).send(group);
    } catch (err) {
      res.status(400).send('Error fetching group details: ' + err);
    }
  }

    export async function deleteGroup(req, res) {
        const { groupId } = req.body;
        if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
          return res.status(401).send('Unauthorized to delete group, as they are not an admin.');
        }
    
        try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).send('Group not found');
        }

        if (!group.admins.includes(req.user._id)) {
            return res.status(401).send('Unauthorized to delete group, as they are not an admin of this group.');
        }

        await group.deleteOne();

        res.status(200).send('Group deleted');
        } catch (err) {
          console.log("Error deleting group: ", err);
        res.status(400).send('Error deleting group: ' + err);
        }
    }

    // request access, called by any user to request access to a group
    export async function requestAccess(req, res) {
        const { groupId } = req.body;
    
        try {
            const group = await Group.findById(groupId);

            if (!group) {
              res.status(404).send('Group not found');
            }

            group.memberRequests.push(req.user._id);

            await group.save();

            res.status(200).send('Request sent');
        } catch (err) {
            res.status(400).send('Error requesting access: ' + err);
        }
    }

    // approve request, called by an admin to approve a user's request to join a group
    export async function approveRequest(req, res) {
        const { groupId, userId } = req.body;
    
        try {
            if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
                return res.status(401).send('Unauthorized to approve request, user is not an admin.');
            }
            
            const group = await Group.findById(groupId);

            if (!group) {
              res.status(404).send('Group not found');
            }

            if (!group.admins.includes(req.user._id)) {
                return res.status(401).send('Unauthorized to approve request, user is not an admin of this group.');
            }

            group.memberRequests.pull(userId);
            group.members.push(userId);

            await group.save();

            res.status(200).send('Request approved');
        } catch (err) {
            res.status(400).send('Error approving request: ' + err);
        }
    }
