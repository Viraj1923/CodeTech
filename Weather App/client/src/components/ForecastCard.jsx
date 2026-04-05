import React from 'react';
import { getWeatherEmoji, formatDate } from '../utils/weatherUtils';
import './ForecastCard.css';

const ForecastCard = ({ forecast, units }) => {
  const unitSymbol = units === 'metric' ? '°C' : '°F';

  return (
    <div className="forecast-section fade-up" style={{ animationDelay: '0.15s' }}>
      <h2 className="section-title">5-Day Forecast</h2>
      <div className="forecast-grid">
        {forecast.map((day, i) => (
          <div key={day.date} className="forecast-card" style={{ animationDelay: `${0.15 + i * 0.05}s` }}>
            <div className="fc-date">{i === 0 ? 'Today' : formatDate(day.date)}</div>
            <img
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.description}
              className="fc-icon"
            />
            <div className="fc-emoji">{getWeatherEmoji(day.description)}</div>
            <div className="fc-desc">{day.description}</div>
            <div className="fc-temps">
              <span className="fc-high">{Math.round(day.temp_max)}{unitSymbol}</span>
              <span className="fc-low">{Math.round(day.temp_min)}{unitSymbol}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastCard;
