import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const [showRandomCards, setShowRandomCards] = useState(false);
  const [randomCards, setRandomCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const fetchRandomCards = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cards/random?count=3');
      const data = await response.json();
      if (data.cards && data.cards.length > 0) {
        setRandomCards(data.cards);
      }
    } catch (error) {
      console.error('Error fetching random cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCard2Click = () => {
    if (!showRandomCards) {
      fetchRandomCards();
    }
    setShowRandomCards(!showRandomCards);
  };

  const handleCloseRandomCards = () => {
    setShowRandomCards(false);
    setRandomCards([]);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newOrder = [...randomCards];
    const [movedCard] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, movedCard);
    setRandomCards(newOrder);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="home-container">
      <h2 className="home-title">Welcome to the MTG CounterTop</h2>
      <p className="home-desc">A small collection of MTG-related content. (Try spinning the top!)</p>
      <div className="home-links">
        <Link to="/search" className="home-link">Search for cards</Link>
        <Link to="/deckbuilder" className="home-link">Build decks</Link>
        <Link to="/game" className="home-link">Wordle Game</Link>
      </div>
      <div className="home-card-images">
        <div className="home-card-image-placeholder">
          <img src="/counterbalance.png" alt="Card 1" className="home-card-image" />
        </div>
        <div className="home-card-image-placeholder">
          <img 
            src="/top.png" 
            alt="Card 2" 
            className="home-card-image clickable-card" 
            onClick={handleCard2Click}
            style={{ cursor: 'pointer' }}
          />
        </div>
        {showRandomCards && (
          <div className="random-cards-container">
            {loading ? (
              <div className="loading-cards">Loading cards...</div>
            ) : (
              <>
                {randomCards.map((card, index) => {
                  const face = Array.isArray(card.card_faces) && card.card_faces.length > 0
                    ? card.card_faces[0]
                    : card;
                  return (
                    <div 
                      key={card.id} 
                      className={`random-card-item ${draggedIndex === index ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <img 
                        src={face.image_uris?.normal || card.image_uris?.normal} 
                        alt={face.name || card.name} 
                        className="random-card-image"
                        draggable={false}
                      />
                    </div>
                  );
                })}
                <button 
                  onClick={handleCloseRandomCards}
                  className="close-random-cards-btn"
                >
                  ×
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
