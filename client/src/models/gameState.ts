export interface GameState {
  roomId: string;
  gameId: string;
  gameStarted: boolean;
  currentTurn: string;
  fen: string;
  status: string;
  result: string | null;
  moves: string[];
  createdAt: Date;
  updatedAt: Date;
}
