import { Channel } from '../models/Channel.js';
import { UserRole } from '../models/User.js';
import { Group } from '../models/Group.js';

export async function createChannel(req, res) {
  const { groupId, channelName, channelDescription } = req.body;

  try {
    if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
      return res.status(401).json({ success: false, message: 'Unauthorized to create channel, user is not an admin.' });
    }

    const group = await Group.findById(groupId);

    if (req.user.role === UserRole.GROUP_ADMIN && !group.admins.includes(req.user._id)) {
      return res.status(401).json({ success: false, message: 'Unauthorized to create channel, user is not an admin of this group.' });
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

    res.status(201).json({ success: true, message: 'Channel created successfully', group: updatedGroup });
  } catch (err) {
    console.log("Error creating channel: ", err);
    res.status(400).json({ success: false, message: 'Error creating channel: ' + err });
  }
}

export async function deleteChannel(req, res) {
  const { groupId, channelId } = req.body;

  try {
    if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
      return res.status(401).json({ success: false, message: 'Unauthorized to delete channel, user is not an admin.' });
    }

    const group = await Group.findById(groupId);

    if (req.user.role === UserRole.GROUP_ADMIN && !group.admins.includes(req.user._id)) {
      return res.status(401).json({ success: false, message: 'Unauthorized to delete channel, user is not an admin of this group.' });
    }

    group.channels.pull({ _id: channelId });

    await group.save();

    res.status(200).json({ success: true, message: `Channel ${channelId} deleted successfully` });
  } catch (err) {
    console.log("Error deleting channel: ", err);
    res.status(400).json({ success: false, message: 'Error deleting channel: ' + err });
  }
}

export async function getChannelAndMessages(req, res) {
  const { channelId } = req.body;

  try {
    const channel = await Channel.findById(channelId).populate('messages name description group bannedUsers');

    if (!channel) {
      return res.status(404).json({ success: false, message: 'Channel not found' });
    }

    if (channel.bannedUsers.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'User is banned from this channel' });
    }

    res.status(200).json({ success: true, message: 'Channel and messages retrieved successfully', channel });
  } catch (err) {
    console.log("Error getting channel and messages: ", err);
    res.status(400).json({ success: false, message: 'Error getting channel and messages: ' + err });
  }
}
