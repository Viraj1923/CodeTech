# 🌤 WeatherLive —Weather Application

A full-stack weather application built with the **MERN stack** (MongoDB, Express, React, Node.js), integrated with the **OpenWeatherMap API**.

---

## 📁 Project Structure

```
weather-app/
├── client/                  # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar.jsx / .css
│   │   │   ├── CurrentWeather.jsx / .css
│   │   │   ├── ForecastCard.jsx / .css
│   │   │   └── SearchHistory.jsx / .css
│   │   ├── services/
│   │   │   └── weatherService.js   # Axios API calls
│   │   ├── utils/
│   │   │   └── weatherUtils.js     # Helpers
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── server/                  # Express + Node backend
│   ├── models/
│   │   └── SearchHistory.js  # Mongoose model
│   ├── routes/
│   │   └── api.js            # Weather + history routes
│   ├── index.js              # Entry point
│   ├── .env.example
│   └── package.json
│
├── package.json             # Root scripts
└── README.md
```

---

## 🚀 Setup & Installation

### 1. Get an OpenWeatherMap API Key
- Go to [https://openweathermap.org/api](https://openweathermap.org/api)
- Sign up for a **free account**
- Navigate to **API Keys** and copy your key

### 2. Set Up MongoDB
- Install MongoDB locally: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Or use **MongoDB Atlas** (free cloud): [https://cloud.mongodb.com](https://cloud.mongodb.com)
- Copy your connection string

### 3. Configure Backend Environment

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
OPENWEATHERMAP_API_KEY=your_actual_api_key_here
MONGODB_URI=url
```

### 4. Install Dependencies

```bash
# From project root
npm install           # installs concurrently
cd server && npm install
cd ../client && npm install
```

### 5. Run the Application

```bash
# Terminal 1 — Start backend (from /server)
cd server
npm run dev

# Terminal 2 — Start frontend (from /client)
cd client
npm start
```

App will open at **http://localhost:3000**
API server runs at **http://localhost:5000**

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔍 City Search | Search weather by any city name |
| 📍 Geolocation | Detect and use device location |
| 🌡️ Current Weather | Temp, feels like, humidity, wind, visibility, pressure |
| 📅 5-Day Forecast | Daily high/low with icons |
| 🕐 Search History | MongoDB-backed recent searches |
| °C / °F Toggle | Switch between metric and imperial |
| 📱 Responsive | Mobile-first design |
| 🎨 Dynamic BG | Background changes with weather conditions |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather?city=London&units=metric` | Weather by city name |
| GET | `/api/weather/geo?lat=&lon=&units=metric` | Weather by coordinates |
| GET | `/api/history` | Get last 10 searches |
| DELETE | `/api/history` | Clear all search history |
| GET | `/health` | Server health check |

---

## 🛠 Tech Stack

- **MongoDB** — NoSQL database for search history
- **Express.js** — REST API server
- **React.js** — Frontend UI with hooks
- **Node.js** — JavaScript runtime

### Additional Libraries
- `axios` — HTTP requests
- `mongoose` — MongoDB ODM
- `cors` — Cross-origin resource sharing
- `dotenv` — Environment variables
- `nodemon` — Dev auto-reload
- `concurrently` — Run client + server simultaneously

---

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `OPENWEATHERMAP_API_KEY` | **Yes** | Your OWM API key |
| `MONGODB_URI` | No | MongoDB connection string (history disabled if not set) |

> **Note:** The app works without MongoDB — search history will simply be unavailable.

---

## 👨‍💻 Author

Task-2 | MERN Stack Internship Project
