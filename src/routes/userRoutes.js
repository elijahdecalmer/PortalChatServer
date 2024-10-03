import { Router } from 'express';
import { getUserProfile, updateUserAvatar, updateUserBio, deleteUser } from '../controllers/userController.js';
import tokenAuth from '../middlewares/tokenAuthMiddleware.js'; // Ensure user is authenticated
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });  // For avatar upload
const router = Router();

// Get user profile
router.post('/profile', tokenAuth, getUserProfile);

// Update user avatar (upload image)
router.post('/avatar', tokenAuth, upload.single('avatar'), updateUserAvatar);

// Update bio 
router.post('/bio', tokenAuth, updateUserBio);

// Delete user account
router.post('/delete', tokenAuth, deleteUser);

export default router;
