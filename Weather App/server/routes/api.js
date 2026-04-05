const express = require('express');
const router = express.Router();
const axios = require('axios');
const SearchHistory = require('../models/SearchHistory');

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// GET /api/weather?city=London
router.get('/weather', async (req, res) => {
  const { city, units = 'metric' } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`${BASE_URL}/weather`, {
        params: { q: city, appid: API_KEY, units },
      }),
      axios.get(`${BASE_URL}/forecast`, {
        params: { q: city, appid: API_KEY, units, cnt: 40 },
      }),
    ]);

    const current = currentRes.data;
    const forecast = forecastRes.data;

    // Save to MongoDB
    try {
      await SearchHistory.create({
        city: current.name,
        country: current.sys.country,
        temperature: current.main.temp,
        description: current.weather[0].description,
      });
    } catch (dbErr) {
      console.warn('MongoDB save failed (continuing):', dbErr.message);
    }

    // Process 5-day forecast (one entry per day at noon)
    const dailyForecast = [];
    const seen = new Set();
    for (const item of forecast.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!seen.has(date) && dailyForecast.length < 5) {
        seen.add(date);
        dailyForecast.push({
          date,
          temp_max: item.main.temp_max,
          temp_min: item.main.temp_min,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        });
      }
    }

    res.json({
      current: {
        city: current.name,
        country: current.sys.country,
        temperature: current.main.temp,
        feels_like: current.main.feels_like,
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        visibility: current.visibility,
        wind_speed: current.wind.speed,
        wind_deg: current.wind.deg,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        sunrise: current.sys.sunrise,
        sunset: current.sys.sunset,
        dt: current.dt,
      },
      forecast: dailyForecast,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'City not found. Please check the spelling.' });
    }
    if (err.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid API key. Please set a valid OpenWeatherMap API key.' });
    }
    console.error('Weather API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather data. Please try again.' });
  }
});

// GET /api/weather/geo?lat=&lon=
router.get('/weather/geo', async (req, res) => {
  const { lat, lon, units = 'metric' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`${BASE_URL}/weather`, {
        params: { lat, lon, appid: API_KEY, units },
      }),
      axios.get(`${BASE_URL}/forecast`, {
        params: { lat, lon, appid: API_KEY, units, cnt: 40 },
      }),
    ]);

    const current = currentRes.data;
    const forecast = forecastRes.data;

    const dailyForecast = [];
    const seen = new Set();
    for (const item of forecast.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!seen.has(date) && dailyForecast.length < 5) {
        seen.add(date);
        dailyForecast.push({
          date,
          temp_max: item.main.temp_max,
          temp_min: item.main.temp_min,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        });
      }
    }

    res.json({
      current: {
        city: current.name,
        country: current.sys.country,
        temperature: current.main.temp,
        feels_like: current.main.feels_like,
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        visibility: current.visibility,
        wind_speed: current.wind.speed,
        wind_deg: current.wind.deg,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        sunrise: current.sys.sunrise,
        sunset: current.sys.sunset,
        dt: current.dt,
      },
      forecast: dailyForecast,
    });
  } catch (err) {
    console.error('Geo weather error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather by location.' });
  }
});

// GET /api/history
router.get('/history', async (req, res) => {
  try {
    const history = await SearchHistory.find()
      .sort({ searchedAt: -1 })
      .limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

// DELETE /api/history
router.delete('/history', async (req, res) => {
  try {
    await SearchHistory.deleteMany({});
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

module.exports = router;
