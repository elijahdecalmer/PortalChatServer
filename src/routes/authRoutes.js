import { Router } from 'express';
import { register, login, deleteAccount } from '../controllers/authController.js';
import tokenAuth from '../middlewares/tokenAuthMiddleware.js';
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/deleteAccount', tokenAuth, deleteAccount);

export default router;
