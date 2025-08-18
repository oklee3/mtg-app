const express = require('express');
const mongoose = require('mongoose');
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
