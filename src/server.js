import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';  // Needed for ES module path handling
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Initialize express app
const app = express();
const port = 4000;

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/auth', authRoutes);

// Serve uploaded media
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/media', express.static(path.join(__dirname, 'uploads/media')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
