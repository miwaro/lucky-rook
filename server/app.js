const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("createRoom", (playerOneName) => {
    const roomId = uuidv4();
    socket.data.playerOneName = playerOneName;
    socket.emit("roomCreated", roomId);
  });

  socket.on("joinRoom", async (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room.size >= 2) {
      return socket.emit("error", "Room is full. Please try another room."); //TODO: handle this error or implement spectator logic
    }

    await socket.join(roomId);

    const updatedRoom = io.sockets.adapter.rooms.get(roomId);

    if (updatedRoom && updatedRoom.size === 1) {
      socket.emit("playerColor", "white");
    } else if (updatedRoom && updatedRoom.size === 2) {
      socket.emit("playerColor", "black");
      const firstPlayerSocketId = [...updatedRoom][0];
      const playerOneName =
        io.sockets.sockets.get(firstPlayerSocketId).data.playerOneName;
      socket.emit("receivePlayerOneName", playerOneName);
    }
  });

  socket.on("playerTwoName", (playerTwoName) => {
    socket.data.playerTwoName = playerTwoName;
    io.to([...socket.rooms][1]).emit("playerTwoJoined", playerTwoName);
    io.to([...socket.rooms][1]).emit("startGame");
  });

  socket.on("move", (data) => {
    const roomName = [...socket.rooms][1];
    socket.to(roomName).emit("move", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
