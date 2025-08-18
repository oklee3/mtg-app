const express = require('express');
const mongoose = require('mongoose');
const path = require('path')
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db');
const cardsRouter = require('./routes/cards');
const gameRouter = require('./routes/game');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/cards', cardsRouter);
app.use('/api/game', gameRouter);

const clientBuildPath = path.join(__dirname, '../../client/build');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
