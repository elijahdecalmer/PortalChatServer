import { Schema, model } from 'mongoose';
import { randomBytes } from 'crypto';

// Enum for UserRole
const UserRole = {
  CHAT_USER: 'chat_user',
  GROUP_ADMIN: 'group_admin',
  SUPER_ADMIN: 'super_admin'
};
Object.freeze(UserRole);

// A user can have a profile picture, a bio and a role. I have chosen to do simplified token authentication to demonstrate session-like use without the complexity of sessions
const UserSchema = new Schema({
  name: { type: String, required: true },
  profilePictureRef: { type: String },
  bio: { type: String },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
    default: UserRole.CHAT_USER
  },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String, unique: true, required: true },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  groupRequests: [{ type: Schema.Types.ObjectId, ref: 'Group' }]
});

// Generate a random token when creating a new user
UserSchema.pre('save', function(next) {
  if (!this.token) {
    this.token = randomBytes(32).toString('hex');
  }
  next();
});

const User = model('User', UserSchema);
export { User, UserRole}
