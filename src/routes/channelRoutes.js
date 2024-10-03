import { Router } from 'express';
import { createChannel, deleteChannel } from '../controllers/channelController.js';
import tokenAuth from '../middlewares/tokenAuthMiddleware.js';  // User must be authenticated
const router = Router();

// Create a new channel within a group
router.post('/createChannel', tokenAuth, createChannel);

// Delete a channel in a group
router.post('/deleteChannel', tokenAuth, deleteChannel);


export default router;
