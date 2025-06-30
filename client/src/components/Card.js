import React, { useState } from 'react';
import './Card.css';

function Card({ card }) {
  const [faceIndex, setFaceIndex] = useState(0);
  const isDoubleFaced = Array.isArray(card.card_faces) && card.card_faces.length > 1;
  const face = isDoubleFaced ? card.card_faces[faceIndex] : card;
  const imageUrl = face.image_uris?.small || card.image_uris?.small;
  const name = face.name || card.name;
  const typeLine = face.type_line || card.type_line;
  const setName = card.set_name;

  const handleFlip = () => {
    setFaceIndex((prev) => (prev === 0 ? 1 : 0));
  };

  return (
    <div className="mtg-card">
      <img src={imageUrl} alt={name} className="mtg-card-image" />
      <div className="mtg-card-name">{name}</div>
      <div className="mtg-card-type">{typeLine}</div>
      <div className="mtg-card-set">{setName}</div>
      {isDoubleFaced && (
        <button className="mtg-card-flip-btn" onClick={handleFlip}>
          Flip
        </button>
      )}
    </div>
  );
}

export default Card; 