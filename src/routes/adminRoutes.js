import { Router } from 'express';
import { promoteToGroupAdmin, promoteToSuperAdmin, deleteAccount } from '../controllers/adminController.js';
import tokenAuth from '../middlewares/tokenAuthMiddleware.js';  // Ensure user is authenticated
const router = Router();

// Promote a user to Group Admin (Super Admin only)
router.post('/promoteToGroupAdmin', tokenAuth, promoteToGroupAdmin);

// Promote a user to Super Admin (Super Admin only)
router.post('/promoteToSuperAdmin', tokenAuth, promoteToSuperAdmin);

// Delete a user's entire account (Super Admin only)
router.post('/deleteUser', tokenAuth, deleteAccount);

export default router;
