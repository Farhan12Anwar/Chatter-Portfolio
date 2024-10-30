// server.js

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const Message = require('./public/models/Message'); // Import the Message model

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Connect to MongoDB
mongoose.connect('mongodb+srv://anwarfarhan339:cannonx100@cluster0.e121f2b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
// Check if MongoDB connection is successful
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// const botName = 'Auction Bot';

// Run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', async ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Load previous messages for the room
    const messages = await Message.find({ room }).sort({ _id: 1 });

    // Send previous messages to the user
    messages.forEach((message) => {
      socket.emit('message', message);
    });

    // Welcome current user
    // socket.emit('message', formatMessage(botName, 'Welcome to the Auction Chat'));

    // Broadcast when a user connects
    // socket.broadcast
    //   .to(user.room)
    //   .emit('message', formatMessage(botName, `${user.username} has joined the chat`));

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chat message
  socket.on('chatMessage', async (msg) => {
    const user = getCurrentUser(socket.id);
    const message = formatMessage(user.username, msg);

    // Save the message to the database
    await Message.create({
      username: user.username,
      room: user.room,
      text: message.text,
      time: message.time,
    });

    // Emit the message to the room
    io.to(user.room).emit('message', message);
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// app.get('/api/products', (req, res) => {
//     const data = [
//         { name: "affan", price: "book me in just 150₹", photo: "/assets/affan.png" },
//         { name: "faizan", price: "book me in just 250₹ + GST + CGST", photo: "/assets/f.png" },
//         // { name: "farhan", price: "book me in just 999₹", photo: "/assets/farh.png" },
//     ];
//     res.json(data);
// });

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
