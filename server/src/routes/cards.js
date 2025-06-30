const express = require('express');
const Card = require('../models/Card');

const router = express.Router();

// Get all cards or search by name
router.get('/', async (req, res) => {
  try {
    const { name, color, type, cmc, legality } = req.query;
    let query = {};
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (color) {
      // Accept comma-separated or array
      const colors = Array.isArray(color) ? color : color.split(',');
      query.colors = { $all: colors };
    }
    if (type) {
      query.type_line = { $regex: type, $options: 'i' };
    }
    if (cmc) {
      // Support both string and number
      query.cmc = Number(cmc);
    }
    if (legality) {
      const legalityKey = `legalities.${legality}`;
      query[legalityKey] = 'legal';
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