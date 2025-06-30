import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-title">MTG App</span>
      <Link to="/" className="navbar-link">Home</Link>
      <Link to="/search" className="navbar-link">Card Search</Link>
      <a href="#" className="navbar-link">Deckbuilder</a>
      <a href="#" className="navbar-link">Game</a>
    </nav>
  );
}

export default Navbar; 