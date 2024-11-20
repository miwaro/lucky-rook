import { GameState } from "../models/gameState";

export async function getCurrentGameState(roomId: string): Promise<GameState> {
  try {
    const response = await fetch(`/api/room/${roomId}/current-game`, { method: "GET" });
    if (!response.ok) {
      throw new Error(`Failed to fetch game state: ${response.statusText}`);
    }
    const gameState = await response.json();

    return gameState;
  } catch (error) {
    console.error("Error fetching game state from API:", error);
    throw error;
  }
}

export async function updateGameState(roomId: string, fen: string, currentTurn: "white" | "black"): Promise<void> {
  try {
    const response = await fetch(`/api/games/${roomId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fen,
        currentTurn,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update game state: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error updating game state:", error);
    throw error;
  }
}
