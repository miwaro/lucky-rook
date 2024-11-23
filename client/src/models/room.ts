interface Player {
  userId: string;
  name: string;
  color: string;
}

export interface Room {
  roomId: string;
  playerOne: Player;
  playerTwo: Player;
  gameStarted: boolean;
  gameIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
