import { Channel } from '../models/Channel.js';
import { UserRole } from '../models/User.js';
import { Group } from '../models/Group.js';

export async function createChannel(req, res) {
    const { groupId, channelName, channelDescription } = req.body;
  
    try {
      if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
        return res.status(401).send('Unauthorized to create channel, user is not an admin.');
      }
  
      const group = await Group.findById(groupId);
  
      if (req.user.role === UserRole.GROUP_ADMIN && !group.admins.includes(req.user._id)) {
        return res.status(401).send('Unauthorized to create channel, user is not an admin of this group.');
      }
  
      // Create a new Channel
      const channel = new Channel({
        name: channelName,
        description: channelDescription,
        group: groupId,
      });
  
      await channel.save();
  
      // Push the channel's ObjectId into the group's channels array
      group.channels.push(channel._id);
  
      await group.save();
  
      // Re-query the group and populate the channels
      const updatedGroup = await Group.findById(groupId).populate('channels');
  
      res.status(201).send(updatedGroup);
    } catch (err) {
      console.log("Error creating channel: ", err);
      res.status(400).send('Error creating channel: ' + err);
    }
  }

  export async function deleteChannel(req, res) {
      const { groupId, channelId } = req.body;
  
      try {
          if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
              return res.status(401).send('Unauthorized to delete channel, user is not an admin.');
          }
  
          const group = await Group.findById(groupId);
  
          if (req.user.role === UserRole.GROUP_ADMIN && !group.admins.includes(req.user._id)) {
                  return res.status(401).send('Unauthorized to delete channel, user is not an admin of this group.');
          }
  
          group.channels.pull({ _id: channelId });
  
          await group.save();
  
          res.status(200).send(`Channel ${channelId} deleted`);
      } catch (err) {
          res.status(400).send('Error deleting channel: ' + err);
      }
  }
