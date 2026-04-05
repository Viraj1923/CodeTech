import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, onGeoSearch, loading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  const handleGeo = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => onGeoSearch(pos.coords.latitude, pos.coords.longitude),
      () => alert('Location access denied')
    );
  };

  return (
    <div className="searchbar-wrap">
      <form className="searchbar" onSubmit={handleSubmit}>
        <div className="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search city... (e.g. Mumbai, London)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="search-btn" disabled={loading || !query.trim()}>
          {loading ? <span className="spinner" /> : 'Search'}
        </button>
      </form>
      <button className="geo-btn" onClick={handleGeo} disabled={loading} title="Use my location">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
          <circle cx="12" cy="12" r="10" strokeDasharray="2 4"/>
        </svg>
        My Location
      </button>
    </div>
  );
};

export default SearchBar;
