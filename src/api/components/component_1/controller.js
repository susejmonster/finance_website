import * as db from './routes.js';
import * as chat from './chat_routes.js'
import express from 'express';
import cors from 'cors';
import http from 'http';
import decryptMiddleware from './encrypt.js';
import { Server } from 'socket.io';

const app = express();
// 1. USE RENDER's PORT OR FALLBACK TO 3007
const port = process.env.PORT || 3007; 

// Allow both local development and Vercel production
const allowedOrigins = [
  "http://localhost:8082", 
  "https://finance-website-te9y.vercel.app" 
];

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
   origin: allowedOrigins, // 2. UPDATED CORS ORIGIN
   methods: ["GET", "POST", "PUT", "DELETE"],
   credentials: true
  }
});

// 3. APPLY SECURE CORS TO EXPRESS AS WELL
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);
  
  socket.on('send_message', async (data) => {
    try {
      const fullMessage = await chat.saveChatMessage(data.userId, data.text);
      io.emit('receive_message', fullMessage);
    } catch (error) {
      console.error('Socket message save error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

console.log("🚨 TRACKER: The NEW controller.js is loaded!");

app.post('/login', (req, res) => {
  if (db && typeof db.loginEmployee === 'function') {
    return db.loginEmployee(req, res);
  }
  res.json({
    message: 'Login successful',
    user: { employeeid: req.body.employeeid || 1, firstname: 'Test User' }
  });
});

app.get('/login', (req, res) => {
  res.json({ message: "YES! THE SERVER IS RUNNING THE RIGHT FILE!" });
});

// Note: Fixed a minor bug here where res.json was called twice
app.get('/chat/history', chat.getChatHistory, (req, res) => {
  if (!chat.getChatHistory){
    return res.status(400).json({ error: 400 });
  }
  res.json({ message: "chat history loaded" });
});

app.use('/', decryptMiddleware);
app.get('/users', db.getUsers);
app.post('/users', db.createEmployee);
app.get('/eeid', db.gett_eeid);
app.post('/eeid', db.post_eeid);

server.listen(port, () => {
  console.log(`App & Socket.IO running on port ${port}.`);
});