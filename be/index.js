const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


app.get("/", (req, res) => {
  res.send("Server is running");
});

const users={}; //username rkhnge
io.on("connection", (socket) => {
  console.log("User ppconnected:", socket.id);

  socket.on("join-room", ({roomId}) => {
    users[socket.id] = { roomId, userName: socket.id }; 
    socket.join(roomId);
    console.log(users[socket.id]);
    console.log(`User ${users[socket.id].userName} joined room ${roomId}`);
  });

    socket.on("ppcursor", (data)=>{
    // console.log("pp: ", data);
    data.userName=users[socket.id]? users[socket.id].userName : socket.id;
    socket.to(data.roomId).emit("ppcursor", data);
  });

  socket.on("draw", (data) => {
    socket.to(data.roomId).emit("draw", data);
  });

  socket.on("nameChange", ({ userId, newName, roomId }) => {
    if (users[userId]) {
      users[socket.id].userName = newName;
    }
    socket.broadcast.to(roomId).emit("updateName", { userId, newName });
  });

  socket.on("disconnect", () => {
    const userData = users[socket.id];
    if (userData) {
      io.to(userData.roomId).emit("user-disconnected", socket.id);
      delete users[socket.id];
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
