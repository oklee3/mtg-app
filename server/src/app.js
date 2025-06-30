const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db');
const cardsRouter = require('./routes/cards');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/cards', cardsRouter);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
