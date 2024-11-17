import app from "./app";
import env from "./util/validateEnv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const port = env.PORT;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

interface GameState {
  currentTurn: "white" | "black";
  players: { [socketId: string]: "white" | "black" };
}

const games: { [roomId: string]: GameState } = {};

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
      // Initialize game state for the room
      if (!games[roomId]) {
        games[roomId] = {
          currentTurn: "white",
          players: {},
        };
      }
      games[roomId].players[socket.id] = "white";
    } else if (updatedRoom && updatedRoom.size === 2) {
      socket.emit("playerColor", "black");
      games[roomId].players[socket.id] = "black";
      const firstPlayerSocketId = [...updatedRoom][0];
      const firstPlayerSocket = io.sockets.sockets.get(firstPlayerSocketId);
      const playerOneName = firstPlayerSocket
        ? firstPlayerSocket.data.playerOneName
        : null;
      socket.emit("receivePlayerOneName", playerOneName);
    }
  });

  socket.on("playerTwoName", (playerTwoName) => {
    socket.data.playerTwoName = playerTwoName;
    const roomName = [...socket.rooms][1];
    io.to(roomName).emit("playerTwoJoined", playerTwoName);
    io.to(roomName).emit("startGame");
  });

  socket.on("move", (data) => {
    const roomName = [...socket.rooms][1];
    const game = games[roomName];

    if (!game) {
      return socket.emit("error", "Invalid game room.");
    }

    const playerColor = game.players[socket.id];
    if (playerColor !== game.currentTurn) {
      return socket.emit("invalidMove", "It's not your turn");
    }

    socket.to(roomName).emit("move", data);
    game.currentTurn = game.currentTurn === "white" ? "black" : "white";
    io.to(roomName).emit("currentTurn", game.currentTurn);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    // Remove the player from the room's game state
    for (const roomId in games) {
      const game = games[roomId];
      if (game.players[socket.id]) {
        delete game.players[socket.id];
        // If no players are left, delete the game state
        if (Object.keys(game.players).length === 0) {
          delete games[roomId];
        }
      }
    }
  });
});

mongoose
  .connect(env.MONGO_CONNECTION_STRING)
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(console.error);
