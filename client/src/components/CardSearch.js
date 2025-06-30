import React, { useState } from 'react';
import Card from './Card';
import './CardSearch.css';

const COLOR_OPTIONS = [
  { label: 'White', value: 'W' },
  { label: 'Blue', value: 'U' },
  { label: 'Black', value: 'B' },
  { label: 'Red', value: 'R' },
  { label: 'Green', value: 'G' },
];
const LEGALITY_OPTIONS = [
  'standard', 'modern', 'legacy', 'vintage', 'commander', 'pioneer', 'pauper', 'penny', 'brawl', 'historic', 'alchemy', 'explorer', 'duel', 'oldschool', 'premodern', 'future'
];

function CardSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);
  const [type, setType] = useState('');
  const [cmc, setCmc] = useState('');
  const [legality, setLegality] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({
    selectedColors: [],
    type: '',
    cmc: '',
    legality: '',
  });

  const handleColorChange = (color) => {
    setPendingFilters((prev) => ({
      ...prev,
      selectedColors: prev.selectedColors.includes(color)
        ? prev.selectedColors.filter((c) => c !== color)
        : [...prev.selectedColors, color],
    }));
  };

  const openAdvanced = () => {
    setPendingFilters({
      selectedColors,
      type,
      cmc,
      legality,
    });
    setShowAdvanced(true);
  };

  const applyAdvanced = () => {
    setSelectedColors(pendingFilters.selectedColors);
    setType(pendingFilters.type);
    setCmc(pendingFilters.cmc);
    setLegality(pendingFilters.legality);
    setShowAdvanced(false);
    // Optionally trigger search here
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() && !selectedColors.length && !type && !cmc && !legality) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('name', query);
      if (selectedColors.length) params.append('color', selectedColors.join(','));
      if (type) params.append('type', type);
      if (cmc) params.append('cmc', cmc);
      if (legality) params.append('legality', legality);
      const res = await fetch(`/api/cards?${params.toString()}`);
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
    <div className="card-search-container home-container">
      <h2 className="home-title">Card Search</h2>
      <form onSubmit={handleSearch} className="card-search-form">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for a Magic card by name..."
          className="card-search-input"
        />
        <button type="submit" className="card-search-button home-link">Search</button>
      </form>
      <button className="advanced-search-btn" onClick={openAdvanced} type="button">Advanced Search</button>
      {showAdvanced && (
        <div className="advanced-search-modal">
          <div className="advanced-search-content">
            <h3>Advanced Search</h3>
            <div className="card-search-filter-group">
              <span className="card-search-filter-label">Color:</span>
              {COLOR_OPTIONS.map(opt => (
                <label key={opt.value} className={`color-checkbox color-${opt.value}`}>
                  <input
                    type="checkbox"
                    checked={pendingFilters.selectedColors.includes(opt.value)}
                    onChange={() => handleColorChange(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div className="card-search-filter-group">
              <span className="card-search-filter-label">Card Type:</span>
              <input
                type="text"
                value={pendingFilters.type}
                onChange={e => setPendingFilters(f => ({ ...f, type: e.target.value }))}
                placeholder="e.g. Instant, Human, etc."
                className="card-search-type-input"
              />
            </div>
            <div className="card-search-filter-group">
              <span className="card-search-filter-label">Mana Value (CMC):</span>
              <input
                type="number"
                min="0"
                value={pendingFilters.cmc}
                onChange={e => setPendingFilters(f => ({ ...f, cmc: e.target.value }))}
                placeholder="e.g. 3"
                className="card-search-mana-input"
              />
            </div>
            <div className="card-search-filter-group">
              <span className="card-search-filter-label">Legality:</span>
              <select
                value={pendingFilters.legality}
                onChange={e => setPendingFilters(f => ({ ...f, legality: e.target.value }))}
                className="card-search-legality-select"
              >
                <option value="">Any</option>
                {LEGALITY_OPTIONS.map(format => (
                  <option key={format} value={format}>{format.charAt(0).toUpperCase() + format.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="advanced-search-actions">
              <button className="advanced-search-apply home-link" type="button" onClick={applyAdvanced}>Apply Filters</button>
              <button className="advanced-search-cancel" type="button" onClick={() => setShowAdvanced(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
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