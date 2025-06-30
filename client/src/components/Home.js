import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <h2 className="home-title">Welcome to the MTG CounterTop</h2>
      <p className="home-desc">Search for cards, build decks, or play mtg-related games.</p>
      <div className="home-card-images">
        <div className="home-card-image-placeholder">
          <img src="/card1.jpg" alt="Card 1" className="home-card-image" />
        </div>
        <div className="home-card-image-placeholder">
          <img src="/card2.jpg" alt="Card 2" className="home-card-image" />
        </div>
      </div>
    </div>
  );
}

export default Home;
