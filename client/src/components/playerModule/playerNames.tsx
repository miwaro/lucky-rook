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
        <div className="flex flex-col">
          <motion.button whileTap={{ scale: 0.97 }} className="bg-stone-900 p-1 rounded-md" onClick={handleRematch}>
            Rematch
          </motion.button>
          {rematchMessage !== "Rematch" && rematchMessage}
        </div>
      );
    }

    if ((isPlayerOne && requestedByPlayerTwo) || (isPlayerTwo && requestedByPlayerOne)) {
      return (
        <>
          <Tooltip title="accept">
            <motion.button whileTap={{ scale: 0.97 }} className="bg-green-950 rounded-md p-3" onClick={handleRematch}>
              ✔
            </motion.button>
          </Tooltip>

          <Tooltip title="decline">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="bg-stone-950 rounded-md p-3"
              onClick={handleDeclineRematch}
            >
              ✖
            </motion.button>
          </Tooltip>
        </>
      );
    }

    return (
      <div>
        <span>{rematchMessage}</span>
        {waiting && (
          <Tooltip title="decline">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="bg-stone-950 rounded-md p-3"
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
      <div className="ml-8 border border-stone-900 rounded p-1">
        <div>
          {boardOrientation === "white" ? (
            <h2 className="text-center border-2 text-stone-950 font-semibold bg-stone-900/30 rounded-md p-3 backdrop-blur-lg">
              {receivedPlayerTwoName || playerTwoName}
            </h2>
          ) : (
            <h2 className="text-center font-semibold border-2 bg-stone-900/30  rounded-md p-3 backdrop-blur-lg">
              {receivedPlayerOneName || playerOneName}
            </h2>
          )}

          <hr />

          {!isGameOver && (
            <>
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
            </>
          )}

          {isGameOver && (
            <div className="flex gap-4 items-center border-2 bg-stone-900/30 rounded-md p-3 backdrop-blur-lg">
              {renderRematchButtons()}
            </div>
          )}
        </div>
        {boardOrientation === "black" ? (
          <h2 className="text-center border-2 text-stone-950 font-semibold bg-stone-900/30 rounded-md p-3 backdrop-blur-lg">
            {receivedPlayerOneName || playerOneName}
          </h2>
        ) : (
          <h2 className="text-center font-semibold border-2 bg-stone-900/30  rounded-md p-3 backdrop-blur-lg">
            {receivedPlayerTwoName || playerTwoName}
          </h2>
        )}
      </div>
    </div>
  );
};

export default PlayerNames;
