import React, { useState } from 'react';
import Card from './Card';
import './CardSearch.css';

function CardSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await fetch(`/api/cards?name=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setError('No results found.');
      } else {
        setResults(data);
      }
    } catch (err) {
      setError('Error fetching cards.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-search-container">
      <form onSubmit={handleSearch} className="card-search-form">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for a Magic card by name..."
          className="card-search-input"
        />
        <button type="submit" className="card-search-button">Search</button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div className="card-search-error">{error}</div>}
      <div className="card-search-results">
        {results.map(card => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

export default CardSearch; 