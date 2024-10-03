import { User } from '../models/User.js';
// Register user (with token generation)
export async function register(req, res) {
  const { name, username, password } = req.body;
  try {
    const user = new User({ name, username, password });
    await user.save();
    // return the whole user object, without the password
    let userMinusPassword = user.toObject();
    delete userMinusPassword.password;
    res.status(201).send(userMinusPassword);
  } catch (err) {
    res.status(400).send('Error registering user: ' + err);
  }
}

// Login user (returning user including token)
export async function login(req, res) {
  const { username, password } = req.body;
  try {
    const user = await findOne({ username });
    if (!user) return res.status(400).send('User not found');

    if (user.password !== password) {
      return res.status(400).send('Invalid password');
    }
    // return the whole user object, without the password
    let userMinusPassword = user.toObject();
    delete userMinusPassword.password;
    res.status(201).send(userMinusPassword);
  } catch (err) {
    res.status(400).send('Error logging in: ' + err);
  }
}
