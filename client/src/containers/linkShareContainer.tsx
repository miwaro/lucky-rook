// LinkShareContainer.tsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import LinkShare from "../components/linkShare";
import { useParams } from "react-router-dom";

const LinkShareContainer: React.FC = () => {
  const { isPlayerOne } = useSelector((state: RootState) => state.player);
  const { gameStarted } = useSelector((state: RootState) => state.game);
  const { roomId } = useParams<{ roomId: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roomId && isPlayerOne && !gameStarted) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [roomId, isPlayerOne, gameStarted]);

  // Render loading or LinkShare based on the conditions
  if (loading) {
    return null;
  }

  if (isPlayerOne && !gameStarted && roomId) {
    return <LinkShare />;
  }

  return null;
};

export default LinkShareContainer;
