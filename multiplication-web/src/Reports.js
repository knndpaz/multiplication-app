import React, { useState, useEffect } from "react";
import Header from "./Header";
import people from "./assets/people.png";
import { getReportsAnalytics } from "./reportsAnalytics";
import { useNavigate } from "react-router-dom";

function Reports({ user, onLogout }) {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    async function loadReportsAnalytics() {
      setLoading(true);
      const data = await getReportsAnalytics();
      setAnalytics(data);
      setLoading(false);
    }
    loadReportsAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="reports-bg">
        <Header user={user} onLogout={onLogout} />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#888'
        }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil((analytics?.studentPerformances?.length || 0) / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = analytics?.studentPerformances?.slice(startIndex, endIndex) || [];

  const getScoreClass = (score) => {
    if (score >= 85) return "reports-score-green";
    if (score >= 70) return "reports-score-blue";
    if (score >= 60) return "reports-score-yellow";
    return "reports-score reports-score-red";
  };

  return (
    <div className="reports-bg">
      <Header user={user} onLogout={onLogout} />
      <div className="reports-content">
        <div className="reports-breadcrumb card">
          <span>Dashboard</span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>{'>'}</span>
          <span style={{ color: "#888" }}>Reports</span>
        </div>
        
        <div className="reports-title-row card">
          <div className="reports-title-left">
            <span className="material-icons reports-title-icon">person</span>
            <div>
              <div className="reports-title">Student Performance Analytics</div>
            </div>
          </div>
          <div className="reports-title-right">
            <select className="reports-select">
              <option>All Time</option>
            </select>
            <select className="reports-select">
              <option>All levels</option>
            </select>
            <div className="reports-search">
              <input placeholder="Search Student" />
              <span className="material-icons">search</span>
            </div>
          </div>
        </div>

        <div className="reports-stats-row card">
          <div className="reports-stat">
            <div className="material-icons reports-stat-icon" style={{ color: "#a259ff" }}>groups</div>
            <div className="reports-stat-label">TOTAL STUDENTS</div>
            <div className="reports-stat-value">{analytics?.totalStudents || 0}</div>
          </div>
          <div className="reports-stat">
            <div className="material-icons reports-stat-icon" style={{ color: "#3ecf8e" }}>bar_chart</div>
            <div className="reports-stat-label">CLASS AVERAGE</div>
            <div className="reports-stat-value" style={{ color: "#3ecf8e" }}>
              {analytics?.classAverage?.average || 0}%
            </div>
            <div className="reports-stat-desc" style={{ color: "#3ecf8e" }}>
              +{analytics?.classAverage?.improvement || 0}% improvement
            </div>
          </div>
          <div className="reports-stat">
            <div className="material-icons reports-stat-icon" style={{ color: "#ff6b6b" }}>priority_high</div>
            <div className="reports-stat-label">NEED SUPPORT</div>
            <div className="reports-stat-value" style={{ color: "#ff6b6b" }}>
              {analytics?.needSupport || 0}
            </div>
            <div className="reports-stat-desc" style={{ color: "#ff6b6b" }}>
              &lt; below 60% score
            </div>
          </div>
          <div className="reports-stat">
            <div className="material-icons reports-stat-icon" style={{ color: "#ffb300" }}>emoji_events</div>
            <div className="reports-stat-label">TOP PERFORMERS</div>
            <div className="reports-stat-value" style={{ color: "#3ecf8e" }}>
              {analytics?.topPerformers || 0}
            </div>
            <div className="reports-stat-desc" style={{ color: "#3ecf8e" }}>
              &gt; above 85% score
            </div>
          </div>
        </div>

        <div className="reports-main-row">
          <div className="reports-main-col card">
            <div className="reports-section-title">Individual Student Performance</div>
            <div className="reports-student-table">
              <div className="reports-table-header">
                <span>Students</span>
                <span>Overall Score</span>
              </div>
              {currentStudents.map(student => (
                <div 
                  key={student.id} 
                  className="reports-table-row clickable-row"
                  onClick={() => navigate(`/student/${student.id}`)}
                >
                  <div className="reports-student-info">
                    <img src={people} alt="" className="reports-student-img" />
                    <div>
                      <div className="reports-student-name">{student.name}</div>
                      <div className="reports-student-meta">
                        Sessions: {student.sessionsPlayed} • ID: {student.id.slice(-6)}
                      </div>
                    </div>
                  </div>
                  <span className={getScoreClass(student.overallScore)}>
                    {student.overallScore}%
                  </span>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="reports-pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <span
                    key={page}
                    className={`reports-page ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="reports-side-col">
            <div className="reports-side-card card">
              <div className="reports-side-title" style={{ color: "#ffb300" }}>
                <span className="material-icons" style={{ verticalAlign: "middle", marginRight: 6 }}>emoji_events</span>
                Top Performers
              </div>
              {analytics?.topPerformersList?.length > 0 ? (
                analytics.topPerformersList.map(performer => (
                  <div key={performer.id} className="reports-performer-row">
                    <div>
                      <div className="reports-performer-name">{performer.name}</div>
                      <div className="reports-performer-meta">
                        {performer.topLevel} • {performer.correctAnswers}/{performer.totalQuestions} questions answered correctly
                      </div>
                    </div>
                    <span className={`reports-performer-score ${getScoreClass(performer.score)}`}>
                      {performer.score}%
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                  No top performers yet
                </div>
              )}
            </div>

            <div className="reports-side-card card">
              <div className="reports-side-title" style={{ color: "#ff6b6b" }}>
                <span className="material-icons" style={{ verticalAlign: "middle", marginRight: 6 }}>warning</span>
                Students Needing Support
              </div>
              {analytics?.studentsNeedingSupport?.length > 0 ? (
                analytics.studentsNeedingSupport.map(student => (
                  <div key={student.id} className="reports-support-row">
                    <div className="reports-support-info">
                      <img src={people} alt="" className="reports-support-img" />
                      <div>
                        <div className="reports-support-name">{student.name}</div>
                        <div className="reports-support-meta">
                          {student.score}% • {student.issue}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                  All students performing well!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        .reports-bg {
          min-height: 100vh;
          background: #EAEAEA;
          padding: 0;
        }
        .reports-content {
          padding: 32px 24px 24px 24px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          padding: 22px 32px;
          margin-bottom: 18px;
        }
        .reports-breadcrumb {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #444;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          font-family: 'Inter', Arial, sans-serif;
          font-weight: 500;
          letter-spacing: 0.01em;
          margin-bottom: 18px;
          padding: 12px 18px;
        }
        .reports-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .reports-title-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .reports-title-icon {
          font-size: 38px;
          color: #a259ff;
          margin-right: 8px;
        }
        .reports-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #222;
        }
        .reports-title-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .reports-select {
          border: 1.5px solid #e0e0e0;
          border-radius: 7px;
          padding: 7px 14px;
          font-size: 15px;
          background: #fafbfc;
          color: #444;
        }
        .reports-search {
          display: flex;
          align-items: center;
          background: #f3f3f3;
          border-radius: 7px;
          padding: 4px 10px;
          border: 1.5px solid #e0e0e0;
        }
        .reports-search input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 15px;
          width: 120px;
        }
        .reports-search .material-icons {
          font-size: 20px;
          color: #bbb;
        }
        .reports-stats-row {
          display: flex;
          gap: 24px;
          margin-bottom: 18px;
        }
        .reports-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          background: #fff;
          border-radius: 14px;
          padding: 18px 22px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .reports-stat-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }
        .reports-stat-label {
          font-size: 13px;
          color: #888;
          margin-bottom: 2px;
        }
        .reports-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .reports-stat-desc {
          font-size: 12px;
          margin-top: 2px;
        }
        .reports-main-row {
          display: flex;
          gap: 24px;
        }
        .reports-main-col {
          flex: 2.2;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .reports-section-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 18px;
          color: #222;
        }
        .reports-student-table {
          background: #fafbfc;
          border-radius: 12px;
          padding: 18px 0;
          margin-bottom: 18px;
        }
        .reports-table-header {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          color: #888;
          font-weight: 500;
          padding: 0 32px 10px 32px;
          border-bottom: 1.5px solid #eee;
        }
        .reports-table-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 32px;
          border-bottom: 1px solid #f0f0f0;
        }
        .reports-table-row:last-child {
          border-bottom: none;
        }
        .reports-student-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .reports-student-img {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
        }
        .reports-student-name {
          font-weight: 600;
          color: #222;
        }
        .reports-student-meta {
          font-size: 12px;
          color: #888;
        }
        .reports-score {
          font-weight: 600;
          font-size: 15px;
          padding: 4px 14px;
          border-radius: 8px;
          background: #eee;
        }
        .reports-score-green {
          background: #e6fff2;
          color: #3ecf8e;
        }
        .reports-score-yellow {
          background: #fffbe6;
          color: #ffb300;
        }
        .reports-score-blue {
          background: #e6f0ff;
          color: #4fd1ff;
        }
        .reports-score-red {
          background: #ffe6e6;
          color: #ff6b6b;
        }
        .reports-pagination {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 8px;
        }
        .reports-page {
          padding: 4px 12px;
          border-radius: 6px;
          background: #f3f3f3;
          color: #888;
          font-size: 14px;
          cursor: pointer;
        }
        .reports-page.active {
          background: #4fd1ff;
          color: #fff;
          font-weight: 600;
        }
        .reports-side-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-width: 320px;
        }
        .reports-side-card {
          margin-bottom: 0;
        }
        .reports-side-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
        }
        .reports-performer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .reports-performer-row:last-child {
          border-bottom: none;
        }
        .reports-performer-name {
          font-weight: 600;
          color: #222;
        }
        .reports-performer-meta {
          font-size: 12px;
          color: #888;
        }
        .reports-performer-score {
          font-weight: 600;
          font-size: 15px;
          padding: 4px 14px;
          border-radius: 8px;
          background: #eee;
        }
        .reports-support-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .reports-support-row:last-child {
          border-bottom: none;
        }
        .reports-support-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .reports-support-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
        }
        .reports-support-name {
          font-weight: 600;
          color: #222;
        }
        .reports-support-meta {
          font-size: 12px;
          color: #888;
        }
        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .clickable-row:hover {
          background-color: #f8f9fa;
        }
        @media (max-width: 1100px) {
          .reports-main-row {
            flex-direction: column;
          }
          .reports-side-col {
            min-width: 0;
            margin-top: 24px;
          }
        }
        @media (max-width: 700px) {
          .reports-content {
            padding: 10px 2vw;
          }
          .card {
            padding: 12px 6px;
          }
          .reports-table-header, .reports-table-row {
            padding-left: 10px;
            padding-right: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default Reports;