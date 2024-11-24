import mongoose, { Schema, Document } from "mongoose";

interface IGame extends Document {
  gameId: string;
  fen: string;
  gameStarted: boolean;
  playerOne: {
    userId: string;
    name: string;
    color: string;
  };
  playerTwo?: {
    userId?: string;
    name?: string;
    color?: string;
  };
  moves: {
    moveNumber: number;
    color: "white" | "black";
    from: string;
    to: string;
  }[];
  currentTurn?: "white" | "black";
  status: "in_progress" | "completed" | "abandoned";
  result?: "white_wins" | "black_wins" | "draw" | null;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema: Schema = new Schema(
  {
    gameId: { type: String, required: true, unique: true },
    playerOne: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      color: { type: String, enum: ["white", "black"], required: true },
    },
    playerTwo: {
      userId: { type: String },
      name: { type: String },
      color: { type: String, enum: ["white", "black"] },
    },
    gameStarted: { type: Boolean, default: false },
    fen: { type: String, default: "start" },
    moves: [
      {
        moveNumber: { type: Number, required: true },
        color: { type: String, enum: ["white", "black"], required: true },
        from: { type: String, required: true },
        to: { type: String, required: true },
      },
    ],
    currentTurn: { type: String, enum: ["white", "black"] },
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

export { Game };
