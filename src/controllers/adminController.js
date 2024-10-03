import { User, UserRole } from '../models/User.js';

// Promote a chat user to group admin so they can make groups
export async function promoteToGroupAdmin(req, res) {
  const { usernameToPromote } = req.body;
  try {
    if (req.user.role !== UserRole.SUPER_ADMIN) return res.status(401).send('Unauthorized to promote user to group admin');

    const userToPromote = await User.findOne({ username: usernameToPromote });
    if (!userToPromote) return res.status(400).send('User not found (promoteToGroupAdmin)');

    userToPromote.role = UserRole.GROUP_ADMIN;
    await userToPromote.save();

    res.status(201).send('User promoted to group admin');
  } catch (err) {
    res.status(400).send('Error promoting user to group admin: ' + err);
  }
}

export async function promoteToSuperAdmin(req, res) {
  const { usernameToPromote } = req.body;
  try {
    if (req.user.role !== UserRole.SUPER_ADMIN) return res.status(401).send('Unauthorized to promote user to super admin');

    const userToPromote = await User.findOne({ username: usernameToPromote });
    if (!userToPromote) return res.status(400).send('User not found (promoteToSuperAdmin)');

    userToPromote.role = UserRole.SUPER_ADMIN;
    await userToPromote.save();

    res.status(201).send('User promoted to super admin');
  } catch (err) {
    res.status(400).send('Error promoting user to super admin: ' + err);
  }
}
