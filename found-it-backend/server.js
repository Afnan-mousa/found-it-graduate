require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});
const notificationRoutes = require("./routes/notificationRoutes");

app.set("io", io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user.id;
  socket.join(userId);

  console.log("Socket connected:", userId);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", userId);
  });
});

const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Middlewares
app.use(
  cors({
    origin: [
    "http://localhost:5173",
    "https://found-it-graduate-1.onrender.com"
  ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  //   allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("السيرفر يعمل وقاعدة البيانات متصلة!");
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`🚀 السيرفر شغال على الرابط: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });