// PlayerTwoJoinContainer.tsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import PlayerTwoJoin from "../components/playerTwoJoin";
import { useParams } from "react-router-dom";
// import getSocketInstance from '../socket';
import { setIsPlayerTwo } from "../features/player/playerSlice";

const PlayerTwoJoinContainer: React.FC = () => {
  const { isPlayerTwo } = useSelector((state: RootState) => state.player);
  const { gameStarted } = useSelector((state: RootState) => state.game);
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roomId && !gameStarted) {
      // Assume player two joined here, you might fetch or confirm room data
      dispatch(setIsPlayerTwo(true));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [roomId, gameStarted, dispatch]);

  // Render nothing while loading
  if (loading) {
    return null;
  }

  if (isPlayerTwo && !gameStarted) {
    return <PlayerTwoJoin />;
  }

  return null;
};

export default PlayerTwoJoinContainer;
