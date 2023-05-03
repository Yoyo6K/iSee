require("dotenv").config();
const port = process.env.EXPRESS_PORT || 3000;

const express = require("express");
const mongoose = require("mongoose");
const chalk = require("chalk");
const bodyParser = require("body-parser");
const cors = require("cors");

const userRoutes = require("./src/routes/userRoutes");
const videoRoutes = require("./src/routes/videoRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
// const livechatRoutes = require('./src/routes/livechatRoutes');

const dbConnect = require("./config/connectMongo");
const { Server } = require("socket.io");

/**
 * * MONGO
 */
const db = mongoose.connection;

dbConnect.connect().catch((error) => console.log(error));

db.once("open", () => {
  console.log(
    chalk.green("MongoDB Database Connected on", chalk.blue(db.name))
  );
});
db.on("error", (error) => {
  console.error(error);
});

/**
 * * EXPRESS
 */

const app = express();

// Setup the WebSocket server using Socket.io
const http = require("http");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: ["http://localhost:3000", "https://iseevision.fr"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/comments", commentRoutes);
// app.use('/api/livechat', livechatRoutes);

/**
 * * SWAGGER
 */

const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * * LiveChat
 */

app.get("/api/livechat/:videoId", (req, res) => {
  res.sendFile(__dirname + "/public/livechat.html");
});

// Middleware pour les connexions de socket
io.on("connection", (socket) => {
  // Rejoindre la salle de chat vidéo correspondante
  socket.on("join video chat", (videoId) => {
    console.log(`user joined chat for video ${videoId}`);
    socket.join(`video-${videoId}`);
  });

  // Écouter les messages de chat
  socket.on("chat message", (data) => {
    console.log(`message received for video ${data.videoId}: ${data.message}`);
    const { message, timestamp, author } = data;
    console.log("timestamp", timestamp, author);
    const newMessage = {
      content: message,
      timestamp: timestamp,
      author: author,
    };
    io.to(`video-${data.videoId}`).emit("chat message", newMessage);
  });
});

/**
 * * Listening
 */

server.listen(port, () => {
  console.log(
    chalk.magenta(
      "Server running on :",
      chalk.yellow.underline(`http://localhost:${port}`)
    )
  );
  console.log(
    chalk.cyan(
      "Swagger on :",
      chalk.yellow.underline(`http://localhost:${port}/swagger`)
    )
  );
});

// console.log(process.env);
