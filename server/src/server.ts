import app from "./app";
import env from "./util/validateEnv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import {
  createGame as createGameService,
  updatePlayerTwo,
} from "./services/gameService";
import Game from "./models/game";

const port = env.PORT;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

interface GameState {
  gameId: string;
  currentTurn: "white" | "black";
  players: { [socketId: string]: "white" | "black" };
}

const games: { [roomId: string]: GameState } = {};

io.on("connection", (socket) => {
  socket.on("createRoom", async (playerOneName) => {
    try {
      const roomId = uuidv4();
      const gameId = uuidv4(); // TODO: possibly remove and fetch gameId instead

      const playerOne = {
        userId: socket.id,
        name: playerOneName,
        color: "white",
      };

      socket.data.playerOneName = playerOneName;

      // Save the new game to the database
      await createGameService(roomId, playerOne);

      // Store game info in the server memory
      games[roomId] = { gameId, currentTurn: "white", players: {} };

      // Emit roomId and gameId back to the client
      socket.emit("roomCreated", { roomId, gameId });
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

      const game = await Game.findOne({ roomId: roomId.trim() });
      if (!game) {
        throw new Error("Game not found for roomId: " + roomId);
      }
      const gameId = game.gameId;
      if (updatedRoom && updatedRoom.size === 1) {
        socket.emit("playerColor", "white");

        if (!games[roomId]) {
          games[roomId] = {
            gameId: gameId,
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

  socket.on("playerTwoName", async (data) => {
    const { roomId, playerTwoName } = data;

    try {
      const game = await Game.findOne({ roomId: roomId.trim() });
      if (!game) {
        throw new Error("Game not found for roomId: " + roomId);
      }

      const gameId = game.gameId;

      const playerTwo = {
        userId: socket.id,
        name: playerTwoName,
        color: "black",
      };

      await updatePlayerTwo(roomId, gameId, playerTwo);
      io.to(roomId).emit("playerTwoJoined", playerTwoName);
      io.to(roomId).emit("startGame");
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
  .connect(env.MONGO_CONNECTION_STRING)
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(console.error);
