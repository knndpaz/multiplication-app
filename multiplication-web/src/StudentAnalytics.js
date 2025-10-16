import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import { getStudentAnalytics } from "./studentsAnalytics";

function StudentAnalytics({ user, onLogout }) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLevels, setExpandedLevels] = useState({});

  useEffect(() => {
    async function loadStudentAnalytics() {
      setLoading(true);
      const data = await getStudentAnalytics(studentId);
      setAnalytics(data);
      setLoading(false);
    }
    loadStudentAnalytics();
  }, [studentId]);

  const toggleLevel = (levelName) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [levelName]: !prev[levelName],
    }));
  };

  if (loading) {
    return (
      <div className="student-analytics-bg">
        <Header user={user} onLogout={onLogout} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading student analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="student-analytics-bg">
        <Header user={user} onLogout={onLogout} />
        <div className="error-container">
          <span className="material-icons error-icon">person_off</span>
          <h2>Student not found</h2>
          <p>
            The student you're looking for doesn't exist or has been removed.
          </p>
          <button
            className="back-to-reports-btn"
            onClick={() => navigate("/reports")}
          >
            <span className="material-icons">arrow_back</span>
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="student-analytics-bg">
      <Header user={user} onLogout={onLogout} />
      <div className="student-analytics-content">
        {/* Breadcrumb */}
        <div className="breadcrumb card">
          <span
            onClick={() => navigate("/reports")}
            style={{ cursor: "pointer" }}
          >
            Reports
          </span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>{">"}</span>
          <span style={{ color: "#888" }}>{analytics.name}</span>
        </div>

        {/* Header Section */}
        <div className="student-header card">
          <button className="back-btn" onClick={() => navigate("/reports")}>
            <span className="material-icons">arrow_back</span>
            Back to Reports
          </button>
          <div className="student-info">
            <div className="student-avatar">
              <span>
                {analytics.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
            <div className="student-details">
              <h1 className="student-name">{analytics.name}</h1>
              <div className="student-meta">
                <span className="meta-item">
                  <span className="material-icons">school</span>
                  Grade {analytics.grade}
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-item">
                  <span className="material-icons">badge</span>
                  ID: {analytics.studentId}
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-item online">
                  <span className="online-dot"></span>
                  Online Now
                </span>
              </div>
            </div>
          </div>
          <div className="last-updated">
            <span className="material-icons">update</span>
            Last Updated: {analytics.lastUpdated}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #F864D3, #FF8DC7)",
              }}
            >
              <span className="material-icons">timeline</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{analytics.overallProgress}%</div>
              <div className="stat-label">Overall Progress</div>
              <div className="stat-trend positive">
                <span className="material-icons">trending_up</span>
                On track
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #9D7CE8, #B794F6)",
              }}
            >
              <span className="material-icons">verified</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{analytics.avgAccuracy}%</div>
              <div className="stat-label">Avg Accuracy</div>
              <div className="stat-trend positive">
                <span className="material-icons">trending_up</span>
                Excellent
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #6BAAFF, #60A5FA)",
              }}
            >
              <span className="material-icons">schedule</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {formatTime(analytics.totalTime)}
              </div>
              <div className="stat-label">Total Time</div>
              <div className="stat-trend neutral">
                <span className="material-icons">access_time</span>
                Active learner
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #4CAF50, #45a049)",
              }}
            >
              <span className="material-icons">event_available</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{analytics.sessionsCompleted}</div>
              <div className="stat-label">Sessions Completed</div>
              <div className="stat-trend positive">
                <span className="material-icons">celebration</span>
                Great job!
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-main-row">
          {/* Level Progress Report */}
          <div className="level-progress-card card">
            <div className="section-header">
              <h2 className="section-title">
                <span className="material-icons">assessment</span>
                Level Progress Report
              </h2>
              <div className="progress-legend">
                <span className="legend-item">
                  <span className="legend-dot correct"></span>
                  Correct
                </span>
                <span className="legend-item">
                  <span className="legend-dot incorrect"></span>
                  Incorrect
                </span>
              </div>
            </div>

            {analytics.levelProgress.map((level, idx) => (
              <div key={level.name} className="level-item">
                <div
                  className="level-header"
                  onClick={() => toggleLevel(level.name)}
                >
                  <div className="level-info">
                    <div
                      className="level-icon"
                      style={{
                        background: level.color,
                      }}
                    >
                      <span className="material-icons">{level.icon}</span>
                    </div>
                    <div>
                      <div className="level-name">{level.name}</div>
                      <div className="level-difficulty">{level.difficulty}</div>
                    </div>
                  </div>
                  <div className="level-status">
                    <div className="completion-ring">
                      <svg width="50" height="50">
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          fill="none"
                          stroke="#e0e0e0"
                          strokeWidth="4"
                        />
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          fill="none"
                          stroke={level.color}
                          strokeWidth="4"
                          strokeDasharray={`${level.completion * 1.26} 126`}
                          strokeLinecap="round"
                          transform="rotate(-90 25 25)"
                        />
                      </svg>
                      <span className="ring-percentage">
                        {level.completion}%
                      </span>
                    </div>
                    <div
                      className={`status-badge ${level.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {level.status}
                    </div>
                    <button
                      className={`expand-btn ${
                        expandedLevels[level.name] ? "expanded" : ""
                      }`}
                    >
                      <span className="material-icons">expand_more</span>
                    </button>
                  </div>
                </div>

                {expandedLevels[level.name] && (
                  <div className="level-details">
                    <div className="answers-section">
                      <div className="answer-stats">
                        <div className="answer-stat correct-stat">
                          <span className="material-icons">check_circle</span>
                          <div>
                            <div className="answer-count">
                              {level.correctAnswers}
                            </div>
                            <div className="answer-label">Correct</div>
                          </div>
                        </div>
                        <div className="answer-stat incorrect-stat">
                          <span className="material-icons">cancel</span>
                          <div>
                            <div className="answer-count">
                              {level.incorrectAnswers}
                            </div>
                            <div className="answer-label">Incorrect</div>
                          </div>
                        </div>
                        <div className="answer-stat total-stat">
                          <span className="material-icons">help</span>
                          <div>
                            <div className="answer-count">
                              {level.correctAnswers + level.incorrectAnswers}
                            </div>
                            <div className="answer-label">Total</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="progress-section">
                      <div className="progress-header">
                        <span>Question Progress</span>
                        <span>
                          {level.correctAnswers}/
                          {level.correctAnswers + level.incorrectAnswers}{" "}
                          Answered
                        </span>
                      </div>
                      <div className="progress-indicators">
                        {level.questionProgress.map((isCorrect, qIdx) => (
                          <div
                            key={qIdx}
                            className={`progress-dot ${
                              isCorrect ? "correct" : "incorrect"
                            }`}
                            title={`Question ${qIdx + 1}: ${
                              isCorrect ? "Correct ✓" : "Incorrect ✗"
                            }`}
                          >
                            {qIdx + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="analytics-side-col">
            {/* Overall Performance */}
            <div className="performance-card card">
              <h3 className="side-title">
                <span className="material-icons">donut_large</span>
                Overall Performance
              </h3>
              <div className="performance-circle">
                <svg width="160" height="160" className="circle-progress">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="url(#gradient1)"
                    strokeWidth="12"
                    strokeDasharray={`${analytics.overallProgress * 4.4} 440`}
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                  />
                  <defs>
                    <linearGradient
                      id="gradient1"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#F864D3" />
                      <stop offset="100%" stopColor="#9D7CE8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="circle-text">
                  <div className="circle-percentage">
                    {analytics.overallProgress}%
                  </div>
                  <div className="circle-label">Complete</div>
                </div>
              </div>
              <div className="performance-status">
                <div className="status-header">
                  <span className="material-icons">emoji_events</span>
                  <h4>Excellent Performance!</h4>
                </div>
                <p>{analytics.performanceMessage}</p>
              </div>
            </div>

            {/* Performance Trends */}
            <div className="trends-card card">
              <h3 className="side-title">
                <span className="material-icons">insights</span>
                Performance Trends
              </h3>

              <div className="trend-item featured">
                <div className="trend-icon-large">
                  <span className="material-icons">trending_up</span>
                </div>
                <div className="trend-content">
                  <div className="trend-value">
                    +{analytics.trends.accuracyImprovement}%
                  </div>
                  <div className="trend-label">Accuracy Improvement</div>
                  <div className="trend-subtitle">
                    Great progress this week!
                  </div>
                </div>
              </div>

              <div className="trend-grid">
                <div className="trend-metric-card">
                  <span className="material-icons metric-icon">schedule</span>
                  <div className="metric-value">
                    {analytics.trends.avgSessionTime}
                    <span className="metric-unit">min</span>
                  </div>
                  <div className="metric-label">Avg Session</div>
                </div>

                <div className="trend-metric-card">
                  <span className="material-icons metric-icon">event</span>
                  <div className="metric-value">
                    {analytics.trends.sessionsThisWeek}
                  </div>
                  <div className="metric-label">This Week</div>
                </div>

                <div className="trend-metric-card">
                  <span className="material-icons metric-icon">bolt</span>
                  <div className="metric-value">
                    {analytics.trends.firstTrySuccess}
                    <span className="metric-unit">%</span>
                  </div>
                  <div className="metric-label">First Try</div>
                </div>
              </div>
            </div>

            {/* Session Statistics */}
            <div className="session-stats-card card">
              <h3 className="side-title">
                <span className="material-icons">analytics</span>
                Session Statistics
              </h3>

              <div className="session-stat-row">
                <div className="stat-row-label">
                  <span className="material-icons">quiz</span>
                  Problems Solved
                </div>
                <span className="stat-row-value">
                  {analytics.sessionStats.problemsSolved}
                </span>
              </div>

              <div className="session-stat-row highlight">
                <div className="stat-row-label">
                  <span className="material-icons">check_circle</span>
                  Correct Answers
                </div>
                <span className="stat-row-value success">
                  {analytics.sessionStats.correctAnswers}
                  <span className="percentage">
                    ({analytics.sessionStats.correctPercentage}%)
                  </span>
                </span>
              </div>

              <div className="session-stat-row">
                <div className="stat-row-label">
                  <span className="material-icons">lightbulb</span>
                  Hints Used
                </div>
                <span className="stat-row-value">
                  {analytics.sessionStats.hintsUsed}
                </span>
              </div>

              <div className="session-stat-row">
                <div className="stat-row-label">
                  <span className="material-icons">timer</span>
                  Avg Response
                </div>
                <span className="stat-row-value">
                  {analytics.sessionStats.avgResponseTime}s
                </span>
              </div>

              <div className="session-stat-row highlight">
                <div className="stat-row-label">
                  <span className="material-icons">flash_on</span>
                  Fastest Solve
                </div>
                <span className="stat-row-value warning">
                  {analytics.sessionStats.fastestTime}s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        .student-analytics-bg {
          min-height: 100vh;
          background: linear-gradient(180deg, #FFB6D9 0%, #9D7CE8 50%, #6BAAFF 100%);
          padding: 0;
          font-family: 'Poppins', sans-serif;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 70vh;
        }
        
        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 6px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 24px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-text {
          color: white;
          font-size: 20px;
          font-weight: 600;
        }
        
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 70vh;
          color: white;
          text-align: center;
          padding: 20px;
        }
        
        .error-icon {
          font-size: 80px;
          margin-bottom: 20px;
          opacity: 0.8;
        }
        
        .error-container h2 {
          font-size: 2rem;
          margin-bottom: 12px;
        }
        
        .error-container p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 32px;
        }
        
        .back-to-reports-btn {
          background: white;
          color: #F864D3;
          border: none;
          border-radius: 12px;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s;
          font-family: 'Poppins', sans-serif;
        }
        
        .back-to-reports-btn:hover {
          transform: translateY(-2px);
        }
        
        .student-analytics-content {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: 24px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .breadcrumb {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #555;
          font-weight: 500;
          padding: 14px 20px;
        }
        
        .student-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .back-btn {
          background: linear-gradient(135deg, #F864D3, #FF8DC7);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: transform 0.2s;
          box-shadow: 0 4px 15px rgba(248, 100, 211, 0.3);
          font-family: 'Poppins', sans-serif;
        }
        
        .back-btn:hover {
          transform: translateY(-2px);
        }
        
        .student-info {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
        }
        
        .student-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F864D3 0%, #9D7CE8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 24px;
          box-shadow: 0 4px 20px rgba(248, 100, 211, 0.4);
          border: 4px solid white;
        }
        
        .student-details {
          flex: 1;
        }
        
        .student-name {
          margin: 0 0 8px 0;
          font-size: 1.8rem;
          font-weight: 700;
          color: #333;
        }
        
        .student-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 14px;
          flex-wrap: wrap;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .meta-item .material-icons {
          font-size: 16px;
          color: #9D7CE8;
        }
        
        .meta-item.online {
          color: #4CAF50;
          font-weight: 600;
        }
        
        .online-dot {
          width: 8px;
          height: 8px;
          background: #4CAF50;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .meta-separator {
          color: #ccc;
        }
        
        .last-updated {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
          font-size: 13px;
        }
        
        .last-updated .material-icons {
          font-size: 16px;
        }
        
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        
        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .stat-icon-wrapper .material-icons {
          font-size: 28px;
          color: white;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
          line-height: 1;
          margin-bottom: 6px;
        }
        
        .stat-label {
          color: #666;
          font-size: 13px;
          margin-bottom: 6px;
          font-weight: 500;
        }
        
        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .stat-trend.positive {
          color: #4CAF50;
        }
        
        .stat-trend.neutral {
          color: #666;
        }
        
        .stat-trend .material-icons {
          font-size: 14px;
        }
        
        .analytics-main-row {
          display: flex;
          gap: 24px;
        }
        
        .level-progress-card {
          flex: 2;
          min-width: 0;
        }
        
        .analytics-side-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 320px;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.3rem;
          font-weight: 700;
          color: #333;
        }
        
        .section-title .material-icons {
          font-size: 28px;
          color: #9D7CE8;
        }
        
        .progress-legend {
          display: flex;
          gap: 16px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #666;
        }
        
        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }
        
        .legend-dot.correct {
          background: #4CAF50;
        }
        
        .legend-dot.incorrect {
          background: #f44336;
        }
        
        .level-item {
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          margin-bottom: 16px;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .level-item:hover {
          border-color: #9D7CE8;
          box-shadow: 0 4px 20px rgba(157, 124, 232, 0.1);
        }
        
        .level-header {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #F9FAFB;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .level-header:hover {
          background: #F3F4F6;
        }
        
        .level-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .level-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .level-icon .material-icons {
          font-size: 26px;
          color: white;
        }
        
        .level-name {
          font-weight: 700;
          color: #333;
          font-size: 1.1rem;
          margin-bottom: 4px;
        }
        
        .level-difficulty {
          font-size: 13px;
          color: #666;
        }
        
        .level-status {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .completion-ring {
          position: relative;
          width: 50px;
          height: 50px;
        }
        
        .ring-percentage {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 700;
          font-size: 12px;
          color: #333;
        }
        
        .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .status-badge.completed {
          background: linear-gradient(135deg, #d4edda, #c3e6cb);
          color: #155724;
        }
        
        .status-badge.in-progress {
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          color: #856404;
        }
        
        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #9D7CE8;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s;
        }
        
        .expand-btn.expanded {
          transform: rotate(180deg);
        }
        
        .expand-btn .material-icons {
          font-size: 28px;
        }
        
        .level-details {
          padding: 24px;
          border-top: 2px solid #E5E7EB;
          background: white;
          animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .answers-section {
          margin-bottom: 24px;
        }
        
        .answer-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        
        .answer-stat {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          background: #F9FAFB;
        }
        
        .answer-stat .material-icons {
          font-size: 32px;
        }
        
        .correct-stat .material-icons {
          color: #4CAF50;
        }
        
        .incorrect-stat .material-icons {
          color: #f44336;
        }
        
        .total-stat .material-icons {
          color: #9D7CE8;
        }
        
        .answer-count {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          line-height: 1;
        }
        
        .answer-label {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }
        
        .progress-section {
          background: #F9FAFB;
          padding: 16px;
          border-radius: 12px;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        
        .progress-indicators {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .progress-dot {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .progress-dot:hover {
          transform: scale(1.1);
        }
        
        .progress-dot.correct {
          background: linear-gradient(135deg, #4CAF50, #45a049);
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
        }
        
        .progress-dot.incorrect {
          background: linear-gradient(135deg, #f44336, #e53935);
          box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
        }
        
        .side-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: #333;
        }
        
        .side-title .material-icons {
          font-size: 24px;
          color: #9D7CE8;
        }
        
        .performance-card {
          text-align: center;
        }
        
        .performance-circle {
          position: relative;
          margin: 24px auto;
          display: inline-block;
        }
        
        .circle-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        
        .circle-percentage {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #F864D3, #9D7CE8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        
        .circle-label {
          font-size: 14px;
          color: #666;
          margin-top: 4px;
          font-weight: 500;
        }
        
        .performance-status {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          padding: 20px;
          border-radius: 12px;
          margin-top: 20px;
        }
        
        .status-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .status-header .material-icons {
          color: #FFA500;
          font-size: 24px;
        }
        
        .status-header h4 {
          color: #4CAF50;
          font-size: 1.1rem;
          font-weight: 700;
        }
        
        .performance-status p {
          font-size: 14px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
        
        .trends-card {
          background: white;
        }
        
        .trend-item {
          padding: 16px 0;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .trend-item:last-child {
          border-bottom: none;
        }
        
        .trend-item.featured {
          background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 16px;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .trend-icon-large {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        }
        
        .trend-icon-large .material-icons {
          color: white;
          font-size: 32px;
        }
        
        .trend-content {
          flex: 1;
        }
        
        .trend-value {
          font-weight: 700;
          color: #4CAF50;
          font-size: 2rem;
          line-height: 1;
          margin-bottom: 6px;
        }
        
        .trend-label {
          font-size: 14px;
          color: #333;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .trend-subtitle {
          font-size: 12px;
          color: #666;
        }
        
        .trend-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 16px;
        }
        
        .trend-metric-card {
          background: #F9FAFB;
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          transition: all 0.2s;
        }
        
        .trend-metric-card:hover {
          background: #F3F4F6;
          transform: translateY(-2px);
        }
        
        .metric-icon {
          color: #9D7CE8;
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          line-height: 1;
        }
        
        .metric-unit {
          font-size: 1rem;
          color: #666;
        }
        
        .metric-label {
          font-size: 11px;
          color: #666;
          margin-top: 6px;
          font-weight: 500;
        }
        
        .session-stats-card {
          background: white;
        }
        
        .session-stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .session-stat-row:last-child {
          border-bottom: none;
        }
        
        .session-stat-row.highlight {
          background: #F9FAFB;
          padding: 14px 16px;
          margin: 0 -16px;
          padding-left: 16px;
          padding-right: 16px;
          border-radius: 8px;
          border: none;
        }
        
        .stat-row-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 14px;
          font-weight: 500;
        }
        
        .stat-row-label .material-icons {
          font-size: 20px;
          color: #9D7CE8;
        }
        
        .stat-row-value {
          font-weight: 700;
          color: #333;
          font-size: 15px;
        }
        
        .stat-row-value.success {
          color: #4CAF50;
        }
        
        .stat-row-value.warning {
          color: #FFA500;
        }
        
        .percentage {
          font-size: 13px;
          color: #666;
          font-weight: 500;
          margin-left: 4px;
        }
        
        @media (max-width: 1200px) {
          .analytics-main-row {
            flex-direction: column;
          }
          
          .analytics-side-col {
            min-width: 0;
          }
          
          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .trend-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .student-analytics-content {
            padding: 16px;
          }
          
          .card {
            padding: 16px;
          }
          
          .student-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .student-info {
            width: 100%;
          }
          
          .student-avatar {
            width: 60px;
            height: 60px;
            font-size: 20px;
          }
          
          .student-name {
            font-size: 1.4rem;
          }
          
          .stats-overview {
            grid-template-columns: 1fr;
          }
          
          .stat-card {
            padding: 20px;
          }
          
          .stat-icon-wrapper {
            width: 48px;
            height: 48px;
          }
          
          .stat-icon-wrapper .material-icons {
            font-size: 24px;
          }
          
          .stat-value {
            font-size: 1.6rem;
          }
          
          .section-title {
            font-size: 1.1rem;
          }
          
          .level-header {
            padding: 16px;
            flex-wrap: wrap;
            gap: 12px;
          }
          
          .level-status {
            flex-wrap: wrap;
            gap: 12px;
          }
          
          .answer-stats {
            grid-template-columns: 1fr;
          }
          
          .progress-indicators {
            gap: 6px;
          }
          
          .progress-dot {
            width: 32px;
            height: 32px;
            font-size: 11px;
          }
          
          .trend-grid {
            grid-template-columns: 1fr;
          }
          
          .circle-percentage {
            font-size: 2rem;
          }
        }
        
        @media (max-width: 480px) {
          .student-analytics-content {
            padding: 12px;
          }
          
          .card {
            padding: 12px;
            border-radius: 16px;
          }
          
          .breadcrumb {
            font-size: 11px;
            padding: 10px 14px;
          }
          
          .back-btn {
            padding: 8px 16px;
            font-size: 13px;
          }
          
          .student-avatar {
            width: 50px;
            height: 50px;
            font-size: 18px;
          }
          
          .student-name {
            font-size: 1.2rem;
          }
          
          .student-meta {
            font-size: 12px;
          }
          
          .last-updated {
            font-size: 11px;
          }
          
          .stat-card {
            padding: 16px;
            flex-direction: row;
          }
          
          .stat-icon-wrapper {
            width: 44px;
            height: 44px;
          }
          
          .stat-icon-wrapper .material-icons {
            font-size: 22px;
          }
          
          .stat-value {
            font-size: 1.4rem;
          }
          
          .stat-label {
            font-size: 12px;
          }
          
          .section-title {
            font-size: 1rem;
          }
          
          .section-title .material-icons {
            font-size: 24px;
          }
          
          .level-icon {
            width: 44px;
            height: 44px;
          }
          
          .level-icon .material-icons {
            font-size: 22px;
          }
          
          .level-name {
            font-size: 1rem;
          }
          
          .level-details {
            padding: 16px;
          }
          
          .answer-stat {
            padding: 12px;
          }
          
          .answer-stat .material-icons {
            font-size: 28px;
          }
          
          .answer-count {
            font-size: 1.3rem;
          }
          
          .progress-indicators {
            gap: 4px;
          }
          
          .progress-dot {
            width: 28px;
            height: 28px;
            font-size: 10px;
          }
          
          .side-title {
            font-size: 1rem;
          }
          
          .performance-circle svg {
            width: 140px;
            height: 140px;
          }
          
          .circle-percentage {
            font-size: 1.8rem;
          }
          
          .circle-label {
            font-size: 12px;
          }
          
          .performance-status {
            padding: 16px;
          }
          
          .status-header h4 {
            font-size: 1rem;
          }
          
          .performance-status p {
            font-size: 13px;
          }
          
          .trend-item.featured {
            padding: 16px;
          }
          
          .trend-icon-large {
            width: 50px;
            height: 50px;
          }
          
          .trend-icon-large .material-icons {
            font-size: 28px;
          }
          
          .trend-value {
            font-size: 1.6rem;
          }
          
          .trend-label {
            font-size: 13px;
          }
          
          .trend-subtitle {
            font-size: 11px;
          }
          
          .trend-metric-card {
            padding: 12px;
          }
          
          .metric-icon {
            font-size: 20px;
          }
          
          .metric-value {
            font-size: 1.3rem;
          }
          
          .metric-label {
            font-size: 10px;
          }
          
          .session-stat-row {
            padding: 12px 0;
          }
          
          .session-stat-row.highlight {
            padding: 12px;
          }
          
          .stat-row-label {
            font-size: 13px;
          }
          
          .stat-row-label .material-icons {
            font-size: 18px;
          }
          
          .stat-row-value {
            font-size: 14px;
          }
          
          .percentage {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default StudentAnalytics;
