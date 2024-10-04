import { User, UserRole } from '../models/User.js';

// Promote a chat user to group admin so they can make groups
// api/admin/promoteToGroupAdmin
export async function promoteToGroupAdmin(req, res) {
  const { usernameToPromote } = req.body;
  try {
    if (req.user.role !== UserRole.SUPER_ADMIN) return res.status(401).send({ success: false, message: 'Unauthorized to promote user to group admin'});

    const userToPromote = await User.findOne({ username: usernameToPromote });
    if (!userToPromote) return res.status(400).send({ success: false, message: 'User not found (promoteToGroupAdmin)'});

    userToPromote.role = UserRole.GROUP_ADMIN;
    await userToPromote.save();

    res.status(201).send({ success: true, message: 'User promoted to group admin'});
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error promoting user to group admin: ' + err});
  }
}

// Promote any user
// api/admin/promoteToSuperAdmin
export async function promoteToSuperAdmin(req, res) {
  const { usernameToPromote } = req.body;
  try {
    if (req.user.role !== UserRole.SUPER_ADMIN) return res.status(401).send({ success: false, message: 'Unauthorized to promote user to super admin'});

    const userToPromote = await User.findOne({ username: usernameToPromote });
    if (!userToPromote) return res.status(400).send({ success: false, message: 'User not found (promoteToSuperAdmin)'});

    userToPromote.role = UserRole.SUPER_ADMIN;
    await userToPromote.save();

    res.status(201).send({ succes: true, message: 'User promoted to super admin'});
  } catch (err) {
    console.log("Error promoting user to super admin: " + err);
    res.status(400).send({ success: false, message: 'Error promoting user to super admin: ' + err});
  }
}

// Delete a user's entire account
export async function deleteAccount(req, res) {
  const { userId } = req.body;
  try {
    const user = await User.findOneAndDelete({ _id: userId });
    if (!user) return res.status(400).send({ success: false, message: 'User not found'});

    if (req.user.role !== UserRole.SUPER_ADMIN) return res.status(401).send({ success: false, message: 'Unauthorized to delete user'});

    res.status(201).send({ success: true, message: 'User deleted' });
  }
  catch (err) {
    res.status(400).send({ success: false, message: 'Error deleting user: ' + err });
  }
}
