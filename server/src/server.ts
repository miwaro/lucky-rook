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
  fen: string;
  players: {
    [userId: string]: {
      socketId: string | null;
      color: "white" | "black";
      name: string;
    };
  };
}

const games: { [roomId: string]: GameState } = {};

io.on("connection", (socket) => {
  socket.on("createRoom", async (playerOneName, userId) => {
    try {
      const roomId = uuidv4();

      const playerOne = {
        userId,
        name: playerOneName,
        color: "white",
      };

      await createRoomService(roomId, playerOne);

      socket.data.userId = userId;

      games[roomId] = {
        currentTurn: "white",
        fen: "start",
        players: {
          [userId]: {
            socketId: socket.id,
            color: "white",
            name: playerOneName,
          },
        },
      };

      socket.emit("roomCreated", { roomId });
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("error", "Unable to create game.");
    }
  });

  socket.on("joinRoom", async (roomId, userId, playerName) => {
    try {
      // Check if player is reconnecting
      if (games[roomId]?.players[userId]) {
        const playerData = games[roomId].players[userId];
        playerData.socketId = socket.id;

        await socket.join(roomId);
        socket.emit("playerColor", playerData.color);

        const game = games[roomId];
        if (game) {
          socket.emit("gameState", {
            fen: game.fen,
            currentTurn: game.currentTurn,
          });
        }
      } else {
        const room = io.sockets.adapter.rooms.get(roomId);

        if (room && room.size >= 2) {
          return socket.emit("error", "Room is full. Please try another room.");
        }

        await socket.join(roomId);

        if (room && room.size === 1) {
          socket.emit("playerColor", "white");
          games[roomId].players[userId] = {
            socketId: socket.id,
            color: "white",
            name: playerName,
          };
        } else if (room && room.size === 2) {
          socket.emit("playerColor", "black");
          games[roomId].players[userId] = {
            socketId: socket.id,
            color: "black",
            name: playerName,
          };

          const playerOneUserId = Object.keys(games[roomId].players).find(
            (id) => games[roomId].players[id].color === "white"
          );

          if (playerOneUserId) {
            const playerOneName = games[roomId].players[playerOneUserId].name;
            socket.emit("receivePlayerOneName", playerOneName);
          }
        }
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
    const { roomId, sourceSquare, targetSquare, fen } = data;

    if (!game) {
      return socket.emit("error", "Invalid game room.");
    }

    const playerColor = Object.values(game.players).find(
      (player) => player.socketId === socket.id
    )?.color;

    if (playerColor !== game.currentTurn) {
      return socket.emit("invalidMove", "It's not your turn");
    }

    game.fen = fen;
    socket.to(roomName).emit("move", { sourceSquare, targetSquare });
    game.currentTurn = game.currentTurn === "white" ? "black" : "white";
    io.to(roomName).emit("currentTurn", game.currentTurn);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    for (const roomId in games) {
      const game = games[roomId];
      for (const userId in game.players) {
        if (game.players[userId].socketId === socket.id) {
          game.players[userId].socketId = null;
          break;
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
