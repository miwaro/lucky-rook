import React from "react";

type PlayerNamesProps = {
  boardOrientation: string;
  playerOneName: string | null;
  playerTwoName: string | null;
  receivedPlayerTwoName: string | null;
  receivedPlayerOneName: string | null;
};

const PlayerNames: React.FC<PlayerNamesProps> = ({
  boardOrientation,
  playerOneName,
  playerTwoName,
  receivedPlayerOneName,
  receivedPlayerTwoName,
}) => {
  return (
    <div className="ml-8 border border-stone-900 rounded p-1">
      {boardOrientation === "black" ? (
        <h2 className="text-stone-50 text-center">
          Player One: {receivedPlayerOneName || playerOneName}
        </h2>
      ) : (
        <h2 className="text-stone-950 text-center">
          Player Two: {receivedPlayerTwoName || playerTwoName}
        </h2>
      )}
      <hr />
      {boardOrientation === "white" ? (
        <h2 className="text-stone-50 text-center">
          Player One: {receivedPlayerOneName || playerOneName}
        </h2>
      ) : (
        <h2 className="text-stone-950 text-center">
          Player Two: {receivedPlayerTwoName || playerTwoName}
        </h2>
      )}
    </div>
  );
};

export default PlayerNames;
