import { Schema, model } from 'mongoose';

// Enum for Message Types
const MessageType = {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio'
};

// A Message can be of type text, image, video, or audio. Needs a timestamp and belongs to a channel
const MessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messageType: {
        type: String,
        enum: Object.values(MessageType),
        required: true
    },
    text: { type: String },  // Only if messageType is 'text'
    mediaRef: { type: String },  // For media (images, video, audio)
    timestamp: { type: Date, default: Date.now, required: true },
    channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true }
});

const Message = model('Message', MessageSchema);
export { Message, MessageType };
