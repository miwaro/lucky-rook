export interface InMemoryGameState {
  gameId: string;
  fen: string;
  gameStarted: boolean;
  playerOne: {
    userId: string;
    name: string;
    color: string;
  };
  playerTwo: {
    userId: string;
    name: string;
    color: string;
  } | null;
  moves: {
    fen: string;
    moveNumber: number;
    color: "white" | "black";
    from: string;
    to: string;
    // piece: string;
    // captured: boolean | null;
    // flags: string;
    // san: string;
  }[];
  currentTurn: "white" | "black";
  status: "in_progress" | "completed" | "abandoned";
  result: "white_wins" | "black_wins" | "draw" | null;
  createdAt: Date;
  updatedAt: Date;
  playerOneSocketId: string | null;
  playerTwoSocketId: string | null;
  rematchRequestedByPlayerOne: boolean;
  rematchRequestedByPlayerTwo: boolean;
  winner: string | null;
}
