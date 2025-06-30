const express = require('express');
const Card = require('../models/Card');

const router = express.Router();

// Get all cards or search by name
router.get('/', async (req, res) => {
  try {
    const { name } = req.query;
    let query = {};
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    const cards = await Card.find(query);
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a card by ID
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 