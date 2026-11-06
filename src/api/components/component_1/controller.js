import * as db from './routes.js';
import * as chat from './chat_routes.js'
import express from 'express';
import cors from 'cors';
import http from 'http'; // 1. IMPORT HTTP MODULE
import decryptMiddleware from './encrypt.js';
import { Server } from 'socket.io';

const app = express();
const port = 3007;

// 2. CREATE HTTP SERVER FROM EXPRESS APP
const server = http.createServer(app);

// 3. ATTACH SOCKET.IO TO THE HTTP SERVER
const io = new Server(server, {
  cors: {
   origin: "http://localhost:8082", // Expo web origin
    methods: ["GET", "POST"],
   credentials: true
  }
});

// 1. Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1.5. Socket connection listener
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);
  
  socket.on('send_message', async (data) => {
    try {
      // data contains { userId, text } sent from React Native
      const fullMessage = await chat.saveChatMessage(data.userId, data.text);
      
      // Emit the saved message (with ID and First Name) to ALL connected clients
      io.emit('receive_message', fullMessage);
    } catch (error) {
      console.error('Socket message save error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});
// 2. Base & Unencrypted Routes (Placed BEFORE decryptMiddleware)
app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

console.log("🚨 TRACKER: The NEW controller.js is loaded!");

// Login endpoint
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
app.get('/chat/history', chat.getChatHistory , (req,res) =>{
  res.json({message:"chat history loaded"});
  if (!chat.getChatHistory){
    res.json({error:400});
  }
});
// 3. Encrypted Routes
app.use('/', decryptMiddleware);
app.get('/users', db.getUsers);
app.post('/users', db.createEmployee);
app.get('/eeid', db.gett_eeid);
app.post('/eeid', db.post_eeid);

// 4. LISTEN ON 'server', NOT 'app'
server.listen(port, () => {
  console.log(`App & Socket.IO running on port ${port}.`);
});