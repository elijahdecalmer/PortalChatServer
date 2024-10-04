import { User } from '../models/User.js';

export async function getUserProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select('-password'); // Exclude the password
    if (!user) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }
    res.status(200).send({ success: true, message: 'User profile retrieved successfully', user });
  } catch (err) {
    res.status(500).send({ success: false, message: `Error fetching profile: ${err.message}` });
    console.error('Error fetching user profile:', err);
  }
}

export const updateUserAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    user.profilePictureRef = req.file.path; // Store the avatar file path
    await user.save();

    res.status(200).send({
      success: true,
      message: 'Avatar updated successfully',
      avatarPath: user.profilePictureRef,
    });
  } catch (err) {
    res.status(500).send({ success: false, message: `Error updating avatar: ${err.message}` });
    console.error('Error updating avatar:', err);
  }
};

export const updateUserBio = async (req, res) => {
  const { bio } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    user.bio = bio; // Update the bio
    await user.save();

    res.status(200).send({
      success: true,
      message: 'Bio updated successfully',
      bio: user.bio,
    });
  } catch (err) {
    res.status(500).send({ success: false, message: `Error updating bio: ${err.message}` });
    console.error('Error updating bio:', err);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    await user.remove(); // Delete the user account
    res.status(200).send({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).send({ success: false, message: `Error deleting user: ${err.message}` });
    console.error('Error deleting user:', err);
  }
};
