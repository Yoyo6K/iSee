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
const dashboardRoutes = require("./src/routes/dashboardRoutes");


const isAuth = require("./src/middleware/isAuth");
const dbConnect = require("./config/connectMongo");
const { Server } = require("socket.io");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
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

//protection fail xss
app.use(helmet());

app.use(cookieParser());
console.log(process.env.NODE_ENV);

// Setup the WebSocket server using Socket.io
const http = require("http");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [`https://localhost:3000`, "https://iseevision.fr","http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: [
      `https://localhost:3000`,
      "https://iseevision.fr",
      "http://localhost:3000",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    sameSite: "none",
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use((req, res, next) => {
//   res.header(
//     "Access-Control-Allow-Origin",
//     "http://localhost:3001, https://iseevision.fr"
//   );
//   res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   res.header("Access-Control-Allow-Credentials", "true");
//   next();
// });

app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard", dashboardRoutes);

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




io.on("connection", (socket) => {
  // Rejoindre la salle de chat vidéo correspondante
  socket.on("join video chat", (videoId) => {
    console.log(`user joined chat for video ${videoId}`);
    socket.join(`video-${videoId}`);
  });

  // Écouter les messages de chat
  socket.on("chat message", isAuth, (data) => {
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
      chalk.yellow.underline(`https://localhost:${port}`)
    )
  );
  console.log(
    chalk.cyan(
      "Swagger on :",
      chalk.yellow.underline(`https://localhost:${port}/swagger`)
    )
  );
});

// console.log(process.env);
