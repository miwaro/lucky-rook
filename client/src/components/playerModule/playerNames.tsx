import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { setIsGameOver, setResult, updateRematchState } from "../../features/game/gameSlice";
import getSocketInstance from "../../socket";
import ResignButton from "../ui/resign-btn";
import { Tooltip } from "@mui/material";

const PlayerNames: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const socket = useMemo(() => getSocketInstance(), []);

  const playerId = localStorage.getItem("playerId");

  const {
    boardOrientation,
    isGameOver,
    rematch: { requestedByPlayerOne, requestedByPlayerTwo, message: rematchMessage, waiting },
  } = useSelector((state: RootState) => state.game);

  const {
    isPlayerOne,
    isPlayerTwo,
    isPlayerOneConnected,
    isPlayerTwoConnected,
    playerOneName,
    playerOneId,
    playerTwoName,
    playerTwoId,
    receivedPlayerOneName,
    receivedPlayerTwoName,
  } = useSelector((state: RootState) => state.player);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    socket.on("gameEndsInResignation", (winner: { winner: string }) => {
      dispatch(setIsGameOver(true));
      dispatch(setResult(winner.winner));
    });

    socket.on("rematchStatus", (status) => {
      dispatch(updateRematchState(status));
    });

    return () => {
      socket.off("gameEndsInResignation");
      socket.off("rematchStatus");
    };
  }, [socket, dispatch]);

  const handleRematch = () => {
    socket.emit("rematchAction", { gameId, action: "request", isPlayerOne });
  };

  const handleDeclineRematch = () => {
    socket.emit("rematchAction", { gameId, action: "decline", isPlayerOne });
  };

  const renderRematchButtons = () => {
    if (!requestedByPlayerOne && !requestedByPlayerTwo) {
      return (
        <div className="flex flex-col gap-3">
          <motion.button whileTap={{ scale: 0.97 }} className="bg-stone-900 p-1 rounded-md" onClick={handleRematch}>
            Rematch
          </motion.button>
          <div>{rematchMessage !== "Rematch" && rematchMessage}</div>
        </div>
      );
    }

    if ((isPlayerOne && requestedByPlayerTwo) || (isPlayerTwo && requestedByPlayerOne)) {
      return (
        <div className="flex justify-between">
          <Tooltip title="accept">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="bg-green-950 rounded-md p-3 mx-4"
              onClick={handleRematch}
            >
              ✔
            </motion.button>
          </Tooltip>

          <Tooltip title="decline">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="bg-stone-950 rounded-md p-3 mx-4"
              onClick={handleDeclineRematch}
            >
              ✖
            </motion.button>
          </Tooltip>
        </div>
      );
    }

    return (
      <div>
        <span>{rematchMessage}</span>
        {waiting && (
          <Tooltip title="decline">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="bg-stone-900 rounded-md p-3 ml-3"
              onClick={handleDeclineRematch}
            >
              ✖
            </motion.button>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 p-3 items-center">
      <div className="ml-8 border-4 p-3 m-3 border-stone-900 rounded">
        <div className="flex justify-center gap-3 mb-3">
          <div className="h-20 w-16 border-2 border-stone-950  rounded-md  bg-stone-800"></div>
          <div className="h-20 w-16 border-2 border-stone-950 rounded-md bg-stone-800"></div>
          <div className="h-20 w-16 border-2 border-stone-950 rounded-md bg-stone-800"></div>
        </div>
        <div>
          {boardOrientation === "white" ? (
            <div className="flex gap-2 items-center border-2 bg-stone-900/30 rounded-md p-2 backdrop-blur-lg">
              <div className={`w-2 h-2 rounded-full ${isPlayerTwoConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <h2 className="text-center text-stone-100 font-semibold">{receivedPlayerTwoName || playerTwoName}</h2>
            </div>
          ) : (
            <div className="flex gap-2 items-center border-2 bg-stone-900/30 rounded-md p-2 backdrop-blur-lg">
              <div className={`w-2 h-2 rounded-full ${isPlayerOneConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <h2 className="text-center text-stone-100 font-semibold">{receivedPlayerOneName || playerOneName}</h2>
            </div>
          )}

          {!isGameOver && (
            <div className="flex justify-center">
              {boardOrientation === "white" && isPlayerOne && (
                <ResignButton
                  socket={socket}
                  gameId={gameId}
                  playerId={playerId}
                  playerOneId={playerOneId}
                  playerTwoId={playerTwoId}
                />
              )}
              {boardOrientation === "black" && isPlayerTwo && (
                <ResignButton
                  socket={socket}
                  gameId={gameId}
                  playerId={playerId}
                  playerOneId={playerOneId}
                  playerTwoId={playerTwoId}
                />
              )}
            </div>
          )}

          {isGameOver && (
            // <div className="flex gap-4 items-center border-2 bg-stone-900/30 rounded-md p-3 backdrop-blur-lg">
            <div className="flex justify-center p-3 m-3">{renderRematchButtons()}</div>
          )}
        </div>
        {boardOrientation === "black" ? (
          <div className="flex gap-2 items-center border-2 bg-stone-900/30 rounded-md p-2 backdrop-blur-lg">
            <div className={`w-2 h-2 rounded-full ${isPlayerTwoConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <h2 className="text-center text-stone-100 font-semibold">{receivedPlayerTwoName || playerTwoName}</h2>
          </div>
        ) : (
          <div className="flex gap-2 items-center border-2 bg-stone-900/30 rounded-md p-2 backdrop-blur-lg">
            <div className={`w-2 h-2 rounded-full ${isPlayerOneConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <h2 className="text-center text-stone-100 font-semibold">{receivedPlayerOneName || playerOneName}</h2>
          </div>
        )}
        <div className="flex justify-center gap-3 mt-3">
          <div className="h-20 w-16 border-2 border-stone-950  rounded-md  bg-stone-800"></div>
          <div className="h-20 w-16 border-2 border-stone-950 rounded-md bg-stone-800"></div>
          <div className="h-20 w-16 border-2 border-stone-950 rounded-md bg-stone-800"></div>
        </div>
      </div>
    </div>
  );
};

export default PlayerNames;
