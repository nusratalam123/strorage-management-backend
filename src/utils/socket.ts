import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import logger from "node-color-log";

let io: SocketIOServer;

export const initializeSocketIO = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Allow all origins for testing; adjust in production
    },
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Handle custom events if needed
    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error("Socket.IO is not initialized. Call initializeSocketIO first.");
  }
  return io;
};
