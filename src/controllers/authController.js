import { User, UserRole } from '../models/User.js';
// Register user (with token generation)
export async function register(req, res) {
  const { email, username, password, role } = req.body;
  try {
    let userRole = role;
    if (!role) userRole = UserRole.CHAT_USER;
    const user = new User({ email, username, password, role });
    await user.save();
    // return the whole user object, without the password
    let userMinusPassword = user.toObject();
    delete userMinusPassword.password;
    res.status(201).send({ success: true, user: userMinusPassword});
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error registering user: ' + err});
  }
}

// Login user (returning user including token)
export async function login(req, res) {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send({ success: false, message: 'User not found'});

    if (user.password !== password) {
      return res.status(400).send({ success: false, message: 'Invalid password'});
    }
    // return the whole user object, without the password
    let userMinusPassword = user.toObject();
    delete userMinusPassword.password;
    res.status(201).send({ success: true, user: userMinusPassword});
  } catch (err) {
    res.status(400).send({ success: false, message: 'Error logging in: ' + err});
  }
}

// Delete account
export async function deleteAccount(req, res) {
  try {
    const user = await User.findOneAndDelete({ username: req.user.username });
    if (!user) return res.status(400).send({ success: false, message: 'User not found'});
    res.status(201).send({ success: true, message: 'User deleted' });
  }
  catch (err) {
    res.status(400).send({ success: false, message: 'Error deleting user: ' + err });
  }
}
