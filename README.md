# Lucky-Rook 🏰

Welcome to Lucky Rook! This is a real-time multiplayer chess game built with a MERN stack architecture. The client is built with React and Redux, while the server is powered by Node.js, Express, and Socket.IO, with MongoDB for data storage. This is a rebuild of my previous chess application, Chance Chess, where users can play chess with a deck of cards, introducing an element of chance to a game where chance is virtually non-existent.

### ♟️ Features

- **Real-time chess gameplay** between two players.
- Users can **create and join game rooms**.
- **Chessboard synchronization** between players.
- **Persistent game state** between players.

### 💻 Technologies Used

This project follows a MERN stack architecture:

**Client:**

- ⚛️ React
- 🗄️ Redux Toolkit (for state management)
- 🚦 React Router
- 🔌 Socket.IO Client
- ♟️ Chess.js (for game logic)
- ♟️ react-chessboard (for the user interface of the chessboard)

**Server:**

- 🟢 Node.js
- 🌐 Express
- 🔌 Socket.IO
- 📂 MongoDB (for storing game state and player data)

### 🚀 Getting Started

1. Clone the repository
2. CD to client and server to install dependencies
3. npm run dev for both the client and server

You will be prompted to enter your name and share a game link with a second player. When that player enters their name, the game will begin.
