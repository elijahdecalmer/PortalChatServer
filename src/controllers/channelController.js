import { Channel } from '../models/Channel.js';
import { UserRole } from '../models/User.js';
import { Group } from '../models/Group.js';
import { Message, MessageType } from '../models/Message.js';


// api/channels/createChannel
export async function createChannel(req, res) {
  const { groupId, channelName, channelDescription } = req.body;

  try {
    if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
      return res.status(401).send({ success: false, message: 'Unauthorized to create channel, user is not an admin.' });
    }

    const group = await Group.findById(groupId);

    if (req.user.role === UserRole.GROUP_ADMIN && !group.admins.includes(req.user._id)) {
      return res.status(401).send({ success: false, message: 'Unauthorized to create channel, user is not an admin of this group.' });
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

    res.status(201).send({ success: true, message: 'Channel created successfully', group: updatedGroup });
  } catch (err) {
    console.log("Error creating channel: ", err);
    res.status(400).send({ success: false, message: 'Error creating channel: ' + err });
  }
}


// api/channels/deleteChannel
export async function deleteChannel(req, res) {
  const { groupId, channelId } = req.body;

  try {
    if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
      return res.status(401).send({ success: false, message: 'Unauthorized to delete channel, user is not an admin.' });
    }

    const group = await Group.findById(groupId);

    if (req.user.role === UserRole.GROUP_ADMIN && !group.admins.includes(req.user._id)) {
      return res.status(401).send({ success: false, message: 'Unauthorized to delete channel, user is not an admin of this group.' });
    }

    group.channels.pull({ _id: channelId });

    await group.save();

    res.status(200).send({ success: true, message: `Channel ${channelId} deleted successfully` });
  } catch (err) {
    console.log("Error deleting channel: ", err);
    res.status(400).send({ success: false, message: 'Error deleting channel: ' + err });
  }
}

// api/channels/getChannelAndMessages
export async function getChannelAndMessages(req, res) {
  const { channelId } = req.body;

  try {
    const channel = await Channel.findById(channelId).populate('messages name description group bannedUsers');

    if (!channel) {
      return res.status(404).send({ success: false, message: 'Channel not found' });
    }

    if (channel.bannedUsers.includes(req.user._id)) {
      return res.status(403).send({ success: false, message: 'User is banned from this channel' });
    }

    res.status(200).send({ success: true, message: 'Channel and messages retrieved successfully', channel });
  } catch (err) {
    console.log("Error getting channel and messages: ", err);
    res.status(400).send({ success: false, message: 'Error getting channel and messages: ' + err });
  }
}

// api/channels/banUser
export async function banUser(req, res) {
  const { channelId, userId } = req.body;

  try {
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).send({ success: false, message: 'Channel not found' });
    }

    if (req.user.role !== UserRole.GROUP_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
      return res.status(401).send({ success: false, message: 'Unauthorized to ban user, user is not an admin.' });
    }

    channel.bannedUsers.push(userId);

    await channel.save();

    res.status(200).send({ success: true, message: `User ${userId} banned from channel ${channelId}` });
  } catch (err) {
    console.log("Error banning user: ", err);
    res.status(400).send({ success: false, message: 'Error banning user: ' + err });
  }
}

// Function for handling file uploads and emitting messages to sockets
export async function uploadFile(req, res) {
  const io = req.app.get('socketio');  // Access the socket instance

  try {
    const { messageType, text, channelId } = req.body;

    // Create a new message with the file reference (if it's media)
    let message = new Message({
      sender: req.user._id,
      messageType,
      text: messageType === MessageType.TEXT ? text : null,
      mediaRef: messageType !== MessageType.TEXT ? `/uploads/media/${req.file.filename}` : null,
      channel: channelId,
      timestamp: new Date()
    });

    await message.save();  // Save the message to the database

    const populatedMessage = await message.populate('sender');

    // Emit the new message to the channel via Socket.io
    io.to(channelId).emit('newMessage', populatedMessage);

    // After uploading, respond with the file path
    res.status(201).json({ success: true, filePath: `/uploads/media/${req.file.filename}` });
  } catch (err) {
    console.error('Error uploading file and sending message:', err);
    res.status(500).json({ success: false, message: 'Error uploading file: ' + err.message });
  }
};

// api/channels/details
export async function getChannelDetails(req, res) {
  const { channelId } = req.body;

  try {
    const channel = await Channel.findById(channelId).populate('group');

    if (!channel) {
      return res.status(404).send({ success: false, message: 'Channel not found' });
    }

    res.status(200).send({ success: true, message: 'Channel details retrieved successfully', channel });
  }
  catch (err) {
    res.status(400).send({ success: false, message: 'Error fetching channel details: ' + err });
  }
}