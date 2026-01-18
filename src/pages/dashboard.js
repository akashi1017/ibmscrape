import React from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      {/* STATS */}
      <section className="stats-grid">
        <div className="stat-card">
          <h2>124</h2>
          <p>Total Predictions</p>
        </div>
        <div className="stat-card">
          <h2>97%</h2>
          <p>Model Accuracy</p>
        </div>
        <div className="stat-card">
          <h2>38</h2>
          <p>Active Users</p>
        </div>
        <div className="stat-card">
          <h2>9</h2>
          <p>Digits Supported</p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="dashboard-main">
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <ul>
            <li>User uploaded digit image</li>
            <li>Prediction completed successfully</li>
            <li>New user registered</li>
          </ul>
        </div>

        <div className="dashboard-card">
          <h3>Admin Actions</h3>
          <button className="action-btn">View Prediction History</button>
          <button className="action-btn secondary">
            Manage Users
          </button>
          <button className="action-btn secondary">
            Model Information
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
