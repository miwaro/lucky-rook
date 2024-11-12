import React from "react";
import LinkShare from "./linkShare";
import PlayerOneCreateAndJoin from "./PlayerOneCreateAndJoin";
import PlayerTwoJoin from "./playerTwoJoin";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useParams } from "react-router-dom";

const InitiateGame: React.FC = () => {
  const { roomId } = useParams();

  const { isPlayerOne, isPlayerTwo } = useSelector((state: RootState) => state.player);
  const { gameStarted } = useSelector((state: RootState) => state.game);

  return (
    <div>
      {!roomId && <PlayerOneCreateAndJoin />}
      {isPlayerOne && !gameStarted && roomId && <LinkShare />}
      {isPlayerTwo && !gameStarted && <PlayerTwoJoin />}
    </div>
  );
};

export default InitiateGame;
