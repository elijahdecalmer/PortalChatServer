import { Schema, model } from 'mongoose';

// A Message can be of type text, image, video or audio, needs a timestamp and belongs to a channel
const MessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    messageType: {
        type: String,
        enum: Object.values(MessageType),
        required: true
    },
    text: { type: String, required: false },
    mediaRef: { type: String, required: false },
    timestamp: { type: Date, required: true },
    channel: { type: Schema.Types.ObjectId, ref: 'Channel' }
});

const Message = model('Message', MessageSchema);
export { Message };