import app from "./app";
import env from "./util/validateEnv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import {
  addPlayerOne as addPlayerOneService,
  addPlayerTwo as addPlayerTwoService,
  startGame as startGameService,
  createRematch as createRematchService,
  getCurrentGameState,
  updateGameState,
} from "./services/gameService";
import { InMemoryGameState } from "./models/gameInterface";

const port = env.PORT;
const server = http.createServer(app);
const io = new Server(server);

const games: { [key: string]: InMemoryGameState } = {};

io.on("connection", (socket) => {
  socket.on("createGame", async (playerOneName, userId, gameId) => {
    try {
      const playerOne = {
        userId,
        name: playerOneName,
        color: "white",
      };

      await addPlayerOneService(gameId, playerOne);

      socket.data.userId = userId;

      games[gameId] = {
        gameId,
        fen: "start",
        gameStarted: false,
        playerOne: {
          userId,
          name: playerOneName,
          color: "white",
        },
        playerTwo: null,
        moves: [],
        currentTurn: "white",
        status: "in_progress",
        result: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        playerOneSocketId: socket.id,
        playerTwoSocketId: null,
        rematchRequestedByPlayerOne: false,
        rematchRequestedByPlayerTwo: false,
        winner: null,
      };

      socket.emit("gameCreated", { gameId });
    } catch (error) {
      console.error("Error creating game:", error);
      socket.emit("error", "Unable to create game.");
    }
  });

  socket.on("joinGame", async (gameId, userId, playerName) => {
    try {
      let game = games[gameId];
      if (!game) {
        const dbGame = await getCurrentGameState(gameId);
        if (!dbGame) {
          return socket.emit("error", "Game not found.");
        }

        // Initialize in-memory state from the retrieved game
        games[gameId] = {
          gameId: dbGame.gameId,
          fen: dbGame.fen,
          gameStarted: dbGame.gameStarted,
          playerOne: {
            userId: dbGame.playerOne?.userId || "",
            name: dbGame.playerOne?.name || "anonymous",
            color: dbGame.playerOne?.color || "white",
          },
          playerTwo: dbGame.playerTwo
            ? {
                userId: dbGame.playerTwo.userId || "",
                name: dbGame.playerTwo.name || "anonymous",
                color: dbGame.playerTwo.color || "black",
              }
            : null,
          moves: dbGame.moves,
          currentTurn: dbGame.currentTurn || "white",
          status: dbGame.status,
          result: dbGame.result || null,
          createdAt: dbGame.createdAt,
          updatedAt: dbGame.updatedAt,
          playerOneSocketId: null,
          playerTwoSocketId: null,
          rematchRequestedByPlayerOne: false,
          rematchRequestedByPlayerTwo: false,
          winner: null,
        };
      }
      // Check if player is reconnecting
      if (game.playerOne?.userId === userId) {
        game.playerOneSocketId = socket.id;
        socket.join(gameId);
        if (game.playerOneSocketId) {
          socket.emit("loadGameState", {
            gameId: games[gameId].gameId,
            fen: games[gameId].fen,
            gameStarted: games[gameId].gameStarted,
            playerOne: games[gameId].playerOne,
            playerTwo: games[gameId].playerTwo,
            moves: games[gameId].moves,
            currentTurn: games[gameId].currentTurn,
            status: games[gameId].status,
            result: games[gameId].result,
            rematchRequestedByPlayerOne:
              games[gameId].rematchRequestedByPlayerOne,
            rematchRequestedByPlayerTwo:
              games[gameId].rematchRequestedByPlayerTwo,
            winner: games[gameId].winner,
          });
        }
        return;
      } else if (game.playerTwo?.userId === userId) {
        game.playerTwoSocketId = socket.id;
        socket.join(gameId);
        if (game.playerTwoSocketId) {
          socket.emit("loadGameState", {
            gameId: games[gameId].gameId,
            fen: games[gameId].fen,
            gameStarted: games[gameId].gameStarted,
            playerOne: games[gameId].playerOne,
            playerTwo: games[gameId].playerTwo,
            moves: games[gameId].moves,
            currentTurn: games[gameId].currentTurn,
            status: games[gameId].status,
            result: games[gameId].result,
            rematchRequestedByPlayerOne:
              games[gameId].rematchRequestedByPlayerOne,
            rematchRequestedByPlayerTwo:
              games[gameId].rematchRequestedByPlayerTwo,
            winner: games[gameId].winner,
          });
        }
        return;
      }
      if (!game.playerTwo) {
        game.playerTwo = {
          userId,
          name: playerName || "anonymous",
          color: "black",
        };
        game.playerTwoSocketId = socket.id;

        await addPlayerTwoService(gameId, game.playerTwo);

        socket.join(gameId);

        socket.emit("playerColor", "black");
        const playerOneName = game.playerOne?.name || "anonymous";
        const playerOneUserId = game.playerOne?.userId || "";
        socket.emit("receivePlayerOneInfo", {
          playerOneName,
          playerOneUserId,
        });
      } else {
        socket.emit("error", "Game is already full. Please try another game.");
      }
    } catch (error) {
      console.error("Error joining game:", error);
      socket.emit("error", "Unable to join the game.");
    }
  });

  socket.on("startGame", async (gameId, playerTwoName, playerTwoId) => {
    const game = games[gameId];
    if (!game) {
      return socket.emit("error", "Game not found.");
    }

    games[gameId] = {
      ...games[gameId],
      gameStarted: true,
    };

    if (playerTwoId) {
      game.playerTwo = {
        userId: playerTwoId,
        name: playerTwoName,
        color: "black",
      };
      game.playerTwoSocketId = socket.id;
      io.to(gameId).emit("playerTwoJoined", {
        playerTwoName,
        playerTwoId,
      });
      const playerTwo = {
        userId: playerTwoId,
        name: playerTwoName,
        color: "black",
      };

      await addPlayerTwoService(gameId, playerTwo);
    }
    await startGameService(gameId);
  });

  socket.on("move", (data) => {
    const { gameId, sourceSquare, targetSquare, fen } = data;
    const game = games[gameId];

    if (!game) {
      return socket.emit("error", "Invalid game.");
    }

    // Determine which player is making the move
    const player =
      game.playerOneSocketId === socket.id ? game.playerOne : game.playerTwo;

    if (!player) {
      return socket.emit("error", "Player not found.");
    }

    if (player.color !== game.currentTurn) {
      return socket.emit("invalidMove", "It's not your turn");
    }

    game.fen = fen;
    game.moves.push({
      fen,
      moveNumber: game.moves.length + 1,
      color: player.color,
      from: sourceSquare,
      to: targetSquare,
    });

    game.currentTurn = game.currentTurn === "white" ? "black" : "white";

    updateGameState(gameId, fen, game.currentTurn, game.moves).catch(
      (error) => {
        console.error("Failed to update game state in the database", error);
      }
    );

    io.to(gameId).emit("move", { sourceSquare, targetSquare });
    io.to(gameId).emit("currentTurn", game.currentTurn);
    io.to(gameId).emit("moveData", game.moves);
  });

  socket.on("playerResigns", ({ gameId, isPlayerOne }) => {
    const game = games[gameId];
    if (!game) {
      return;
    }

    if (isPlayerOne) {
      io.in(gameId).emit("gameEndsInResignation", { winner: "Black Wins" });
      game.result = "black_wins";
    } else {
      io.in(gameId).emit("gameEndsInResignation", { winner: "White Wins" });
      game.result = "white_wins";
    }

    game.status = "completed";
  });

  socket.on("rematchAction", async ({ gameId, action, isPlayerOne }) => {
    const game = games[gameId];
    if (!game) {
      return socket.emit("error", "Game not found.");
    }

    switch (action) {
      case "request":
        if (isPlayerOne) {
          game.rematchRequestedByPlayerOne = true;
        } else {
          game.rematchRequestedByPlayerTwo = true;
        }

        io.to(gameId).emit("rematchStatus", {
          requestedByPlayerOne: game.rematchRequestedByPlayerOne,
          requestedByPlayerTwo: game.rematchRequestedByPlayerTwo,
          message: "Waiting for opponent...",
          waiting: true,
        });

        if (
          game.rematchRequestedByPlayerOne &&
          game.rematchRequestedByPlayerTwo
        ) {
          const newGame = await createRematchService(gameId);

          // Add both players to the new game's room
          if (game.playerOneSocketId) {
            io.sockets.sockets
              .get(game.playerOneSocketId)
              ?.join(newGame.gameId);
          }
          if (game.playerTwoSocketId) {
            io.sockets.sockets
              .get(game.playerTwoSocketId)
              ?.join(newGame.gameId);
          }

          // Update the in-memory game state for the new game
          games[newGame.gameId] = {
            ...games[gameId],
            gameId: newGame.gameId,
            fen: "start",
            moves: [],
            currentTurn: "white",
            rematchRequestedByPlayerOne: false,
            rematchRequestedByPlayerTwo: false,
            result: null,
          };

          // Notify both players of the new game
          io.to(newGame.gameId).emit("startNewGame", newGame.gameId);
        }
        break;

      case "decline":
        game.rematchRequestedByPlayerOne = false;
        game.rematchRequestedByPlayerTwo = false;
        io.in(gameId).emit("rematchStatus", {
          requestedByPlayerOne: false,
          requestedByPlayerTwo: false,
          message: "Match Declined",
          waiting: false,
        });
        break;

      default:
        console.error("Invalid action received:", action);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    for (const gameId in games) {
      const game = games[gameId];
      if (game.playerOneSocketId === socket.id) {
        game.playerOneSocketId = null;
      } else if (game.playerTwoSocketId === socket.id) {
        game.playerTwoSocketId = null;
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
