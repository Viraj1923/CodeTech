import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import ForecastCard from './components/ForecastCard';
import SearchHistory from './components/SearchHistory';
import { fetchWeatherByCity, fetchWeatherByGeo, fetchHistory, clearHistory } from './services/weatherService';
import { getBgGradient } from './utils/weatherUtils';
import './App.css';

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [units, setUnits] = useState('metric');
  const [bgGradient, setBgGradient] = useState('linear-gradient(135deg, #0a0f1e 0%, #0e1628 100%)');

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch {
      // history is optional; silently fail if MongoDB is not connected
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSearch = async (city) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeatherByCity(city, units);
      setWeatherData(data);
      const isDay = data.current.dt > data.current.sunrise && data.current.dt < data.current.sunset;
      setBgGradient(getBgGradient(data.current.description, isDay));
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch weather. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeoSearch = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeatherByGeo(lat, lon, units);
      setWeatherData(data);
      const isDay = data.current.dt > data.current.sunrise && data.current.dt < data.current.sunset;
      setBgGradient(getBgGradient(data.current.description, isDay));
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch location weather.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitToggle = () => {
    setUnits(prev => prev === 'metric' ? 'imperial' : 'metric');
    if (weatherData) {
      // Re-fetch with new units
      handleSearch(weatherData.current.city);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setHistory([]);
    } catch {
      setHistory([]);
    }
  };

  return (
    <div className="app" style={{ '--bg-gradient': bgGradient }}>
      <div className="app-bg" />

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="logo">
            <span className="logo-icon">🌤</span>
            <span className="logo-text">WeatherLive</span>
          </div>
          <button className="unit-toggle" onClick={handleUnitToggle}>
            <span className={units === 'metric' ? 'active' : ''}>°C</span>
            <span className="divider">/</span>
            <span className={units === 'imperial' ? 'active' : ''}>°F</span>
          </button>
        </header>

        {/* Hero / Search area */}
        {!weatherData && (
          <div className="hero">
            <h1 className="hero-title">
              What's the weather<br />
              <span className="hero-accent">wherever you are?</span>
            </h1>
            <p className="hero-sub">Real-time weather powered by OpenWeatherMap</p>
          </div>
        )}

        <SearchBar onSearch={handleSearch} onGeoSearch={handleGeoSearch} loading={loading} />

        {/* Error */}
        {error && (
          <div className="error-banner fade-up">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="skeleton-wrap fade-up">
            <div className="skeleton skeleton-main" />
            <div className="skeleton-row">
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton skeleton-fc" />)}
            </div>
          </div>
        )}

        {/* Weather Results */}
        {!loading && weatherData && (
          <div className="results">
            <CurrentWeather data={weatherData} units={units} />
            <ForecastCard forecast={weatherData.forecast} units={units} />
          </div>
        )}

        {/* Search History */}
        {!loading && (
          <SearchHistory
            history={history}
            onSelect={handleSearch}
            onClear={handleClearHistory}
          />
        )}

        {/* Empty state */}
        {!loading && !weatherData && !error && (
          <div className="empty-state">
            <div className="es-icons">
              <span>☀️</span><span>⛅</span><span>🌧️</span><span>❄️</span>
            </div>
            <p>Try searching for a city like <strong>Mumbai</strong>, <strong>London</strong>, or <strong>New York</strong></p>
          </div>
        )}
      </div>

      <footer className="app-footer">
        Built with MERN Stack · Powered by OpenWeatherMap API
      </footer>
    </div>
  );
};

export default App;
