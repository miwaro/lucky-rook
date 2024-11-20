import app from "./app";
import env from "./util/validateEnv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import {
  createRoom as createRoomService,
  addPlayerTwoAndCreateGame,
} from "./services/gameService";

const port = env.PORT;

const server = http.createServer(app);
const io = new Server(server);

interface GameState {
  currentTurn: "white" | "black";
  players: { [socketId: string]: "white" | "black" };
}

const games: { [roomId: string]: GameState } = {};

io.on("connection", (socket) => {
  socket.on("createRoom", async (playerOneName, id) => {
    try {
      const roomId = uuidv4();

      const playerOne = {
        userId: id,
        name: playerOneName,
        color: "white",
      };

      await createRoomService(roomId, playerOne);

      socket.data.playerOneName = playerOneName;

      games[roomId] = { currentTurn: "white", players: {} };

      socket.emit("roomCreated", { roomId });
    } catch (error) {
      socket.emit("error", "Unable to create game.");
    }
  });

  socket.on("joinRoom", async (roomId) => {
    try {
      const room = io.sockets.adapter.rooms.get(roomId);

      if (room && room.size >= 2) {
        return socket.emit("error", "Room is full. Please try another room.");
      }

      await socket.join(roomId);

      const updatedRoom = io.sockets.adapter.rooms.get(roomId);

      if (updatedRoom && updatedRoom.size === 1) {
        socket.emit("playerColor", "white");

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
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", "Unable to join the room.");
    }
  });

  socket.on("playerTwoInfo", async (data) => {
    const { roomId, playerTwoName, playerTwoId } = data;

    try {
      const playerTwo = {
        userId: playerTwoId,
        name: playerTwoName,
        color: "black",
      };

      const gameId = uuidv4();
      await addPlayerTwoAndCreateGame(gameId, roomId, playerTwo);
      io.to(roomId).emit("playerTwoJoined", playerTwoName);
      io.to(roomId).emit("startGame", gameId);
    } catch (error) {
      console.error("Error updating Player Two:", error);
      socket.emit("error", "Unable to add Player Two.");
    }
    socket.data.playerTwoName = playerTwoName;
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
    for (const roomId in games) {
      const game = games[roomId];
      if (game.players[socket.id]) {
        delete game.players[socket.id];
        if (Object.keys(game.players).length === 0) {
          delete games[roomId];
        }
      }
    }
  });
});

mongoose
  .connect(env.MONGO_CONNECTION_STRING, {
    maxPoolSize: 10,
  })
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(console.error);
