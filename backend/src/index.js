const dotenv = require("dotenv");
dotenv.config({ quiet: true });
const http = require("http");
const app = require("./app.js");
const connectDB = require("./config/db.js");
const { initSocket } = require("./socket.js");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1);
  });
