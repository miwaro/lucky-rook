import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const PlayerNames: React.FC = () => {
  const { boardOrientation } = useSelector((state: RootState) => state.game);
  const { playerOneName, playerTwoName, receivedPlayerOneName, receivedPlayerTwoName } = useSelector(
    (state: RootState) => state.player
  );

  return (
    <div className="ml-8 border border-stone-900 rounded p-1">
      {boardOrientation === "black" ? (
        <h2 className="text-stone-50 text-center">Player One: {receivedPlayerOneName || playerOneName}</h2>
      ) : (
        <h2 className="text-stone-950 text-center">Player Two: {receivedPlayerTwoName || playerTwoName}</h2>
      )}
      <hr />
      {boardOrientation === "white" ? (
        <h2 className="text-stone-50 text-center">Player One: {receivedPlayerOneName || playerOneName}</h2>
      ) : (
        <h2 className="text-stone-950 text-center">Player Two: {receivedPlayerTwoName || playerTwoName}</h2>
      )}
    </div>
  );
};

export default PlayerNames;
