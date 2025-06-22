require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const WebSocket = require('ws');
const http = require('http');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const messageRoutes = require('./routes/messages');
const friendRoutes = require('./routes/friends');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes);

const activeConnections = new Map();

wss.on('connection', (ws, req) => {
    const token = req.url.split('token=')[1];
    
    if (!token) {
        ws.close();
        return;
    }

    const jwt = require('jsonwebtoken');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        activeConnections.set(decoded.id, ws);
        
        ws.on('close', () => {
            activeConnections.delete(decoded.id);
        });
        
        ws.on('message', (message) => {
            const data = JSON.parse(message);
            
            if (data.type === 'message') {
                const recipientWs = activeConnections.get(data.data.recipient);
                if (recipientWs) {
                    recipientWs.send(JSON.stringify({
                        type: 'message',
                        data: data.data
                    }));
                }
            } else if (data.type === 'status') {
                activeConnections.forEach((connection, userId) => {
                    if (userId !== decoded.id) {
                        connection.send(JSON.stringify({
                            type: 'status',
                            data: {
                                userId: decoded.id,
                                status: data.data.status
                            }
                        }));
                    }
                });
            }
        });
    } catch (err) {
        ws.close();
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
