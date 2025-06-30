import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CardSearch from './components/CardSearch';
import Home from './components/Home';
import BottomBar from './components/BottomBar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<CardSearch />} />
      </Routes>
    </Router>
  );
}

export default App;
