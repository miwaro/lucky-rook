import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { useParams } from "react-router-dom";
import {
  setIsGameOver,
  setRematchRequestedByPlayerOne,
  setRematchRequestedByPlayerTwo,
  setResult,
} from "../features/game/gameSlice";
import getSocketInstance from "../socket";

const PlayerNames: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const socket = useMemo(() => getSocketInstance(), []);
  const playerId = localStorage.getItem("playerId");

  const { boardOrientation, isGameOver } = useSelector((state: RootState) => state.game);
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
      console.log("winner", winner.winner);
      dispatch(setIsGameOver(true));
      dispatch(setResult(winner.winner));
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const handleResign = () => {
    dispatch(setIsGameOver(true));
    if (playerOneId === playerId) {
      socket.emit("playerResigns", { gameId, isPlayerOne: true });
    } else if (playerTwoId === playerId) {
      socket.emit("playerResigns", { gameId, isPlayerOne: false });
    }
  };

  // const handleStartNewGame = () => {
  //   url should be replaced with new game id
  //   set new game on server
  //   game.load("start")
  // };

  const handleRematch = () => {
    if (playerOneId === playerId) {
      dispatch(setRematchRequestedByPlayerOne(true));
      socket.emit("rematchRequest", { gameId, isPlayerOne: true });
    } else if (playerTwoId === playerId) {
      dispatch(setRematchRequestedByPlayerTwo(true));
      socket.emit("rematchRequest", { gameId, isPlayerOne: false });
    } else {
      dispatch(setRematchRequestedByPlayerOne(false));
      dispatch(setRematchRequestedByPlayerTwo(false));
    }
  };

  const handleDeclineRematch = () => {
    socket.emit("rematchDecision", { gameId, decision: "decline" });
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div className="ml-8 border border-stone-900 rounded p-1">
        <div>
          {boardOrientation === "black" ? (
            <h2 className="text-stone-50 text-center">{receivedPlayerOneName || playerOneName}</h2>
          ) : (
            <h2 className="text-stone-950 text-center">{receivedPlayerTwoName || playerTwoName}</h2>
          )}
        </div>

        <hr />
        <div className="flex gap-y-3">
          <div>
            {boardOrientation === "white" ? (
              <h2 className="text-stone-50 text-center">{receivedPlayerOneName || playerOneName}</h2>
            ) : (
              <h2 className="text-stone-950 text-center">{receivedPlayerTwoName || playerTwoName}</h2>
            )}
          </div>
          {boardOrientation === "white" && isPlayerOne && !isGameOver && (
            <div className="flex gap-3">
              <button className="bg-stone-800 rounded-md p-3" onClick={handleResign}>
                Resign
              </button>
            </div>
          )}
          {boardOrientation === "black" && isPlayerTwo && !isGameOver && (
            <div className="flex gap-3">
              <button className="bg-stone-800 rounded-md p-3" onClick={handleResign}>
                Resign
              </button>
            </div>
          )}
          {isGameOver && (
            <div className="flex gap-1">
              <button className="bg-emerald-800 rounded-md p-3" onClick={handleRematch}>
                Rematch
              </button>
              <button className="bg-fuchsia-800 rounded-md p-3" onClick={handleDeclineRematch}>
                X
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerNames;
