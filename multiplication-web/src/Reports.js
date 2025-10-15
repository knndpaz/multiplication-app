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
  const [searchQuery, setSearchQuery] = useState("");
  const studentsPerPage = 10;

  // First useEffect - load analytics
  useEffect(() => {
    async function loadReportsAnalytics() {
      setLoading(true);
      const data = await getReportsAnalytics();
      setAnalytics(data);
      setLoading(false);
    }
    loadReportsAnalytics();
  }, []);

  // Second useEffect - reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="reports-bg">
        <Header user={user} onLogout={onLogout} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading analytics...</div>
        </div>
      </div>
    );
  }

  // Filter students based on search query
  const filteredStudents =
    analytics?.studentPerformances?.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const getScoreClass = (score) => {
    if (score >= 85) return "reports-score-green";
    if (score >= 70) return "reports-score-blue";
    if (score >= 60) return "reports-score-yellow";
    return "reports-score reports-score-red";
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="reports-bg">
      <Header user={user} onLogout={onLogout} />
      <div className="reports-content">
        <div className="reports-breadcrumb card">
          <span>Dashboard</span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>{">"}</span>
          <span style={{ color: "#888" }}>Reports</span>
        </div>

        <div className="reports-title-row card">
          <div className="reports-title-left">
            <div className="reports-icon-wrapper">
              <span className="material-icons reports-title-icon">
                analytics
              </span>
            </div>
            <div>
              <div className="reports-title">Student Performance Analytics</div>
              <div className="reports-subtitle">
                Track and monitor student progress
              </div>
            </div>
          </div>
          <div className="reports-title-right">
            <div className="reports-search">
              <span className="material-icons search-icon">search</span>
              <input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <span
                  className="material-icons clear-icon"
                  onClick={clearSearch}
                >
                  close
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="reports-stats-row">
          <div className="reports-stat card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #B794F6, #9D7CE8)",
              }}
            >
              <span className="material-icons">groups</span>
            </div>
            <div className="stat-content">
              <div className="reports-stat-label">Total Students</div>
              <div className="reports-stat-value">
                {analytics?.totalStudents || 0}
              </div>
            </div>
          </div>

          <div className="reports-stat card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #4CAF50, #45a049)",
              }}
            >
              <span className="material-icons">bar_chart</span>
            </div>
            <div className="stat-content">
              <div className="reports-stat-label">Class Average</div>
              <div className="reports-stat-value" style={{ color: "#4CAF50" }}>
                {analytics?.classAverage?.average || 0}%
              </div>
              <div className="reports-stat-desc" style={{ color: "#4CAF50" }}>
                <span className="material-icons" style={{ fontSize: 14 }}>
                  trending_up
                </span>
                +{analytics?.classAverage?.improvement || 0}% improvement
              </div>
            </div>
          </div>

          <div className="reports-stat card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #ff6b6b, #ee5a6f)",
              }}
            >
              <span className="material-icons">priority_high</span>
            </div>
            <div className="stat-content">
              <div className="reports-stat-label">Need Support</div>
              <div className="reports-stat-value" style={{ color: "#ff6b6b" }}>
                {analytics?.needSupport || 0}
              </div>
              <div className="reports-stat-desc" style={{ color: "#ff6b6b" }}>
                Below 60% score
              </div>
            </div>
          </div>

          <div className="reports-stat card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #FFD93D, #FFA500)",
              }}
            >
              <span className="material-icons">emoji_events</span>
            </div>
            <div className="stat-content">
              <div className="reports-stat-label">Top Performers</div>
              <div className="reports-stat-value" style={{ color: "#FFA500" }}>
                {analytics?.topPerformers || 0}
              </div>
              <div className="reports-stat-desc" style={{ color: "#FFA500" }}>
                Above 85% score
              </div>
            </div>
          </div>
        </div>

        <div className="reports-main-row">
          <div className="reports-main-col card">
            <div className="reports-section-header">
              <div className="reports-section-title">
                <span className="material-icons" style={{ marginRight: 8 }}>
                  people
                </span>
                Individual Student Performance
              </div>
              {searchQuery && (
                <div className="search-results-info">
                  Found {filteredStudents.length} student
                  {filteredStudents.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="reports-student-table">
              <div className="reports-table-header">
                <span>Student</span>
                <span className="header-score">Overall Score</span>
              </div>
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="reports-table-row clickable-row"
                    onClick={() => navigate(`/student/${student.id}`)}
                  >
                    <div className="reports-student-info">
                      <img
                        src={people}
                        alt=""
                        className="reports-student-img"
                      />
                      <div>
                        <div className="reports-student-name">
                          {student.name}
                        </div>
                        <div className="reports-student-meta">
                          <span className="material-icons meta-icon">
                            play_circle
                          </span>
                          {student.sessionsPlayed} sessions
                          <span className="meta-separator">•</span>
                          ID: {student.id.slice(-6)}
                        </div>
                      </div>
                    </div>
                    <span className={getScoreClass(student.overallScore)}>
                      {student.overallScore}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <span className="material-icons">search_off</span>
                  <p>No students found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="reports-pagination">
                <button
                  className="page-nav"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="material-icons">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <span
                          key={page}
                          className={`reports-page ${
                            currentPage === page ? "active" : ""
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </span>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="page-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}

                <button
                  className="page-nav"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>
            )}
          </div>

          <div className="reports-side-col">
            <div className="reports-side-card card">
              <div className="reports-side-title" style={{ color: "#FFA500" }}>
                <span
                  className="material-icons"
                  style={{ verticalAlign: "middle", marginRight: 8 }}
                >
                  emoji_events
                </span>
                Top Performers
              </div>
              {analytics?.topPerformersList?.length > 0 ? (
                analytics.topPerformersList.map((performer, index) => (
                  <div key={performer.id} className="reports-performer-row">
                    <div className="performer-rank">{index + 1}</div>
                    <div className="performer-info">
                      <div className="reports-performer-name">
                        {performer.name}
                      </div>
                      <div className="reports-performer-meta">
                        {performer.topLevel} • {performer.correctAnswers}/
                        {performer.totalQuestions} correct
                      </div>
                    </div>
                    <span
                      className={`reports-performer-score ${getScoreClass(
                        performer.score
                      )}`}
                    >
                      {performer.score}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="material-icons">emoji_events</span>
                  <p>No top performers yet</p>
                </div>
              )}
            </div>

            <div className="reports-side-card card">
              <div className="reports-side-title" style={{ color: "#ff6b6b" }}>
                <span
                  className="material-icons"
                  style={{ verticalAlign: "middle", marginRight: 8 }}
                >
                  warning
                </span>
                Students Needing Support
              </div>
              {analytics?.studentsNeedingSupport?.length > 0 ? (
                analytics.studentsNeedingSupport.map((student) => (
                  <div key={student.id} className="reports-support-row">
                    <div className="reports-support-info">
                      <img
                        src={people}
                        alt=""
                        className="reports-support-img"
                      />
                      <div>
                        <div className="reports-support-name">
                          {student.name}
                        </div>
                        <div className="reports-support-meta">
                          <span className="support-score">
                            {student.score}%
                          </span>
                          <span className="meta-separator">•</span>
                          {student.issue}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state success">
                  <span className="material-icons">check_circle</span>
                  <p>All students performing well!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        .reports-bg {
          min-height: 100vh;
          background: linear-gradient(180deg, #F864D3 0%, #9D7CE8 50%, #6BAAFF 100%);
          padding: 0;
          font-family: 'Poppins', sans-serif;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 60vh;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-text {
          color: white;
          font-size: 18px;
          font-weight: 600;
        }
        
        .reports-content {
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
        
        .reports-breadcrumb {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #555;
          font-weight: 500;
          padding: 14px 20px;
        }
        
        .reports-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .reports-title-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .reports-icon-wrapper {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #B794F6, #9D7CE8);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(157, 124, 232, 0.3);
        }
        
        .reports-title-icon {
          font-size: 32px;
          color: white;
        }
        
        .reports-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }
        
        .reports-subtitle {
          font-size: 0.9rem;
          color: #666;
          font-weight: 400;
        }
        
        .reports-title-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .reports-search {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 12px;
          padding: 10px 16px;
          border: 2px solid #E5E7EB;
          min-width: 300px;
          transition: all 0.3s ease;
        }
        
        .reports-search:focus-within {
          border-color: #9D7CE8;
          box-shadow: 0 0 0 4px rgba(157, 124, 232, 0.1);
        }
        
        .search-icon {
          color: #9D7CE8;
          font-size: 22px;
          margin-right: 8px;
        }
        
        .reports-search input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 15px;
          flex: 1;
          font-family: 'Poppins', sans-serif;
        }
        
        .reports-search input::placeholder {
          color: #9CA3AF;
        }
        
        .clear-icon {
          color: #999;
          font-size: 20px;
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .clear-icon:hover {
          color: #666;
        }
        
        .reports-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .reports-stat {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          transition: transform 0.2s;
        }
        
        .reports-stat:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
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
        
        .reports-stat-label {
          font-size: 13px;
          color: #666;
          margin-bottom: 6px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .reports-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
          line-height: 1;
          margin-bottom: 4px;
        }
        
        .reports-stat-desc {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
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
        
        .reports-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .reports-section-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #333;
          display: flex;
          align-items: center;
        }
        
        .search-results-info {
          background: linear-gradient(135deg, #9D7CE8, #B794F6);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }
        
        .reports-student-table {
          background: #F9FAFB;
          border-radius: 16px;
          padding: 8px 0;
          margin-bottom: 20px;
          min-height: 400px;
        }
        
        .reports-table-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #666;
          font-weight: 600;
          padding: 14px 24px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .header-score {
          margin-right: 20px;
        }
        
        .reports-table-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #E5E7EB;
          transition: all 0.2s;
        }
        
        .reports-table-row:last-child {
          border-bottom: none;
        }
        
        .clickable-row {
          cursor: pointer;
        }
        
        .clickable-row:hover {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .reports-student-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        
        .reports-student-img {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .reports-student-name {
          font-weight: 600;
          color: #333;
          font-size: 15px;
          margin-bottom: 4px;
        }
        
        .reports-student-meta {
          font-size: 12px;
          color: #666;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .meta-icon {
          font-size: 14px;
          color: #9D7CE8;
        }
        
        .meta-separator {
          margin: 0 4px;
          color: #ccc;
        }
        
        .reports-score {
          font-weight: 700;
          font-size: 15px;
          padding: 8px 12px;
          border-radius: 10px;
          background: #eee;
        }
        
        .reports-score-green {
          padding: 6px 12px;
          border-radius: 8px;
          background: linear-gradient(135deg, #d4edda, #c3e6cb);
          color: #155724;
        }
        
        .reports-score-yellow {
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          color: #856404;
        }
        
        .reports-score-blue {
          padding: 6px 12px;
          border-radius: 8px;
          background: linear-gradient(135deg, #d1ecf1, #bee5eb);
          color: #0c5460;
        }
        
        .reports-score-red {
          background: linear-gradient(135deg, #f8d7da, #f5c6cb);
          color: #721c24;
        }
        
        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #999;
        }
        
        .no-results .material-icons {
          font-size: 64px;
          color: #ccc;
          margin-bottom: 16px;
        }
        
        .no-results p {
          font-size: 16px;
          font-weight: 500;
        }
        
        .reports-pagination {
          display: flex;
          gap: 8px;
          justify-content: center;
          align-items: center;
          padding: 16px 0;
        }
        
        .page-nav {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: white;
          border: 2px solid #E5E7EB;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .page-nav:hover:not(:disabled) {
          background: #F3F4F6;
          border-color: #9D7CE8;
        }
        
        .page-nav:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .reports-page {
          min-width: 36px;
          height: 36px;
          padding: 0 12px;
          border-radius: 8px;
          background: white;
          border: 2px solid #E5E7EB;
          color: #666;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .reports-page:hover {
          border-color: #9D7CE8;
          background: #F3F4F6;
        }
        
        .reports-page.active {
          background: linear-gradient(135deg, #9D7CE8, #B794F6);
          color: white;
          border-color: #9D7CE8;
        }
        
        .page-ellipsis {
          padding: 0 8px;
          color: #999;
        }
        
        .reports-side-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 320px;
        }
        
        .reports-side-card {
          margin-bottom: 0;
        }
        
        .reports-side-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
        }
        
        .reports-performer-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .reports-performer-row:last-child {
          border-bottom: none;
        }
        
        .performer-rank {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #FFD93D, #FFA500);
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .performer-info {
          flex: 1;
        }
        
        .reports-performer-name {
          font-weight: 600;
          color: #333;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .reports-performer-meta {
          font-size: 12px;
          color: #666;
        }
        
        .reports-performer-score {
          font-weight: 700;
          font-size: 14px;
          padding: 6px 12px;
          border-radius: 8px;
        }
        
        .reports-support-row {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .reports-support-row:last-child {
          border-bottom: none;
        }
        
        .reports-support-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        
        .reports-support-img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .reports-support-name {
          font-weight: 600;
          color: #333;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .reports-support-meta {
          font-size: 12px;
          color: #666;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .support-score {
          background: #ffe6e6;
          color: #ff6b6b;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 600;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #999;
        }
        
        .empty-state .material-icons {
          font-size: 48px;
          color: #ccc;
          margin-bottom: 12px;
        }
        
        .empty-state p {
          font-size: 14px;
          font-weight: 500;
        }
        
        .empty-state.success .material-icons {
          color: #4CAF50;
        }
        
        .empty-state.success p {
          color: #4CAF50;
        }
        
        @media (max-width: 1200px) {
          .reports-main-row {
            flex-direction: column;
          }
          
          .reports-side-col {
            min-width: 0;
          }
          
          .reports-stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .reports-content {
            padding: 16px;
          }
          
          .card {
            padding: 16px;
          }
          
          .reports-title-row {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .reports-title-left {
            width: 100%;
          }
          
          .reports-title-right {
            width: 100%;
          }
          
          .reports-search {
            width: 100%;
            min-width: 0;
          }
          
          .reports-stats-row {
            grid-template-columns: 1fr;
          }
          
          .reports-icon-wrapper {
            width: 50px;
            height: 50px;
          }
          
          .reports-title-icon {
            font-size: 26px;
          }
          
          .reports-title {
            font-size: 1.2rem;
          }
          
          .reports-subtitle {
            font-size: 0.85rem;
          }
          
          .reports-stat {
            padding: 16px;
          }
          
          .stat-icon-wrapper {
            width: 48px;
            height: 48px;
          }
          
          .stat-icon-wrapper .material-icons {
            font-size: 24px;
          }
          
          .reports-stat-value {
            font-size: 1.6rem;
          }
          
          .reports-table-header,
          .reports-table-row {
            padding: 12px 16px;
          }
          
          .reports-student-img {
            width: 36px;
            height: 36px;
          }
          
          .reports-student-name {
            font-size: 14px;
          }
          
          .reports-student-meta {
            font-size: 11px;
          }
          
          .reports-score {
            font-size: 13px;
            padding: 6px 12px;
          }
          
          .header-score {
            margin-right: 0;
          }
        }
        
        @media (max-width: 480px) {
          .reports-content {
            padding: 12px;
          }
          
          .card {
            padding: 12px;
            border-radius: 16px;
          }
          
          .reports-breadcrumb {
            font-size: 11px;
            padding: 10px 14px;
            overflow-x: auto;
            white-space: nowrap;
          }
          
          .reports-icon-wrapper {
            width: 44px;
            height: 44px;
          }
          
          .reports-title-icon {
            font-size: 22px;
          }
          
          .reports-title {
            font-size: 1.1rem;
          }
          
          .reports-subtitle {
            font-size: 0.8rem;
          }
          
          .reports-search {
            padding: 8px 12px;
          }
          
          .search-icon {
            font-size: 20px;
          }
          
          .reports-search input {
            font-size: 14px;
          }
          
          .reports-stat {
            flex-direction: row;
            padding: 14px;
          }
          
          .stat-icon-wrapper {
            width: 44px;
            height: 44px;
          }
          
          .stat-icon-wrapper .material-icons {
            font-size: 22px;
          }
          
          .reports-stat-label {
            font-size: 11px;
          }
          
          .reports-stat-value {
            font-size: 1.4rem;
          }
          
          .reports-stat-desc {
            font-size: 11px;
          }
          
          .reports-section-title {
            font-size: 1rem;
          }
          
          .reports-table-header {
            font-size: 11px;
            padding: 10px 12px;
          }
          
          .reports-table-row {
            padding: 10px 12px;
            flex-wrap: nowrap;
          }
          
          .reports-student-info {
            gap: 10px;
            flex: 1;
            min-width: 0;
          }
          
          .reports-student-img {
            width: 32px;
            height: 32px;
            border-width: 2px;
          }
          
          .reports-student-name {
            font-size: 13px;
          }
          
          .reports-student-meta {
            font-size: 10px;
            flex-wrap: wrap;
          }
          
          .meta-icon {
            font-size: 12px;
          }
          
          .reports-score {
            font-size: 12px;
            padding: 5px 10px;
            white-space: nowrap;
          }
          
          .reports-pagination {
            flex-wrap: wrap;
            gap: 6px;
          }
          
          .page-nav {
            width: 32px;
            height: 32px;
          }
          
          .page-nav .material-icons {
            font-size: 20px;
          }
          
          .reports-page {
            min-width: 32px;
            height: 32px;
            font-size: 13px;
          }
          
          .reports-side-title {
            font-size: 1rem;
          }
          
          .performer-rank {
            width: 28px;
            height: 28px;
            font-size: 13px;
          }
          
          .reports-performer-name {
            font-size: 13px;
          }
          
          .reports-performer-meta {
            font-size: 11px;
          }
          
          .reports-performer-score {
            font-size: 12px;
            padding: 5px 10px;
          }
          
          .reports-support-img {
            width: 32px;
            height: 32px;
          }
          
          .reports-support-name {
            font-size: 13px;
          }
          
          .reports-support-meta {
            font-size: 11px;
          }
          
          .no-results .material-icons {
            font-size: 48px;
          }
          
          .no-results p {
            font-size: 14px;
          }
          
          .empty-state .material-icons {
            font-size: 40px;
          }
          
          .empty-state p {
            font-size: 13px;
          }
          
          .search-results-info {
            font-size: 12px;
            padding: 5px 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default Reports;
