import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';  // Needed for ES module path handling
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import channelRoutes from './routes/channelRoutes.js';

// Initialize express app
const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/channels', channelRoutes);

// Serve uploaded media
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/media', express.static(path.join(__dirname, 'uploads/media')));

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;  // Export the app for testing
