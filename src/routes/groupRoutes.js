import { Router } from 'express';
import { createGroup, getGroupDetails, getAllGroups, deleteGroup, createChannel, deleteChannel, getMyGroups } from '../controllers/groupController.js';
import tokenAuth from '../middlewares/tokenAuthMiddleware.js';  // User must be authenticated
const router = Router();

// Create a new group (Group Admin or Super Admin)
router.post('/createGroup', tokenAuth, createGroup);

// Get all groups the user belongs to
router.post('/myGroups', tokenAuth, getMyGroups);

// Get all groups that exist, so a user might request to join
router.post('/all', tokenAuth, getAllGroups);

// Get details of a specific group
router.post('/details', tokenAuth, getGroupDetails);

// Delete a group (only Group Admin or Super Admin)
router.post('/deleteGroup', tokenAuth, deleteGroup);

// Create a new channel within a group
router.post('/createChannel', tokenAuth, createChannel);

// Delete a channel in a group
router.post('/deleteChannel', tokenAuth, deleteChannel);

export default router;
