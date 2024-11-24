interface Player {
  userId: string;
  name: string;
  color: string;
}
export interface Game {
  gameId: string;
  playerOne: Player;
  playerTwo: Player;
  gameStarted: boolean;
  currentTurn: string;
  fen: string;
  status: string;
  result: string | null;
  moves: string[];
  createdAt: Date;
  updatedAt: Date;
}
