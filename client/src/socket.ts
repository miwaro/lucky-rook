import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000";

let socketInstance: Socket | null = null;

const getSocketInstance = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_SERVER_URL, {
      transports: ["websocket"], // TODO: possibly remove later
    });
  }
  return socketInstance;
};

export default getSocketInstance;
