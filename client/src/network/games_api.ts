import { Game } from "../models/game";

export async function getCurrentGameState(gameId: string): Promise<Game> {
  try {
    const response = await fetch(`/api/game/${gameId}/current-game`, { method: "GET" });
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

export async function updateGameState(gameId: string, fen: string, currentTurn: "white" | "black"): Promise<void> {
  try {
    const response = await fetch(`/api/games/${gameId}`, {
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
