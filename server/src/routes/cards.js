const express = require('express');
const Card = require('../models/Card');

const router = express.Router();

// Get all cards or search by name (earliest printing per oracle_id)
router.get('/', async (req, res) => {
  try {
    const { name, color, type, cmc, legality, page = 1, limit = 48 } = req.query;
    let match = {};
    if (name) {
      match.name = { $regex: name, $options: 'i' };
    }
    if (color) {
      // Accept comma-separated or array
      const colors = Array.isArray(color) ? color : color.split(',');
      match.$or = [
        { colors: { $all: colors } },
        { color_identity: { $all: colors } },
        { 'card_faces.color_identity': { $all: colors } }
      ];
    }
    if (type) {
      match.type_line = { $regex: type, $options: 'i' };
    }
    if (cmc) {
      match.cmc = Number(cmc);
    }
    if (legality) {
      const legalityKey = `legalities.${legality}`;
      match[legalityKey] = 'legal';
    }
    // Only legal in at least one format
    match.$expr = {
      $gt: [
        { $size: {
          $filter: {
            input: { $objectToArray: "$legalities" },
            as: "legality",
            cond: { $eq: ["$$legality.v", "legal"] }
          }
        } },
        0
      ]
    };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    // Aggregate for earliest printing per oracle_id
    const pipeline = [
      { $match: match },
      { $sort: { oracle_id: 1, released_at: 1 } },
      {
        $group: {
          _id: "$oracle_id",
          card: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$card" } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];
    const cards = await Card.aggregate(pipeline);
    // For total count
    const countPipeline = [
      { $match: match },
      { $sort: { oracle_id: 1, released_at: 1 } },
      {
        $group: {
          _id: "$oracle_id",
          card: { $first: "$$ROOT" }
        }
      },
      { $count: "total" }
    ];
    const countResult = await Card.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;
    res.json({
      cards,
      total,
      page: parseInt(page),
      pageSize: parseInt(limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all printings for a given oracle_id
router.get('/printings/:oracle_id', async (req, res) => {
  try {
    const { oracle_id } = req.params;
    const printings = await Card.find({ oracle_id }).sort({ released_at: 1 });
    res.json({ printings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get random cards that are legal in at least one format
router.get('/random', async (req, res) => {
  try {
    const { count = 3 } = req.query;
    const randomCount = parseInt(count);
    
    const cards = await Card.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              { $size: {
                $filter: {
                  input: { $objectToArray: "$legalities" },
                  as: "legality",
                  cond: { $eq: ["$$legality.v", "legal"] }
                }
              } },
              0
            ]
          }
        }
      },
      { $sample: { size: randomCount } }
    ]);
    
    res.json({
      cards: cards,
      count: cards.length
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