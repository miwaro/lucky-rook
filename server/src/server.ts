import app from "./app";
import env from "./util/validateEnv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import {
  createGame as createGameService,
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

const games: { [gameId: string]: GameState } = {};

io.on("connection", (socket) => {
  socket.on("createGame", async (playerOneName, userId, gameId) => {
    try {
      const playerOne = {
        userId,
        name: playerOneName,
        color: "white",
      };

      await createGameService(gameId, playerOne);

      socket.data.userId = userId;

      games[gameId] = {
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

      socket.emit("gameCreated", { gameId });
    } catch (error) {
      console.error("Error creating game:", error);
      socket.emit("error", "Unable to create game.");
    }
  });

  socket.on("joinGame", async (gameId, userId, playerName) => {
    try {
      // Check if player is reconnecting
      if (games[gameId]?.players[userId]) {
        const playerData = games[gameId].players[userId];
        playerData.socketId = socket.id;

        await socket.join(gameId);
        socket.emit("playerColor", playerData.color);

        const game = games[gameId];
        if (game) {
          socket.emit("gameState", {
            fen: game.fen,
            currentTurn: game.currentTurn,
          });
        }
      } else {
        const game = io.sockets.adapter.rooms.get(gameId);

        if (game && game.size >= 2) {
          return socket.emit("error", "Game is full. Please try another game.");
        }

        await socket.join(gameId);

        if (game && game.size === 1) {
          socket.emit("playerColor", "white");
          games[gameId].players[userId] = {
            socketId: socket.id,
            color: "white",
            name: playerName,
          };
        } else if (game && game.size === 2) {
          socket.emit("playerColor", "black");
          games[gameId].players[userId] = {
            socketId: socket.id,
            color: "black",
            name: playerName,
          };

          const playerOneUserId = Object.keys(games[gameId].players).find(
            (id) => games[gameId].players[id].color === "white"
          );

          if (playerOneUserId) {
            const playerOneName = games[gameId].players[playerOneUserId].name;
            socket.emit("receivePlayerOneName", playerOneName);
          }
        }
      }
    } catch (error) {
      console.error("Error joining game:", error);
      socket.emit("error", "Unable to join the game.");
    }
  });

  socket.on("playerTwoInfo", async (data) => {
    const { gameId, playerTwoName, playerTwoId } = data;

    try {
      const playerTwo = {
        userId: playerTwoId,
        name: playerTwoName,
        color: "black",
      };

      await addPlayerTwoAndCreateGame(gameId, playerTwo);
      io.to(gameId).emit("playerTwoJoined", playerTwoName);
    } catch (error) {
      console.error("Error updating Player Two:", error);
      socket.emit("error", "Unable to add Player Two.");
    }
    socket.data.playerTwoName = playerTwoName;
  });

  socket.on("move", (data) => {
    const gameName = [...socket.rooms][1];
    const game = games[gameName];
    const { gameId, sourceSquare, targetSquare, fen } = data;

    if (!game) {
      return socket.emit("error", "Invalid game.");
    }

    const playerColor = Object.values(game.players).find(
      (player) => player.socketId === socket.id
    )?.color;

    if (playerColor !== game.currentTurn) {
      return socket.emit("invalidMove", "It's not your turn");
    }

    game.fen = fen;
    socket.to(gameName).emit("move", { sourceSquare, targetSquare });
    game.currentTurn = game.currentTurn === "white" ? "black" : "white";
    io.to(gameName).emit("currentTurn", game.currentTurn);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    for (const gameId in games) {
      const game = games[gameId];
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
