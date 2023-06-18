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

const { isAuthSocketMiddleware } = require("./src/middleware/isAuth");
const dbConnect = require("./config/connectMongo");
const { Server } = require("socket.io");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const ioCookieParser = require("socket.io-cookie-parser");
const fs = require("fs");
const md5 = require("md5");
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

// Setup the WebSocket server using Socket.io
const http = require("http");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://iseevision.fr"], // Ajoutez l'origine de votre application React
    methods: ["GET", "POST"], // Ajoutez les méthodes HTTP nécessaires
    credentials: true, // Assurez-vous que cette option est définie sur true
    sameSite: "none",
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

app.use(bodyParser.raw({type:'application/octet-stream', limit:'100mb'}));
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
app.use("/uploads", express.static("uploads"));


app.post("/api/upload", (req, res) => {
  console.log("upload")
  const destLocal = process.env.INIT_CWD;
    fs.mkdirSync(destLocal +"/uploads");
  const { name, currentChunkIndex, totalChunks } = req.query;
  const firstChunk = parseInt(currentChunkIndex) === 0;
  const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1;
  const ext = name.split(".").pop();
  const data = req.body.toString().split(",")[1];
  const buffer = Buffer.from(data, "base64"); // Utilisation de Buffer.from() au lieu de new Buffer()
  const tmpFilename = "tmp_" + md5(name + req.ip) + "." + ext;
  if (firstChunk && fs.existsSync("./uploads/" + tmpFilename)) {
    fs.unlinkSync("./uploads/" + tmpFilename);
  }
  fs.appendFileSync("./uploads/" + tmpFilename, buffer);
  if (lastChunk) {
    const finalFilename = md5(Date.now()).substr(0, 6) + "." + ext;
    fs.renameSync("./uploads/" + tmpFilename, "./uploads/" + finalFilename);
    res.json({ finalFilename });
  } else {
    res.json("ok");
  }
});


/**
 * * SWAGGER
 */

const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * * LiveChat
 */

io.use(ioCookieParser());

const connectedUsers = {};
io.on("connection", (socket) => {
  // Rejoindre la salle de chat vidéo correspondante
  socket.on("join video chat", async (videoId, user) => {
    socket.join(`video-${videoId}`);

    const { error } = await isAuthSocketMiddleware(socket); // vérification si l'utilisateur est connecté.

    if (error) {
      io.to(socket.id).emit("rafraichir-token");
      socket.leave(`video-${videoId}`);
      socket.disconnect();
      return;
    }
    connectedUsers[socket.id] = {
      videoid: videoId,
      id: user.id,
      username: user.username,
      logo_path: user.logo,
    };
    const room = `video-${videoId}`;
    const users = Object.values(connectedUsers).map((user) => {
      return {
        videoid: user.videoid,
        id: user.id,
        username: user.username,
        logo_path: user.logo_path,
      };
    });
    io.to(room).emit("user joined", users);
  });

  socket.on("leave video chat", (videoId) => {
    const room = `video-${videoId}`;
    if (connectedUsers.hasOwnProperty(socket.id)) {
      delete connectedUsers[socket.id];
    }
    if (Object.keys(connectedUsers).length > 0) {
      // Émettre l'événement "user left" avec les utilisateurs mis à jour
      const users = Object.values(connectedUsers).map((user) => {
        return {
          videoid: user.videoid,
          id: user.id,
          username: user.username,
          logo_path: user.logo,
        };
      });

      io.to(room).emit("user left", users);
    } else {
      io.to(room).emit("user left", []);
    }
    socket.leave(`video-${videoId}`);
  });

  // Écouter les messages de chat
  socket.on("chat message", (data) => {
    const { message, timestamp, author } = data;
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
