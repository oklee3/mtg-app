import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <h2 className="home-title">Welcome to the MTG CounterTop</h2>
      <p className="home-desc">A small collection of MTG-related content.</p>
      <div className="home-links">
        <Link to="/search" className="home-link">Search for cards</Link>
        <Link to="/deckbuilder" className="home-link">Build decks</Link>
        <Link to="/game" className="home-link">Art Guessing Game</Link>
      </div>
      <div className="home-card-images">
        <div className="home-card-image-placeholder">
          <img src="/counterbalance.png" alt="Card 1" className="home-card-image" />
        </div>
        <div className="home-card-image-placeholder">
          <img src="/top.png" alt="Card 2" className="home-card-image" />
        </div>
      </div>
    </div>
  );
}

export default Home;
