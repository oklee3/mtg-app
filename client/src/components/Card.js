import React from 'react';
import './Card.css';

function Card({ card }) {
  return (
    <div className="mtg-card">
      <img src={card.image_uris?.small} alt={card.name} className="mtg-card-image" />
      <div className="mtg-card-name">{card.name}</div>
      <div className="mtg-card-type">{card.type_line}</div>
      <div className="mtg-card-set">{card.set_name}</div>
    </div>
  );
}

export default Card; 