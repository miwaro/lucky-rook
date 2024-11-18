import mongoose, { Schema, Document } from "mongoose";

interface IGame extends Document {
  roomId: string;
  gameId: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  playerOne: {
    userId: string;
    name: string;
    color: string;
  };
  playerTwo: {
    userId?: string;
    name?: string;
    color?: string;
  };
  fen: string;
  moves: {
    moveNumber: number;
    color: string;
    from: string;
    to: string;
  }[];
  currentTurn: string;
  result?: string | null;
}

const GameSchema: Schema = new Schema(
  {
    roomId: { type: String, required: true, unique: true },
    gameId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },
    playerOne: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      color: { type: String, enum: ["white", "black"], required: true },
    },
    playerTwo: {
      userId: { type: String, required: false },
      name: { type: String, required: false },
      color: { type: String, enum: ["white", "black"], required: true },
    },
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

export default Game;
