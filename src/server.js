const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const authRoutes = require('./routes/authRoutes');
const path = require('path');

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
app.use('/media', express.static(path.join(__dirname, 'uploads/media')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
  