import { Router } from 'express';
import { getUserProfile, updateUserAvatar, updateUserBio, deleteUser } from '../controllers/userController.js';
import tokenAuth from '../middlewares/tokenAuthMiddleware.js'; // Ensure user is authenticated
const router = Router();
import upload from '../config/multerConfig.js';  // Multer for file uploads


// Get user profile
router.post('/profile', tokenAuth, getUserProfile);

// Update user avatar (upload image)
router.post('/updateAvatar', tokenAuth, upload.single('file'), updateUserAvatar);

// Update bio 
router.post('/bio', tokenAuth, updateUserBio);

// Delete user account
// api/users/delete
router.post('/delete', tokenAuth, deleteUser);


export default router;
