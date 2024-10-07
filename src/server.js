import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeSockets } from './sockets.js';  // Import socket logic
import { ExpressPeerServer } from 'peer';

// Initialize express app
const app = express();
const port = process.env.PORT || 4000;
const host = '0.0.0.0'; // Listen on all network interfaces
const httpServer = createServer(app);


// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Enable CORS to allow from localhost:4200
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true
}));



const peerServer = ExpressPeerServer(httpServer, {
    debug: true,
});

app.use('/peerjs', peerServer);

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST']
    }
});

app.set('socketio', io);


// Routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/channels', channelRoutes);

// Serve uploaded media
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads/media', express.static(path.join(__dirname, 'uploads/media')));

// Initialize Socket.io connection
initializeSockets(io);

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(port, host, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

export default app;
