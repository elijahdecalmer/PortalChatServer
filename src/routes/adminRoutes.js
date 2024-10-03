import { Router } from 'express';
import { promoteToGroupAdmin, promoteToSuperAdmin, removeUserFromGroup, banUserFromChannel } from '../controllers/adminController';
import tokenAuth from '../middlewares/tokenAuthMiddleware.js';  // Ensure user is authenticated
const router = Router();

// Promote a user to Group Admin (Super Admin only)
router.post('/promote/group-admin', tokenAuth, promoteToGroupAdmin);

// Promote a user to Super Admin (Super Admin only)
router.post('/promote/super-admin', tokenAuth, promoteToSuperAdmin);

export default router;
