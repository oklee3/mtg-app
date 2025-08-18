import React, { useState } from 'react';
import './Card.css';

function Card({ card }) {
  const [faceIndex, setFaceIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const isDoubleFaced = Array.isArray(card.card_faces) && card.card_faces.length > 1;
  const face = isDoubleFaced ? card.card_faces[faceIndex] : card;
  const imageUrl = face.image_uris?.normal || card.image_uris?.normal;
  const name = face.name || card.name;
  const typeLine = face.type_line || card.type_line;
  const setName = card.set_name;

  const handleFlip = (e) => {
    e.stopPropagation();
    setFaceIndex((prev) => (prev === 0 ? 1 : 0));
  };

  const handleCardClick = () => {
    setShowModal(true);
    setFaceIndex(0);
  };

  const handleCloseModal = (e) => {
    e.stopPropagation();
    setShowModal(false);
  };

  return (
    <>
      <div className="mtg-card" onClick={handleCardClick} style={{ cursor: 'pointer', position: 'relative' }}>
        <img src={imageUrl} alt={name} className="mtg-card-image large" />
        {isDoubleFaced && (
          <button
            className="mtg-card-flip-icon"
            onClick={handleFlip}
            title="Flip Card"
          >
            &#x21bb;
          </button>
        )}
      </div>
      {showModal && (
        <div className="mtg-card-modal-overlay" onClick={handleCloseModal}>
          <div className="mtg-card-modal" onClick={e => e.stopPropagation()} style={{ position: 'relative', flexDirection: 'column', alignItems: 'center' }}>
            <button className="mtg-card-modal-close" onClick={handleCloseModal}>×</button>
            <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={imageUrl} alt={name} className="mtg-card-modal-image" />
              {isDoubleFaced && (
                <button
                  className="mtg-card-flip-icon mtg-card-flip-icon-modal"
                  onClick={handleFlip}
                  title="Flip Card"
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                >
                  &#x21bb;
                </button>
              )}
            </div>
            {card.prices && (card.prices.usd || card.prices.eur || card.prices.tix) && (
              <div className="mtg-card-modal-prices mtg-card-modal-prices-vertical">
                {card.prices.usd && <div className="mtg-card-price-label">USD: <span className="mtg-card-price-value">${card.prices.usd}</span></div>}
                {card.prices.tix && <div className="mtg-card-price-label">TIX: <span className="mtg-card-price-value">{card.prices.tix}</span></div>}
              </div>
            )}
            <div className="mtg-card-modal-info">
              <div className="mtg-card-modal-name"><b>{name}</b></div>
              <div className="mtg-card-modal-type">{typeLine}</div>
              <div className="mtg-card-modal-set">Set: {setName}</div>
              {face.mana_cost && <div className="mtg-card-modal-mana">Mana Cost: {face.mana_cost}</div>}
              {face.oracle_text && <div className="mtg-card-modal-oracle">{face.oracle_text}</div>}
              {card.rarity && <div className="mtg-card-modal-rarity">Rarity: {card.rarity}</div>}
              {card.legalities && (
                <div className="mtg-card-modal-legalities">
                  <b>Legalities:</b>
                  <ul>
                    {Object.entries(card.legalities).map(([format, status]) => (
                      <li key={format}>
                        {format}: <span className={status === 'legal' ? 'legal-status-legal' : 'legal-status-not-legal'}>{status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Card; 