import React, { useState, useEffect } from 'react';
import './Game.css';

function Game() {
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dailyCard, setDailyCard] = useState(null);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch today's daily card on component mount
  useEffect(() => {
    fetchDailyCard();
  }, []);

  // Debug: Monitor game state changes
  useEffect(() => {
    console.log('Game state changed - gameWon:', gameWon, 'gameLost:', gameLost);
  }, [gameWon, gameLost]);

  const fetchDailyCard = async () => {
    try {
      const response = await fetch('/api/game/daily');
      if (!response.ok) {
        throw new Error('Failed to fetch daily card');
      }
      const data = await response.json();
      console.log('Daily card data:', data);
      setDailyCard(data);
    } catch (err) {
      setError('Failed to load daily card. Please try again later.');
      console.error('Error fetching daily card:', err);
    }
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/game/suggestions?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrentGuess(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setCurrentGuess(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleGuessSubmit = async (e) => {
    e.preventDefault();
    if (!currentGuess.trim() || attempts >= 10 || !dailyCard) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/game/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guess: currentGuess.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to validate guess');
      }

      const data = await response.json();
      
      console.log('API Response:', data);
      console.log('Guessed card set info:', data.guessedCard.set_name, data.guessedCard.released_at);
      console.log('Daily card set info:', data.dailyCard.set_name, data.dailyCard.released_at);
      console.log('isCorrect:', data.isCorrect);
      console.log('Current attempts:', attempts);
      
      // Create the guess object with feedback
      const newGuess = {
        ...data.guessedCard,
        feedback: data.feedback,
        isCorrect: data.isCorrect
      };

      const newAttempts = attempts + 1;
      console.log('New attempts:', newAttempts);
      
      setGuesses([...guesses, newGuess]);
      setAttempts(newAttempts);
      setCurrentGuess('');
      setSuggestions([]);
      setShowSuggestions(false);

      console.log('About to check win condition...');
      if (data.isCorrect) {
        console.log('Setting game won to true!');
        setGameWon(true);
      } else if (newAttempts >= 10) {
        console.log('Setting game lost to true!');
        setGameLost(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackColor = (property, guessValue, targetValue) => {
    if (!guessValue || !targetValue) return 'incorrect';
    
    if (property === 'name') {
      return guessValue.toLowerCase() === targetValue.toLowerCase() ? 'correct' : 'incorrect';
    }
    
    if (property === 'cmc') {
      return Number(guessValue) === Number(targetValue) ? 'correct' : 'incorrect';
    }
    
    if (Array.isArray(targetValue)) {
      const guessArray = Array.isArray(guessValue) ? guessValue : [];
      const targetArray = Array.isArray(targetValue) ? targetValue : [];
      return JSON.stringify(guessArray.sort()) === JSON.stringify(targetArray.sort()) ? 'correct' : 'incorrect';
    }
    
    return guessValue === targetValue ? 'correct' : 'incorrect';
  };

  const renderGuessRow = (guess, index) => {
    if (!guess || !dailyCard) {
      return (
        <div key={index} className="guess-row empty">
          <div className="guess-cell name"></div>
          <div className="guess-cell cmc"></div>
          <div className="guess-cell colors"></div>
          <div className="guess-cell type"></div>
          <div className="guess-cell rarity"></div>
          <div className="guess-cell set"></div>
        </div>
      );
    }

    const formatReleaseDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    return (
      <div key={index} className="guess-row">
        <div className={`guess-cell name ${getFeedbackColor('name', guess.name, dailyCard.name)}`}>
          {guess.name}
        </div>
        <div className={`guess-cell cmc ${getFeedbackColor('cmc', guess.cmc, dailyCard.cmc)}`}>
          {guess.cmc}
        </div>
        <div className={`guess-cell colors ${getFeedbackColor('colors', guess.colors, dailyCard.colors)}`}>
          {Array.isArray(guess.colors) ? guess.colors.join('') : guess.colors}
        </div>
        <div className={`guess-cell type ${getFeedbackColor('type_line', guess.type_line, dailyCard.type_line)}`}>
          {guess.type_line}
        </div>
        <div className={`guess-cell rarity ${getFeedbackColor('rarity', guess.rarity, dailyCard.rarity)}`}>
          {guess.rarity}
        </div>
        <div className={`guess-cell set ${getFeedbackColor('set_name', guess.set_name, dailyCard.set_name)}`}>
          <div className="set-info">
            <div className="set-name">{guess.set_name}</div>
            <div className="set-date">{formatReleaseDate(guess.released_at)}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyRows = () => {
    const emptyRows = [];
    for (let i = guesses.length; i < 10; i++) {
      emptyRows.push(renderGuessRow(null, i));
    }
    return emptyRows;
  };

  if (!dailyCard && !error) {
    return (
      <div className="game-container">
        <div className="loading-state">
          <h2>Loading today's card...</h2>
        </div>
      </div>
    );
  }

  if (error && !dailyCard) {
    return (
      <div className="game-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchDailyCard} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1 className="game-title">Guess the Card</h1>
        <p className="game-subtitle">A Magic: The Gathering Wordle variant</p>
      </div>

      <div className="game-board">
        <div className="game-board-header">
          <div className="header-cell">Name</div>
          <div className="header-cell">CMC</div>
          <div className="header-cell">Colors</div>
          <div className="header-cell">Type</div>
          <div className="header-cell">Rarity</div>
          <div className="header-cell">Set</div>
        </div>
        
        <div className="game-board-body">
          {guesses.map((guess, index) => renderGuessRow(guess, index))}
          {renderEmptyRows()}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!gameWon && !gameLost && (
        <form className="game-input-form" onSubmit={handleGuessSubmit}>
          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                value={currentGuess}
                onChange={handleInputChange}
                placeholder="Enter card name..."
                className="game-input"
                disabled={attempts >= 10}
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              type="submit" 
              className="game-submit-btn"
              disabled={!currentGuess.trim() || attempts >= 10 || loading}
            >
              {loading ? 'Checking...' : 'Guess'}
            </button>
          </div>
        </form>
      )}

      {gameWon && (
        <div className="game-result won">
          <h2>Congratulations!</h2>
          <p>You guessed the card in {attempts} attempt{attempts !== 1 ? 's' : ''}!</p>
          <div className="daily-card-reveal">
            <h3>Today's Card:</h3>
            <div className="card-image-container">
              <img 
                src={dailyCard.image_uris?.normal || dailyCard.card_faces?.[0]?.image_uris?.normal} 
                alt={dailyCard.name}
                className="revealed-card-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="card-fallback" style={{ display: 'none' }}>
                <div className="card-fallback-content">
                  <strong>{dailyCard.name}</strong>
                  <div>CMC: {dailyCard.cmc}</div>
                  <div>{dailyCard.type_line}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameLost && (
        <div className="game-result lost">
          <h2>Game Over</h2>
          <p>You ran out of attempts!</p>
          <div className="daily-card-reveal">
            <h3>Today's Card was:</h3>
            <div className="card-image-container">
              <img 
                src={dailyCard.image_uris?.normal || dailyCard.card_faces?.[0]?.image_uris?.normal} 
                alt={dailyCard.name}
                className="revealed-card-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="card-fallback" style={{ display: 'none' }}>
                <div className="card-fallback-content">
                  <strong>{dailyCard.name}</strong>
                  <div>CMC: {dailyCard.cmc}</div>
                  <div>{dailyCard.type_line}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="game-instructions">
        <h3>How to Play:</h3>
        <ul>
          <li>Guess the Magic card in 10 attempts</li>
          <li><span className="correct-example">Green</span> = Correct property</li>
          <li><span className="incorrect-example">Red</span> = Incorrect property</li>
          <li>Compare: Name, CMC, Colors, Type, and Rarity</li>
        </ul>
      </div>
    </div>
  );
}

export default Game; 