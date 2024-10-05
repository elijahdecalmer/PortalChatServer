import { User, UserRole } from '../models/User.js';
import { Report } from '../models/Report.js';

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

    res.status(201).send({ success: true, message: 'User promoted to super admin'});
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

// api/admin/allUsers
export async function getAllUsers(req, res) {
  try {
    if (req.user.role !== UserRole.SUPER_ADMIN)
      return res.status(401).send({ success: false, message: 'Unauthorized to get all users' });

    const users = await User.find().populate('reports');
    res.status(200).send({ success: true, users });
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error fetching all users: ' + err });
  }
}

// api/admin/reportUser
export async function reportUser(req, res) {
  const { userId, message } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send({ success: false, message: 'User not found' });
    }

    if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.GROUP_ADMIN) {
      return res.status(401).send({ success: false, message: 'Unauthorized to report user' });
    }

    // Create a new report document
    const report = new Report({
      message,
      reporter: req.user.username, // assuming req.user contains the logged-in user data
    });

    await report.save(); // Save the report

    // Push the report's ObjectId into the user's reports array
    user.reports.push(report._id);

    await user.save(); // Save the updated user with the new report reference

    res.status(201).send({ success: true, message: 'User reported successfully' });
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error reporting user: ' + err });
  }
}
