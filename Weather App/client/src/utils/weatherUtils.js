export const getWeatherEmoji = (description = '') => {
  const d = description.toLowerCase();
  if (d.includes('thunder')) return '⛈️';
  if (d.includes('drizzle')) return '🌦️';
  if (d.includes('rain')) return '🌧️';
  if (d.includes('snow')) return '❄️';
  if (d.includes('mist') || d.includes('fog') || d.includes('haze')) return '🌫️';
  if (d.includes('clear')) return '☀️';
  if (d.includes('few clouds')) return '🌤️';
  if (d.includes('scattered')) return '⛅';
  if (d.includes('cloud')) return '☁️';
  return '🌡️';
};

export const formatTime = (unix) => {
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

export const getWindDirection = (deg) => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
};

export const getUVLevel = (uv) => {
  if (uv < 3) return { label: 'Low', color: '#7bffd4' };
  if (uv < 6) return { label: 'Moderate', color: '#ffe066' };
  if (uv < 8) return { label: 'High', color: '#ffb347' };
  return { label: 'Very High', color: '#ff6b6b' };
};

export const getBgGradient = (description = '', isDay = true) => {
  const d = description.toLowerCase();
  if (d.includes('thunder')) return 'linear-gradient(135deg, #1a1040 0%, #2d1b69 100%)';
  if (d.includes('rain') || d.includes('drizzle')) return 'linear-gradient(135deg, #0d1b2a 0%, #1b3a5c 100%)';
  if (d.includes('snow')) return 'linear-gradient(135deg, #1a2a4a 0%, #2e4a7a 100%)';
  if (d.includes('mist') || d.includes('fog')) return 'linear-gradient(135deg, #1a1f2e 0%, #2a3045 100%)';
  if (d.includes('clear') && isDay) return 'linear-gradient(135deg, #0d1b3e 0%, #1a3a6e 100%)';
  if (d.includes('clear') && !isDay) return 'linear-gradient(135deg, #050d1a 0%, #0d1f3e 100%)';
  if (d.includes('cloud')) return 'linear-gradient(135deg, #131c30 0%, #1e2d4a 100%)';
  return 'linear-gradient(135deg, #0a0f1e 0%, #0e1628 100%)';
};
