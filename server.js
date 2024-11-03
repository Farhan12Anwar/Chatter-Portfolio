const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
const Message = require("./public/models/Message");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Load previous messages for the room
    const messages = await Message.find({ room }).sort({ _id: 1 });

    // Send previous messages to the user
    messages.forEach((message) => {
      socket.emit("message", message);
    });

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chat message
  socket.on("chatMessage", async (msg) => {
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
    io.to(user.room).emit("message", message);
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on Port ${PORT}`));
