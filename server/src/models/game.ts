import mongoose, { Schema, Document } from "mongoose";

interface IRoom extends Document {
  roomId: string;
  playerOne: {
    userId: string;
    name: string;
    color: string;
  };
  playerTwo: {
    userId?: String;
    name?: String;
    color?: String;
  };
  gameStarted: boolean;
  gameIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    roomId: { type: String, required: true, unique: true },
    playerOne: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      color: { type: String, enum: ["white", "black"], required: true },
    },
    playerTwo: {
      userId: { type: String, required: false },
      name: { type: String, required: false },
      color: { type: String, enum: ["black", "white"], required: false },
    },
    gameStarted: { type: Boolean, default: false },
    gameIds: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model<IRoom>("Room", RoomSchema);
interface IGame extends Document {
  roomId: string;
  gameId: string;
  fen: string;
  moves: {
    moveNumber: number;
    color: string;
    from: string;
    to: string;
  }[];
  currentTurn: string;
  status: string;
  result?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema: Schema = new Schema(
  {
    roomId: { type: String, required: true },
    gameId: { type: String, required: true, unique: true },
    gameStarted: { type: Boolean, default: true },
    fen: { type: String, required: true },
    moves: [
      {
        moveNumber: { type: Number, required: true },
        color: { type: String, enum: ["white", "black"], required: true },
        from: { type: String, required: true },
        to: { type: String, required: true },
      },
    ],
    currentTurn: { type: String, enum: ["white", "black"], required: true },
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },
    result: {
      type: String,
      enum: ["white_wins", "black_wins", "draw", null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Game = mongoose.model<IGame>("Game", GameSchema);

export { Room, Game };
