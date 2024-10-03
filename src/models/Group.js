const mongoose = require('mongoose');

// A group holds many chat channels, and has many members and can have multiple admins
const GroupSchema = new mongoose.Schema({
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }]
});

const Group = mongoose.model('Group', GroupSchema);
module.exports = Group;
