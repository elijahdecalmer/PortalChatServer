const User = require('../models/User');

// Middleware to authenticate using token
// The token is used to verify that the user exists
// Then the user object is attached to the request object
// This allows for simpler requests to the server, because the user does not have to send their whole user object
// This middleware allows the successive functions and routes to be able to perform user specific actions
const tokenAuth = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).send('Token required');
  }

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).send('Invalid token');
    }

    req.user = user; // Attach user to request object
    next(); // Continue to the next middleware or route handler
  } catch (err) {
    res.status(500).send('Could not authenticate user based on token (tokenAuthMiddleware)');
  }
};

module.exports = tokenAuth;
