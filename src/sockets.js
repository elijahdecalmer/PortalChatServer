import { Message, MessageType } from './models/Message.js';
import { Channel } from './models/Channel.js';

export function initializeSockets(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // For peer signalling
    socket.on('peerConnected', ({ peerId, channelId }) => {

        // Notify everyone in the channel
        socket.to(channelId).emit('peerConnected', { peerId });

    });
    

    // Event: User joins a specific channel
    socket.on('joinChannel', async ({ channelId, userId }) => {
      try {
        const channel = await Channel.findById(channelId).populate('bannedUsers');

        // Check if the user is banned
        if (channel.bannedUsers.includes(userId)) {
          return socket.emit('error', 'You are banned from this channel.');
        }

        // Add the user to the socket room
        socket.join(channelId);
        console.log(`User ${userId} joined channel ${channelId}`);

        // Send the last 50 messages to the user
        const messages = await Message.find({ channel: channelId })
          .sort({ timestamp: -1 })
          .limit(50)
          .populate('sender'); // Populate with sender info
        socket.emit('previousMessages', messages.reverse());
      } catch (error) {
        socket.emit('error', 'Error joining the channel.');
        console.error(error);
      }
    });

    // Event: User sends a message (text or media)
    socket.on('sendMessage', async ({ channelId, userId, messageType, text, mediaRef }) => {
      try {
        // Find the channel
        const channel = await Channel.findById(channelId);
        if (!channel) return socket.emit('error', 'Channel not found.');

        // Create a new message
        const message = new Message({
          sender: userId,
          messageType: messageType,
          text: messageType === MessageType.TEXT ? text : null,
          mediaRef: messageType !== MessageType.TEXT ? mediaRef : null,
          channel: channelId,
          timestamp: new Date()
        });
        await message.save();

        // Add the message to the channel's message list
        channel.messages.push(message);
        await channel.save();

        const populatedMessage = await message.populate('sender');
        // Emit the new message to everyone in the channel
        io.to(channelId).emit('newMessage', populatedMessage);
      } catch (error) {
        socket.emit('error', 'Error sending the message.');
        console.error(error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
}
