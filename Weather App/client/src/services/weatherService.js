import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const fetchWeatherByCity = async (city, units = 'metric') => {
  const { data } = await api.get('/weather', { params: { city, units } });
  return data;
};

export const fetchWeatherByGeo = async (lat, lon, units = 'metric') => {
  const { data } = await api.get('/weather/geo', { params: { lat, lon, units } });
  return data;
};

export const fetchHistory = async () => {
  const { data } = await api.get('/history');
  return data;
};

export const clearHistory = async () => {
  const { data } = await api.delete('/history');
  return data;
};
