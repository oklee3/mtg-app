import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-title">MTG CounterTop</NavLink>
      <NavLink to="/" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Home</NavLink>
      <NavLink to="/search" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Card Search</NavLink>
      <a href="#" className="navbar-link">Deckbuilder</a>
      <NavLink to="/game" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>MTG Wordle</NavLink>
    </nav>
  );
}

export default Navbar; 