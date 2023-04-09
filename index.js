require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes');
// const videoRoutes = require('./src/routes/videoRoutes');
// const commentRoutes = require('./src/routes/commentRoutes');
// const livechatRoutes = require('./src/routes/livechatRoutes');

const { connect } = require('./config/connectMongo');

const app = express();
const port = process.env.PORT || 3000;

//Connexion bdd
connect(() => {
  console.log("Connected to MongoDB");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api/users', userRoutes);
// app.use('/api/videos', videoRoutes);
// app.use('/api/comments', commentRoutes);
// app.use('/api/livechat', livechatRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});