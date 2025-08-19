const express = require('express');
const Card = require('../models/Card');
const router = express.Router();

// Cache for daily card to avoid recalculating on every request
let dailyCardCache = null;
let dailyCardCacheDate = null;
let testCardCache = null; // Cache for test cards

// Helper function to get today's daily card
const getDailyCard = async () => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  const currentDate = today.getFullYear() * 1000 + dayOfYear;

  if (dailyCardCache && dailyCardCacheDate === currentDate) {
    return dailyCardCache;
  }

  // Use day of year as seed for consistent daily card selection
  const seed = dayOfYear + today.getFullYear() * 1000;

  const matchQuery = {
    $or: [
      { 'legalities.vintage': 'legal' },
      { 'legalities.commander': 'legal' }
    ]
  };
  
  const count = await Card.countDocuments(matchQuery);
  if (count === 0) {
    throw new Error("No cards found that are legal in Vintage or Commander");
  }

  // Pick "random" index for today
  const skip = seed % count;

  const dailyCard = await Card.findOne(matchQuery)
    .sort({ name: 1, released_at: 1 })
    .skip(skip)
    .lean();

  if (!dailyCard) {
    throw new Error("Failed to fetch daily card");
  }

  dailyCardCache = dailyCard;
  dailyCardCacheDate = currentDate;

  return dailyCard;
};


// Helper function to get the current active card (daily or test)
const getCurrentCard = async () => {
  // If there's a test card, use that; otherwise use the daily card
  if (testCardCache) {
    return testCardCache;
  }
  return await getDailyCard();
};

// Helper function to get rarity value for comparison
const getRarityValue = (rarity) => {
  const rarityMap = { 'common': 1, 'uncommon': 2, 'rare': 3, 'mythic': 4 };
  return rarityMap[rarity?.toLowerCase()] || 0;
};

// Helper function to get release year
const getReleaseYear = (dateString) => {
  if (!dateString) return 0;
  return new Date(dateString).getFullYear();
};

// Helper function to check color overlap
const getColorOverlap = (guessColors, targetColors) => {
  if (!Array.isArray(guessColors) || !Array.isArray(targetColors)) return { exact: false, overlap: false };
  
  const guessSet = new Set(guessColors);
  const targetSet = new Set(targetColors);
  
  const exact = JSON.stringify(guessColors.sort()) === JSON.stringify(targetColors.sort());
  const overlap = guessColors.some(color => targetColors.includes(color)) || targetColors.some(color => guessColors.includes(color));
  
  return { exact, overlap };
};

// Helper function to check type overlap
const getTypeOverlap = (guessType, targetType) => {
  if (!guessType || !targetType) return { exact: false, overlap: false };
  
  const guessTypes = guessType.toLowerCase().split(' — ')[0].split(' ');
  const targetTypes = targetType.toLowerCase().split(' — ')[0].split(' ');
  
  const exact = guessType.toLowerCase() === targetType.toLowerCase();
  const overlap = guessTypes.some(type => targetTypes.includes(type)) || targetTypes.some(type => guessTypes.includes(type));
  
  return { exact, overlap };
};

// Get today's daily card (same card for all players on the same day)
router.get('/daily', async (req, res) => {
  try {
    // Clear test card cache when regular daily is requested
    testCardCache = null;
    
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
    
    // Search for the guessed card (get oldest printing)
    const guessedCards = await Card.aggregate([
      {
        $match: {
          name: { $regex: `^${guess.trim()}$`, $options: 'i' }
        }
      },
      { $sort: { released_at: 1 } },
      {
        $group: {
          _id: "$name",
          oldestCard: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$oldestCard" } }
    ]);
    
    if (guessedCards.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const guessedCard = guessedCards[0];
    
    // Get today's daily card for comparison
    const dailyCard = await getCurrentCard();
    
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
        cmc: {
          exact: (guessedCard.cmc || 0) === (dailyCard.cmc || 0),
          close: Math.abs((guessedCard.cmc || 0) - (dailyCard.cmc || 0)) <= 2,
          direction: (guessedCard.cmc || 0) > (dailyCard.cmc || 0) ? 'higher' : 'lower'
        },
        colors: getColorOverlap(guessedCard.colors, dailyCard.colors),
        type_line: getTypeOverlap(guessedCard.type_line, dailyCard.type_line),
        rarity: {
          exact: (guessedCard.rarity || '') === (dailyCard.rarity || ''),
          close: Math.abs(getRarityValue(guessedCard.rarity) - getRarityValue(dailyCard.rarity)) <= 1,
          direction: getRarityValue(guessedCard.rarity) > getRarityValue(dailyCard.rarity) ? 'higher' : 'lower'
        },
        set_name: (guessedCard.set_name || '') === (dailyCard.set_name || ''),
        released_at: {
          exact: (guessedCard.released_at || '') === (dailyCard.released_at || ''),
          close: getReleaseYear(guessedCard.released_at) === getReleaseYear(dailyCard.released_at),
          direction: getReleaseYear(guessedCard.released_at) > getReleaseYear(dailyCard.released_at) ? 'newer' : 'older'
        }
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
    
    // Use aggregation to get oldest printing per card name
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
      { $sort: { name: 1, released_at: 1 } },
      {
        $group: {
          _id: "$name",
          oldestCard: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$oldestCard" } },
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