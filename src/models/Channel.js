import { Schema, model } from 'mongoose';

// Channel which belongs to a group and allows messages to be sent in it
const ChannelSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    group: { type: Schema.Types.ObjectId, ref: 'Group' },
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    bannedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});
const Channel = model('Channel', ChannelSchema);

export { Channel };