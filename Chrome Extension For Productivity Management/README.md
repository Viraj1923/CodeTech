## 📌 Productivity Management Chrome Extension

A full-stack productivity tracking system that monitors browsing activity, logs usage data, and provides insights through a dashboard.

This project consists of:
- 🧩 Chrome Extension (frontend tracker)
- ⚙️ Node.js Backend (API + database)
- 📊 Dashboard (analytics UI)

---

## 🚀 Features

- ⏱️ Track time spent on websites
- 🌐 Monitor active tabs in real-time
- 📝 Store browsing logs in database
- 📊 Visual dashboard for productivity insights
- 🔄 Seamless integration between extension and backend

---

## 🏗️ Project Structure

Chrome Extension For Productivity Management/

├── backend/  
│   ├── config/  
│   ├── models/  
│   ├── routes/  
│   ├── app.js  
│   └── package.json  

├── chrome-extension/  
│   ├── manifest.json  
│   ├── background.js  
│   ├── popup.html  
│   ├── popup.js  
│   └── popup.css  

├── dashboard/  
│   ├── index.html  
│   ├── script.js  
│   └── style.css  

└── README.md  

---

## ⚙️ Tech Stack

- Frontend: HTML, CSS, JavaScript  
- Backend: Node.js, Express.js  
- Database: MongoDB  

---

## 🔧 Installation & Setup

### Clone the Repository

git clone <your-repo-url>  
cd Chrome-Extension-For-Productivity-Management  

---

### Backend Setup

cd backend  
npm install  

Create a .env file:

MONGO_URI=your_mongodb_connection_string  
PORT=5000  

Start server:

npm start  

---

### Load Chrome Extension

1. Open Chrome → chrome://extensions/  
2. Enable Developer Mode  
3. Click Load unpacked  
4. Select chrome-extension/ folder  

---

### Run Dashboard

Open dashboard/index.html  
(or use Live Server)

---

## 🔄 How It Works

1. Extension tracks active tabs  
2. Sends data to backend  
3. Backend stores in MongoDB  
4. Dashboard visualizes data  

---

## 📡 API Endpoints

POST /api/logs → Save log  
GET /api/logs → Fetch logs  

---

## 🧠 Future Improvements

- Authentication (JWT)  
- Advanced analytics (charts)  
- Website blocking  
- Cloud deployment  

---

