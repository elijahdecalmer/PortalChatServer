const mongoose = require('mongoose');

// Channel which belongs to a group and allows messages to be sent in it
const ChannelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
    });
const Channel = mongoose.model('Channel', ChannelSchema);
module.exports = Channel;