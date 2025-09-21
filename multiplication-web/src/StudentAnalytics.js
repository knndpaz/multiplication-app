import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import { getStudentAnalytics } from "./studentsAnalytics";

function StudentAnalytics({ user, onLogout }) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentAnalytics() {
      setLoading(true);
      const data = await getStudentAnalytics(studentId);
      setAnalytics(data);
      setLoading(false);
    }
    loadStudentAnalytics();
  }, [studentId]);

  if (loading) {
    return (
      <div className="student-analytics-bg">
        <Header user={user} onLogout={onLogout} />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#888'
        }}>
          Loading student analytics...
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="student-analytics-bg">
        <Header user={user} onLogout={onLogout} />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#888'
        }}>
          Student not found
          <button onClick={() => navigate('/reports')} style={{ marginTop: '20px' }}>
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
        {/* Header Section */}
        <div className="student-header card">
          <button className="back-btn" onClick={() => navigate('/reports')}>
            <span className="material-icons">arrow_back</span>
            Back
          </button>
          <div className="student-info">
            <div className="student-avatar">
              <span>{analytics.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
            </div>
            <div>
              <h1 className="student-name">{analytics.name}</h1>
              <div className="student-meta">
                Grade {analytics.grade} • Real Section • Student ID: {analytics.studentId} • Online Now
              </div>
            </div>
          </div>
          <div className="last-updated">
            Last Updated: {analytics.lastUpdated}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fff3e0' }}>
              <span className="material-icons" style={{ color: '#ff8f00' }}>hourglass_empty</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{analytics.overallProgress}%</div>
              <div className="stat-label">Overall Progress</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e3f2fd' }}>
              <span className="material-icons" style={{ color: '#1976d2' }}>percent</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{analytics.avgAccuracy}%</div>
              <div className="stat-label">Avg Accuracy</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fce4ec' }}>
              <span className="material-icons" style={{ color: '#e91e63' }}>access_time</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{formatTime(analytics.totalTime)}</div>
              <div className="stat-label">Total Time</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e8f5e8' }}>
              <span className="material-icons" style={{ color: '#4caf50' }}>bar_chart</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{analytics.sessionsCompleted}</div>
              <div className="stat-label">Sessions</div>
            </div>
          </div>
        </div>

        <div className="analytics-main-row">
          {/* Level Progress Report */}
          <div className="level-progress-card card">
            <h2 className="section-title">
              <span className="material-icons">assessment</span>
              Level Progress Report
            </h2>
            
            {analytics.levelProgress.map((level, idx) => (
              <div key={level.name} className="level-item">
                <div className="level-header">
                  <div className="level-info">
                    <div className="level-icon" style={{ 
                      background: level.color,
                      color: '#fff'
                    }}>
                      <span className="material-icons">{level.icon}</span>
                    </div>
                    <div>
                      <div className="level-name">{level.name}</div>
                      <div className="level-difficulty">{level.difficulty}</div>
                    </div>
                  </div>
                  <div className="level-status">
                    <div className="completion-percentage">{level.completion}%</div>
                    <div className={`status-badge ${level.status.toLowerCase().replace(' ', '-')}`}>
                      {level.status}
                    </div>
                    <button className="expand-btn">
                      <span className="material-icons">expand_more</span>
                    </button>
                  </div>
                </div>
                
                <div className="level-details">
                  <div className="answers-section">
                    <div className="answers-header">
                      <span className="material-icons correct">check_circle</span>
                      <span>Correct Answers</span>
                      <span className="answer-count">{level.correctAnswers}</span>
                    </div>
                    <div className="answers-header">
                      <span>Incorrect Answers</span>
                      <span className="answer-count">{level.incorrectAnswers}</span>
                    </div>
                  </div>
                  
                  <div className="progress-indicators">
                    {level.questionProgress.map((progress, qIdx) => (
                      <div 
                        key={qIdx} 
                        className={`progress-dot ${progress ? 'correct' : 'incorrect'}`}
                        title={`Question ${qIdx + 1}: ${progress ? 'Correct' : 'Incorrect'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="analytics-side-col">
            {/* Overall Performance */}
            <div className="performance-card card">
              <h3 className="side-title">
                <span className="material-icons" style={{ color: '#4caf50' }}>donut_large</span>
                Overall Performance
              </h3>
              <div className="performance-circle">
                <svg width="140" height="140" className="circle-progress">
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    stroke="#4fc3f7"
                    strokeWidth="8"
                    strokeDasharray={`${analytics.overallProgress * 3.77} 377`}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                  />
                </svg>
                <div className="circle-text">
                  <div className="circle-percentage">{analytics.overallProgress}%</div>
                </div>
              </div>
              <div className="performance-status">
                <h4 style={{ color: '#4caf50', marginBottom: '8px' }}>Excellent Performance!</h4>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                  {analytics.performanceMessage}
                </p>
              </div>
            </div>

            {/* Performance Trends */}
            <div className="trends-card card">
              <h3 className="side-title">
                <span className="material-icons" style={{ color: '#2196f3' }}>trending_up</span>
                Performance Trends
              </h3>
              
              <div className="trend-item">
                <div className="trend-icon success">
                  <span className="material-icons">trending_up</span>
                </div>
                <div>
                  <div className="trend-value">+{analytics.trends.accuracyImprovement}%</div>
                  <div className="trend-label">Accuracy Improvement</div>
                </div>
              </div>
              
              <div className="trend-item">
                <div className="trend-metric">
                  <div className="metric-value">{analytics.trends.avgSessionTime}min</div>
                  <div className="metric-label">Avg Session Time</div>
                </div>
              </div>
              
              <div className="trend-item">
                <div className="trend-metric">
                  <div className="metric-value">{analytics.trends.sessionsThisWeek}</div>
                  <div className="metric-label">Sessions This Week</div>
                </div>
              </div>
              
              <div className="trend-item">
                <div className="trend-metric">
                  <div className="metric-value">{analytics.trends.firstTrySuccess}%</div>
                  <div className="metric-label">First Try Success</div>
                </div>
              </div>
            </div>

            {/* Session Statistics */}
            <div className="session-stats-card card">
              <h3 className="side-title">
                <span className="material-icons" style={{ color: '#ff9800' }}>bolt</span>
                Session Statistics
              </h3>
              
              <div className="session-stat-row">
                <span className="stat-label">Problems Solved:</span>
                <span className="stat-value">{analytics.sessionStats.problemsSolved}</span>
              </div>
              
              <div className="session-stat-row">
                <span className="stat-label">Correct Answers:</span>
                <span className="stat-value">{analytics.sessionStats.correctAnswers} ({analytics.sessionStats.correctPercentage}%)</span>
              </div>
              
              <div className="session-stat-row">
                <span className="stat-label">Hints Used:</span>
                <span className="stat-value">{analytics.sessionStats.hintsUsed}</span>
              </div>
              
              <div className="session-stat-row">
                <span className="stat-label">Average Response Time:</span>
                <span className="stat-value">{analytics.sessionStats.avgResponseTime} seconds</span>
              </div>
              
              <div className="session-stat-row">
                <span className="stat-label">Fastest Solve Time:</span>
                <span className="stat-value">{analytics.sessionStats.fastestTime} seconds</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        
        .student-analytics-bg {
          min-height: 100vh;
          background: #f5f5f5;
          padding: 0;
        }
        
        .student-analytics-content {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          padding: 24px;
          margin-bottom: 20px;
        }
        
        .student-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .back-btn {
          background: #ff9800;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .student-info {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          margin-left: 20px;
        }
        
        .student-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        
        .student-name {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }
        
        .student-meta {
          color: #666;
          font-size: 14px;
        }
        
        .last-updated {
          color: #888;
          font-size: 12px;
        }
        
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }
        
        .stat-label {
          color: #666;
          font-size: 14px;
        }
        
        .analytics-main-row {
          display: flex;
          gap: 24px;
        }
        
        .level-progress-card {
          flex: 2;
        }
        
        .analytics-side-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #333;
        }
        
        .level-item {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          margin-bottom: 16px;
          overflow: hidden;
        }
        
        .level-header {
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fafafa;
        }
        
        .level-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .level-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .level-name {
          font-weight: 600;
          color: #333;
        }
        
        .level-difficulty {
          font-size: 12px;
          color: #666;
        }
        
        .level-status {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .completion-percentage {
          font-weight: bold;
          font-size: 18px;
          color: #333;
        }
        
        .status-badge {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .status-badge.completed {
          background: #e8f5e8;
          color: #2e7d32;
        }
        
        .status-badge.in-progress {
          background: #fff3e0;
          color: #f57c00;
        }
        
        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
        }
        
        .level-details {
          padding: 16px;
          border-top: 1px solid #e0e0e0;
        }
        
        .answers-section {
          margin-bottom: 16px;
        }
        
        .answers-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .answers-header .material-icons.correct {
          color: #4caf50;
        }
        
        .answer-count {
          margin-left: auto;
          font-weight: bold;
        }
        
        .progress-indicators {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        
        .progress-dot {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          color: white;
        }
        
        .progress-dot.correct {
          background: #4caf50;
        }
        
        .progress-dot.incorrect {
          background: #f44336;
        }
        
        .side-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #333;
        }
        
        .performance-card {
          text-align: center;
        }
        
        .performance-circle {
          position: relative;
          margin: 20px 0;
          display: flex;
          justify-content: center;
        }
        
        .circle-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .circle-percentage {
          font-size: 28px;
          font-weight: bold;
          color: #333;
        }
        
        .trend-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .trend-item:last-child {
          border-bottom: none;
        }
        
        .trend-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .trend-icon.success {
          background: #e8f5e8;
          color: #4caf50;
        }
        
        .trend-value {
          font-weight: bold;
          color: #4caf50;
          font-size: 16px;
        }
        
        .trend-label {
          font-size: 12px;
          color: #666;
        }
        
        .trend-metric {
          text-align: center;
        }
        
        .metric-value {
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }
        
        .metric-label {
          font-size: 12px;
          color: #666;
        }
        
        .session-stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .session-stat-row:last-child {
          border-bottom: none;
        }
        
        .session-stat-row .stat-label {
          color: #666;
          font-size: 14px;
        }
        
        .session-stat-row .stat-value {
          font-weight: bold;
          color: #333;
        }
        
        @media (max-width: 1200px) {
          .analytics-main-row {
            flex-direction: column;
          }
          
          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .student-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .student-info {
            margin-left: 0;
          }
          
          .stats-overview {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default StudentAnalytics;