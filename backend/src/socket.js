const { Server } = require("socket.io");

let io;
const studentSubscriptions = new Map(); // Map to track student socket subscriptions

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

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Handle student subscription
    socket.on("student:subscribe", (data) => {
      const studentId = data.studentId;
      if (studentId) {
        if (!studentSubscriptions.has(studentId)) {
          studentSubscriptions.set(studentId, []);
        }
        studentSubscriptions.get(studentId).push(socket.id);
        console.log(`Student ${studentId} subscribed via socket ${socket.id}`);
      }
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      for (const [studentId, sockets] of studentSubscriptions.entries()) {
        const index = sockets.indexOf(socket.id);
        if (index > -1) {
          sockets.splice(index, 1);
        }
        if (sockets.length === 0) {
          studentSubscriptions.delete(studentId);
        }
      }
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => io;

// Helper function to emit to specific student
const emitToStudent = (studentId, event, data) => {
  if (io && studentSubscriptions.has(studentId)) {
    const sockets = studentSubscriptions.get(studentId);
    sockets.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToStudent,
};
