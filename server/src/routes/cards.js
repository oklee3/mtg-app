const express = require('express');
const Card = require('../models/Card');

const router = express.Router();

// Get all cards or search by name
router.get('/', async (req, res) => {
  try {
    const { name, color, type, cmc, legality, page = 1, limit = 48 } = req.query;
    let query = {};
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (color) {
      // Accept comma-separated or array
      const colors = Array.isArray(color) ? color : color.split(',');
      query.$or = [
        { colors: { $all: colors } },
        { color_identity: { $all: colors } },
        { 'card_faces.color_identity': { $all: colors } }
      ];
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
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let [cards, total] = await Promise.all([
      Card.find(query).skip(skip).limit(parseInt(limit)),
      Card.countDocuments(query)
    ]);
    // Filter out cards not legal in any format
    const isLegalInAnyFormat = card => {
      if (!card.legalities || typeof card.legalities !== 'object') return false;
      return Object.values(card.legalities).includes('legal');
    };
    const filteredCards = cards.filter(isLegalInAnyFormat);
    // Adjust total to reflect only cards legal in at least one format
    // (Optional: for accurate pagination, you may want to count only legal cards, but this is slower)
    res.json({
      cards: filteredCards,
      total,
      page: parseInt(page),
      pageSize: parseInt(limit)
    });
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