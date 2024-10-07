import { Router } from 'express';
import { createChannel, deleteChannel, banUser, uploadFile, getChannelDetails } from '../controllers/channelController.js';
import tokenAuth from '../middlewares/tokenAuthMiddleware.js';  // User must be authenticated
import upload from '../config/multerConfig.js';  // Multer for file uploads

const router = Router();

// Create a new channel within a group
router.post('/createChannel', tokenAuth, createChannel);

// Delete a channel in a group
router.post('/deleteChannel', tokenAuth, deleteChannel);

// Ban a user from a channel
router.post('/banUser', tokenAuth, banUser);

// Endpoint for uploading a file using multer
router.post('/uploadFile', tokenAuth, upload.single('file'), uploadFile);
  
// Load a channel by ID
router.post('/details', tokenAuth, getChannelDetails);

export default router;
