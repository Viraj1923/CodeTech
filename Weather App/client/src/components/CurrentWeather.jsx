import React from 'react';
import { getWeatherEmoji, formatTime, getWindDirection } from '../utils/weatherUtils';
import './CurrentWeather.css';

const StatCard = ({ icon, label, value }) => (
  <div className="stat-card">
    <span className="stat-icon">{icon}</span>
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  </div>
);

const CurrentWeather = ({ data, units }) => {
  const { current } = data;
  const now = new Date(current.dt * 1000);
  const isDay = current.dt > current.sunrise && current.dt < current.sunset;
  const unitSymbol = units === 'metric' ? '°C' : '°F';
  const speedUnit = units === 'metric' ? 'm/s' : 'mph';

  return (
    <div className="current-weather fade-up">
      <div className="cw-header">
        <div>
          <h1 className="cw-city">
            {current.city}
            <span className="cw-country">{current.country}</span>
          </h1>
          <p className="cw-datetime">
            {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp;
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="cw-icon-wrap">
          <img
            src={`https://openweathermap.org/img/wn/${current.icon}@4x.png`}
            alt={current.description}
            className="cw-icon"
          />
          <span className="cw-emoji">{getWeatherEmoji(current.description)}</span>
        </div>
      </div>

      <div className="cw-temp-row">
        <span className="cw-temp">{Math.round(current.temperature)}{unitSymbol}</span>
        <div className="cw-desc-col">
          <span className="cw-description">{current.description}</span>
          <span className="cw-feels">Feels like {Math.round(current.feels_like)}{unitSymbol}</span>
        </div>
      </div>

      <div className="cw-stats">
        <StatCard icon="💧" label="Humidity" value={`${current.humidity}%`} />
        <StatCard icon="💨" label="Wind" value={`${current.wind_speed} ${speedUnit} ${getWindDirection(current.wind_deg)}`} />
        <StatCard icon="🔭" label="Visibility" value={`${(current.visibility / 1000).toFixed(1)} km`} />
        <StatCard icon="📊" label="Pressure" value={`${current.pressure} hPa`} />
        <StatCard icon="🌅" label="Sunrise" value={formatTime(current.sunrise)} />
        <StatCard icon="🌇" label="Sunset" value={formatTime(current.sunset)} />
      </div>
    </div>
  );
};

export default CurrentWeather;
