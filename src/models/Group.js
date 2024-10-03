import { Schema, model } from 'mongoose';

// A group holds many chat channels, and has many members and can have multiple admins
const GroupSchema = new Schema({
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  memberRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  channels: [{ type: Schema.Types.ObjectId, ref: 'Channel' }]
});

const Group = model('Group', GroupSchema);
export { Group };
