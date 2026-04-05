import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import HomePage from "./pages/HomePage";
import DocumentEditor from "./pages/DocumentEditor";
import WhiteboardPage from "./pages/WhiteboardPage";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/document/:roomId" element={<DocumentEditor />} />
          <Route path="/whiteboard/:roomId" element={<WhiteboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
