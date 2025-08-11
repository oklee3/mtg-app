const express = require('express');
const Card = require('../models/Card');
const router = express.Router();

// Cache for daily card to avoid recalculating on every request
let dailyCardCache = null;
let dailyCardCacheDate = null;

// Helper function to get today's daily card
const getDailyCard = async () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const currentDate = today.getFullYear() * 1000 + dayOfYear;
  
  // Return cached card if it's from today
  if (dailyCardCache && dailyCardCacheDate === currentDate) {
    return dailyCardCache;
  }
  
  // Use day of year as seed for consistent daily card selection
  const seed = dayOfYear + today.getFullYear() * 1000;
  
  // Get all cards legal in Vintage or Commander and sort them consistently
  const allCards = await Card.find({
    $or: [
      { 'legalities.vintage': 'legal' },
      { 'legalities.commander': 'legal' }
    ]
  }).select('name cmc colors type_line rarity oracle_id image_uris card_faces set_name released_at').sort({ oracle_id: 1, released_at: 1 });
  
  if (allCards.length === 0) {
    throw new Error('No cards found');
  }
  
  // Use seed to consistently select the same card for the day
  const cardIndex = seed % allCards.length;
  const dailyCard = allCards[cardIndex];
  
  // Cache the result
  dailyCardCache = dailyCard;
  dailyCardCacheDate = currentDate;
  
  return dailyCard;
};

// Get today's daily card (same card for all players on the same day)
router.get('/daily', async (req, res) => {
  try {
    const dailyCard = await getDailyCard();
    
    // Return only the properties needed for the game
    res.json({
      name: dailyCard.name,
      cmc: dailyCard.cmc || 0,
      colors: dailyCard.colors || [],
      type_line: dailyCard.type_line || '',
      rarity: dailyCard.rarity || '',
      oracle_id: dailyCard.oracle_id,
      image_uris: dailyCard.image_uris || null,
      card_faces: dailyCard.card_faces || null,
      set_name: dailyCard.set_name || '',
      released_at: dailyCard.released_at || ''
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validate a guess and return feedback
router.post('/check', async (req, res) => {
  try {
    const { guess } = req.body;
    
    if (!guess || !guess.trim()) {
      return res.status(400).json({ error: 'Guess is required' });
    }
    
    // Search for the guessed card
    const guessedCard = await Card.findOne({
      name: { $regex: `^${guess.trim()}$`, $options: 'i' }
    }).select('name cmc colors type_line rarity set_name released_at');
    
    if (!guessedCard) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Get today's daily card for comparison
    const dailyCard = await getDailyCard();
    
    console.log('Daily card set info:', dailyCard.set_name, dailyCard.released_at);
    console.log('Guessed card set info:', guessedCard.set_name, guessedCard.released_at);
    
    // Prepare the response with the guessed card and feedback
    const response = {
      guessedCard: {
        name: guessedCard.name,
        cmc: guessedCard.cmc || 0,
        colors: guessedCard.colors || [],
        type_line: guessedCard.type_line || '',
        rarity: guessedCard.rarity || '',
        set_name: guessedCard.set_name || '',
        released_at: guessedCard.released_at || ''
      },
      dailyCard: {
        name: dailyCard.name,
        cmc: dailyCard.cmc || 0,
        colors: dailyCard.colors || [],
        type_line: dailyCard.type_line || '',
        rarity: dailyCard.rarity || '',
        set_name: dailyCard.set_name || '',
        released_at: dailyCard.released_at || ''
      },
      isCorrect: guessedCard.name.toLowerCase() === dailyCard.name.toLowerCase(),
      feedback: {
        name: guessedCard.name.toLowerCase() === dailyCard.name.toLowerCase(),
        cmc: (guessedCard.cmc || 0) === (dailyCard.cmc || 0),
        colors: JSON.stringify((guessedCard.colors || []).sort()) === JSON.stringify((dailyCard.colors || []).sort()),
        type_line: (guessedCard.type_line || '') === (dailyCard.type_line || ''),
        rarity: (guessedCard.rarity || '') === (dailyCard.rarity || ''),
        set_name: (guessedCard.set_name || '') === (dailyCard.set_name || ''),
        released_at: (guessedCard.released_at || '') === (dailyCard.released_at || '')
      }
    };
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get card suggestions for autocomplete
router.get('/suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }
    
    // Use aggregation to get earliest printing per oracle_id, similar to card search
    const suggestions = await Card.aggregate([
      {
        $match: {
          $and: [
            { name: { $regex: query.trim(), $options: 'i' } },
            { $or: [
              { 'legalities.vintage': 'legal' },
              { 'legalities.commander': 'legal' }
            ]}
          ]
        }
      },
      { $sort: { oracle_id: 1, released_at: 1 } },
      {
        $group: {
          _id: "$oracle_id",
          card: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$card" } },
      { $sort: { name: 1 } },
      { $limit: 10 },
      { $project: { name: 1 } }
    ]);
    
    res.json({ 
      suggestions: suggestions.map(card => card.name)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 