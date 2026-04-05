import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="notfound-page">
      <div className="notfound-code">404</div>
      <h2>Room not found</h2>
      <p>This room doesn't exist or the link may be broken.</p>
      <button className="join-btn" style={{ maxWidth: 200, marginTop: 24 }} onClick={() => navigate("/")}>
        ← Back to Home
      </button>
    </div>
  );
};

export default NotFound;
