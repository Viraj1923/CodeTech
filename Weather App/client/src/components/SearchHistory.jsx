import React from 'react';
import './SearchHistory.css';

const SearchHistory = ({ history, onSelect, onClear }) => {
  if (!history.length) return null;

  return (
    <div className="history-section fade-up" style={{ animationDelay: '0.25s' }}>
      <div className="history-header">
        <h2 className="section-title">Recent Searches</h2>
        <button className="clear-btn" onClick={onClear}>Clear All</button>
      </div>
      <div className="history-list">
        {history.map((item) => (
          <button
            key={item._id}
            className="history-item"
            onClick={() => onSelect(item.city)}
          >
            <span className="hi-icon">🕐</span>
            <div className="hi-info">
              <span className="hi-city">{item.city}, {item.country}</span>
              <span className="hi-desc">{item.description}</span>
            </div>
            <span className="hi-temp">{Math.round(item.temperature)}°</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;
