const { Server } = require("socket.io");

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (process.env.FRONTEND_URL || "http://localhost:5173").replace(
        /\/$/,
        "",
      ),
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", () => {
    // Connection lifecycle hook kept minimal intentionally.
  });

  return io;
};

const getIO = () => io;

module.exports = {
  initSocket,
  getIO,
};
