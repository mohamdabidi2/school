const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected users
const connectedUsers = new Map();
const messageHistory = [];

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'user_join':
          // Store user information
          connectedUsers.set(ws, {
            userId: message.userId,
            userName: message.userName,
            userRole: message.userRole,
            joinTime: new Date()
          });
          
          // Notify all clients about new user
          broadcast({
            type: 'user_online',
            userId: message.userId,
            userName: message.userName,
            userRole: message.userRole
          });
          
          // Send recent messages to new user
          ws.send(JSON.stringify({
            type: 'message_history',
            messages: messageHistory.slice(-50) // Last 50 messages
          }));
          break;

        case 'message':
          // Store message in history
          const messageWithId = {
            ...message.message,
            id: Date.now().toString(),
            timestamp: new Date()
          };
          messageHistory.push(messageWithId);
          
          // Broadcast message to all connected clients
          broadcast({
            type: 'message',
            message: messageWithId
          });
          break;

        case 'typing':
          // Broadcast typing indicator
          broadcast({
            type: 'typing',
            userId: message.userId,
            userName: message.userName,
            isTyping: message.isTyping
          }, ws); // Don't send to sender
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    const user = connectedUsers.get(ws);
    if (user) {
      // Notify all clients about user leaving
      broadcast({
        type: 'user_offline',
        userId: user.userId
      });
      connectedUsers.delete(ws);
    }
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to GEOX School messaging system'
  }));
});

// Broadcast function
function broadcast(data, excludeWs = null) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
      client.send(JSON.stringify(data));
    }
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    connectedUsers: connectedUsers.size,
    uptime: process.uptime()
  });
});

// Start server
const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { wss, connectedUsers, messageHistory };
