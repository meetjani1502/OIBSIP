require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  },
});

// Make Socket.IO available inside routes
app.set("io", io);

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Customer joins their own order room
  socket.on("join-order", (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined order ${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "PizzaHub Backend API is running!",
    socket: "Socket.IO is enabled",
  });
});

// Routes
app.use("/api/pizzas", require("./routes/pizza.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

// Server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Socket.IO server is ready");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
