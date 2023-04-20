require('dotenv').config();
const port = process.env.PORT || 3000;

const express = require('express');
const mongoose = require('mongoose');
const chalk = require("chalk");
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./src/routes/userRoutes');
const videoRoutes = require('./src/routes/videoRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
// const livechatRoutes = require('./src/routes/livechatRoutes');

const dbConnect = require('./config/connectMongo')

/**
 * * MONGO
 */
const db = mongoose.connection;


dbConnect.connect().catch (error => console.log(error));

db.once("open", () => { console.log(chalk.green("MongoDB Database Connected on", chalk.blue(db.name))); });
db.on("error", (error) => {console.error(error);});


/**
 * * EXPRESS
 */

const app = express();

// Setup the WebSocket server using Socket.io
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
// app.use('/api/livechat', livechatRoutes);






/**
 * * SWAGGER
 */

const swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger.json');

app.use('/swagger',swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Live Chat route
app.get('/api/livechat', (req, res) => {
  // Setup the WebSocket endpoint for livechat
  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("chat message", (msg) => {
      console.log("message: " + msg);
      io.emit("chat message", msg);
    });
  });
  res.sendFile(__dirname + "/public/livechat.html");
});

server.listen(port, () => {
  console.log(chalk.magenta(`Server running on :`, chalk.yellow.underline("http://localhost:" + port) ));
  console.log(chalk.cyan('Swagger on :', chalk.yellow.underline('http://localhost:3000/swagger')));
});


// console.log(process.env);