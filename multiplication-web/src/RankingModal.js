import React from "react";
import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
} from "firebase/firestore";

const db = getFirestore();

function RankingModal({
  sessionCode,
  sessionId,
  isMinimized,
  onMinimize,
  onExpand,
  onClose,
}) {
  const [rankings, setRankings] = React.useState([]);
  const [sessionData, setSessionData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Listen for real-time ranking updates
  React.useEffect(() => {
    if (!sessionId) return;

    setLoading(true);

    // Listen to session data
    const sessionUnsub = onSnapshot(
      doc(db, "sessions", sessionId),
      (docSnap) => {
        if (docSnap.exists()) {
          setSessionData(docSnap.data());
        }
      }
    );

    // Listen to rankings subcollection
    const rankingsQuery = query(
      collection(db, "sessions", sessionId, "rankings"),
      orderBy("score", "desc")
    );

    const rankingsUnsub = onSnapshot(rankingsQuery, (snapshot) => {
      const rankingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRankings(rankingsData);
      setLoading(false);
    });

    return () => {
      sessionUnsub();
      rankingsUnsub();
    };
  }, [sessionId]);

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return null;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1:
        return "rank-gold";
      case 2:
        return "rank-silver";
      case 3:
        return "rank-bronze";
      default:
        return "rank-default";
    }
  };

  const topThree = rankings.slice(0, 3);
  const restOfRankings = rankings.slice(3);

  return (
    <>
      <div
        className={`ranking-modal-overlay ${
          isMinimized ? "minimized-overlay" : ""
        }`}
      >
        <div className={`ranking-modal ${isMinimized ? "minimized" : ""}`}>
          {!isMinimized ? (
            <>
              <div className="ranking-modal-header">
                <div className="header-left">
                  <div className="live-icon-wrapper">
                    <span className="material-icons">leaderboard</span>
                    <span className="live-pulse"></span>
                  </div>
                  <div>
                    <h2>Live Rankings</h2>
                    <p className="header-subtitle">
                      Real-time scores • Session {sessionCode}
                    </p>
                  </div>
                </div>
                <div className="header-actions">
                  <button
                    className="minimize-btn"
                    onClick={onMinimize}
                    title="Minimize"
                  >
                    <span className="material-icons">minimize</span>
                  </button>
                </div>
              </div>

              <div className="ranking-stats-bar">
                <div className="stat-chip">
                  <span className="material-icons">groups</span>
                  <span>{rankings.length} Players</span>
                </div>
                <div className="stat-chip">
                  <span className="material-icons">schedule</span>
                  <span>In Progress</span>
                </div>
                <div className="stat-chip">
                  <span className="material-icons">emoji_events</span>
                  <span>
                    {rankings.length > 0
                      ? `Top: ${rankings[0]?.score || 0} pts`
                      : "0 pts"}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading rankings...</p>
                </div>
              ) : rankings.length === 0 ? (
                <div className="empty-state">
                  <span className="material-icons">sports_esports</span>
                  <p>Waiting for players to submit answers...</p>
                  <small>Scores will appear here in real-time</small>
                </div>
              ) : (
                <>
                  {/* Podium for Top 3 */}
                  {topThree.length > 0 && (
                    <div className="podium-section">
                      <h3 className="section-title">
                        <span className="material-icons">emoji_events</span>
                        Top Performers
                      </h3>
                      <div className="podium-container">
                        {topThree.length >= 2 && (
                          <div className="podium-item podium-second">
                            <div className="podium-rank">2nd</div>
                            <div className="podium-avatar podium-avatar-silver">
                              {topThree[1]?.name?.charAt(0).toUpperCase() ||
                                "?"}
                            </div>
                            <div className="podium-name">
                              {topThree[1]?.name || "Unknown"}
                            </div>
                            <div className="podium-score">
                              {topThree[1]?.score || 0} pts
                            </div>
                            <div className="podium-stand podium-stand-silver">
                              <span className="medal-icon">🥈</span>
                            </div>
                          </div>
                        )}

                        {topThree.length >= 1 && (
                          <div className="podium-item podium-first">
                            <div className="podium-rank">1st</div>
                            <div className="podium-avatar podium-avatar-gold">
                              <span className="crown-icon">👑</span>
                              {topThree[0]?.name?.charAt(0).toUpperCase() ||
                                "?"}
                            </div>
                            <div className="podium-name">
                              {topThree[0]?.name || "Unknown"}
                            </div>
                            <div className="podium-score">
                              {topThree[0]?.score || 0} pts
                            </div>
                            <div className="podium-stand podium-stand-gold">
                              <span className="medal-icon">🥇</span>
                            </div>
                          </div>
                        )}

                        {topThree.length >= 3 && (
                          <div className="podium-item podium-third">
                            <div className="podium-rank">3rd</div>
                            <div className="podium-avatar podium-avatar-bronze">
                              {topThree[2]?.name?.charAt(0).toUpperCase() ||
                                "?"}
                            </div>
                            <div className="podium-name">
                              {topThree[2]?.name || "Unknown"}
                            </div>
                            <div className="podium-score">
                              {topThree[2]?.score || 0} pts
                            </div>
                            <div className="podium-stand podium-stand-bronze">
                              <span className="medal-icon">🥉</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rest of Rankings */}
                  {restOfRankings.length > 0 && (
                    <div className="rankings-list-section">
                      <h3 className="section-title">
                        <span className="material-icons">list</span>
                        All Players
                      </h3>
                      <div className="rankings-list">
                        {restOfRankings.map((player, index) => {
                          const rank = index + 4;
                          return (
                            <div
                              key={player.id}
                              className={`ranking-item ${getRankClass(rank)}`}
                            >
                              <div className="ranking-position">{rank}</div>
                              <div className="ranking-avatar">
                                {player.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <div className="ranking-info">
                                <div className="ranking-name">
                                  {player.name || "Unknown"}
                                </div>
                                <div className="ranking-details">
                                  <span className="detail-item">
                                    <span className="material-icons">
                                      speed
                                    </span>
                                    {player.accuracy || 0}% accuracy
                                  </span>
                                  <span className="detail-item">
                                    <span className="material-icons">
                                      check_circle
                                    </span>
                                    {player.correct || 0} correct
                                  </span>
                                </div>
                              </div>
                              <div className="ranking-score">
                                {player.score || 0}
                                <span className="score-label">pts</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="ranking-actions">
                <button className="close-ranking-btn" onClick={onClose}>
                  <span className="material-icons">stop_circle</span>
                  End Session
                </button>
              </div>
            </>
          ) : (
            <div className="minimized-content" onClick={onExpand}>
              <div className="minimized-left">
                <div className="minimized-icon-wrapper">
                  <span className="material-icons">leaderboard</span>
                  <span className="live-pulse-mini"></span>
                </div>
                <div className="minimized-info">
                  <div className="minimized-title">Live Rankings</div>
                  <div className="minimized-status">
                    <span className="status-dot-mini"></span>
                    {rankings.length} players •{" "}
                    {rankings.length > 0
                      ? `${rankings[0]?.name} leading`
                      : "No scores yet"}
                  </div>
                </div>
              </div>
              <button className="expand-btn">
                <span className="material-icons">expand_less</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        /* Overlay */
        .ranking-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .ranking-modal-overlay.minimized-overlay {
          background: transparent;
          backdrop-filter: none;
          pointer-events: none;
          padding: 0;
        }
        
        /* Modal */
        .ranking-modal {
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 32px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          font-family: 'Poppins', sans-serif;
          animation: slideUp 0.4s ease;
          transition: all 0.3s ease;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .ranking-modal::-webkit-scrollbar {
          width: 8px;
        }
        
        .ranking-modal::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 10px;
        }
        
        .ranking-modal::-webkit-scrollbar-thumb {
          background: #9CA3AF;
          border-radius: 10px;
        }
        
        .ranking-modal.minimized {
          position: fixed;
          bottom: 24px;
          right: 24px;
          top: auto;
          left: auto;
          transform: none;
          max-width: 350px;
          padding: 16px 20px;
          cursor: pointer;
          pointer-events: auto;
          animation: slideInRight 0.3s ease;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          overflow: visible;
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .ranking-modal.minimized:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
          transform: translateY(-2px);
        }
        
        /* Header */
        .ranking-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          gap: 16px;
        }
        
        .header-left {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
        }
        
        .live-icon-wrapper {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #EF4444, #DC2626);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
          position: relative;
        }
        
        .live-icon-wrapper .material-icons {
          font-size: 32px;
          color: white;
          z-index: 1;
        }
        
        .live-pulse {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 12px;
          height: 12px;
          background: #22C55E;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          animation: pulse-ring 2s infinite;
        }
        
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }
        
        .ranking-modal-header h2 {
          margin: 0 0 4px 0;
          color: #1F2937;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .header-subtitle {
          margin: 0;
          color: #6B7280;
          font-size: 14px;
          font-weight: 400;
        }
        
        .header-actions {
          display: flex;
          gap: 8px;
        }
        
        .minimize-btn {
          width: 40px;
          height: 40px;
          background: #F3F4F6;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6B7280;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        
        .minimize-btn:hover {
          background: #E5E7EB;
          color: #374151;
        }
        
        .minimize-btn .material-icons {
          font-size: 22px;
        }
        
        /* Stats Bar */
        .ranking-stats-bar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 24px;
          padding: 16px;
          background: #F9FAFB;
          border-radius: 16px;
        }
        
        .stat-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: white;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .stat-chip .material-icons {
          font-size: 18px;
          color: #9CA3AF;
        }
        
        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #6B7280;
          gap: 16px;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(239, 68, 68, 0.2);
          border-top-color: #EF4444;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-state p {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: #F9FAFB;
          border-radius: 16px;
          margin-bottom: 24px;
        }
        
        .empty-state .material-icons {
          font-size: 72px;
          color: #D1D5DB;
          margin-bottom: 16px;
        }
        
        .empty-state p {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #6B7280;
        }
        
        .empty-state small {
          font-size: 13px;
          color: #9CA3AF;
        }
        
        /* Section Title */
        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 20px;
        }
        
        .section-title .material-icons {
          font-size: 24px;
          color: #EF4444;
        }
        
        /* Podium Section */
        .podium-section {
          margin-bottom: 32px;
        }
        
        .podium-container {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }
        
        .podium-container::before {
          content: '⭐';
          position: absolute;
          font-size: 100px;
          opacity: 0.1;
          top: -20px;
          right: -20px;
          transform: rotate(-15deg);
        }
        
        .podium-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        
        .podium-rank {
          font-size: 14px;
          font-weight: 700;
          color: #78716C;
          margin-bottom: 8px;
        }
        
        .podium-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin-bottom: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          position: relative;
        }
        
        .crown-icon {
          position: absolute;
          top: -15px;
          font-size: 28px;
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        .podium-avatar-gold {
          background: linear-gradient(135deg, #FCD34D, #F59E0B);
        }
        
        .podium-avatar-silver {
          background: linear-gradient(135deg, #D1D5DB, #9CA3AF);
        }
        
        .podium-avatar-bronze {
          background: linear-gradient(135deg, #F59E0B, #D97706);
        }
        
        .podium-first .podium-avatar {
          width: 90px;
          height: 90px;
          font-size: 36px;
        }
        
        .podium-name {
          font-size: 14px;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 6px;
          text-align: center;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .podium-first .podium-name {
          font-size: 16px;
        }
        
        .podium-score {
          font-size: 18px;
          font-weight: 800;
          color: #374151;
          margin-bottom: 16px;
        }
        
        .podium-first .podium-score {
          font-size: 22px;
          color: #F59E0B;
        }
        
        .podium-stand {
          width: 90px;
          height: 100px;
          border-radius: 12px 12px 0 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 12px;
          position: relative;
        }
        
        .podium-stand-gold {
          background: linear-gradient(180deg, #FCD34D, #F59E0B);
          height: 130px;
        }
        
        .podium-stand-silver {
          background: linear-gradient(180deg, #E5E7EB, #9CA3AF);
          height: 100px;
        }
        
        .podium-stand-bronze {
          background: linear-gradient(180deg, #FCA5A5, #F87171);
          height: 80px;
        }
        
        .medal-icon {
          font-size: 32px;
        }
        
        .podium-first .medal-icon {
          font-size: 40px;
        }
        
        /* Rankings List */
        .rankings-list-section {
          margin-bottom: 24px;
        }
        
        .rankings-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 8px;
        }
        
        .rankings-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .rankings-list::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 10px;
        }
        
        .rankings-list::-webkit-scrollbar-thumb {
          background: #9CA3AF;
          border-radius: 10px;
        }
        
        .ranking-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          transition: all 0.2s;
        }
        
        .ranking-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #D1D5DB;
        }
        
        .ranking-position {
          width: 40px;
          height: 40px;
          background: #F3F4F6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
          color: #6B7280;
          flex-shrink: 0;
        }
        
        .ranking-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #A78BFA, #8B5CF6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }
        
        .ranking-info {
          flex: 1;
          min-width: 0;
        }
        
        .ranking-name {
          font-size: 16px;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .ranking-details {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
        }
        
        .detail-item .material-icons {
          font-size: 14px;
          color: #9CA3AF;
        }
        
        .ranking-score {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 24px;
          font-weight: 800;
          color: #1F2937;
          flex-shrink: 0;
        }
        
        .score-label {
          font-size: 11px;
          font-weight: 600;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Actions */
        .ranking-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .close-ranking-btn {
          background: linear-gradient(135deg, #EF4444, #DC2626);
          color: white;
          border: none;
          border-radius: 14px;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
          font-family: 'Poppins', sans-serif;
        }
        
        .close-ranking-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
        }
        
        .close-ranking-btn:active {
          transform: translateY(0);
        }
        
        .close-ranking-btn .material-icons {
          font-size: 24px;
        }
        
        /* Minimized State */
        .minimized-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 12px;
        }
        
        .minimized-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        
        .minimized-icon-wrapper {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #EF4444, #DC2626);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }
        
        .minimized-icon-wrapper .material-icons {
          font-size: 24px;
          color: white;
        }
        
        .live-pulse-mini {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 10px;
          height: 10px;
          background: #22C55E;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          animation: pulse-ring 2s infinite;
        }
        
        .minimized-info {
          flex: 1;
          min-width: 0;
        }
        
        .minimized-title {
          font-weight: 700;
          color: #1F2937;
          font-size: 15px;
          margin-bottom: 4px;
        }
        
        .minimized-status {
          font-size: 13px;
          color: #6B7280;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .status-dot-mini {
          width: 8px;
          height: 8px;
          background: #22C55E;
          border-radius: 50%;
          flex-shrink: 0;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .expand-btn {
          width: 36px;
          height: 36px;
          background: #F3F4F6;
          border: none;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6B7280;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        
        .expand-btn:hover {
          background: #E5E7EB;
        }
        
        .expand-btn .material-icons {
          font-size: 22px;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .ranking-modal {
            padding: 24px;
            max-width: 100%;
            border-radius: 20px;
          }
          
          .ranking-modal-header {
            margin-bottom: 20px;
          }
          
          .header-left {
            gap: 12px;
          }
          
          .live-icon-wrapper {
            width: 48px;
            height: 48px;
          }
          
          .live-icon-wrapper .material-icons {
            font-size: 28px;
          }
          
          .live-pulse {
            width: 10px;
            height: 10px;
            top: 6px;
            right: 6px;
          }
          
          .ranking-modal-header h2 {
            font-size: 1.25rem;
          }
          
          .header-subtitle {
            font-size: 13px;
          }
          
          .minimize-btn {
            width: 36px;
            height: 36px;
          }
          
          .ranking-stats-bar {
            padding: 14px;
            gap: 10px;
          }
          
          .stat-chip {
            padding: 7px 12px;
            font-size: 12px;
          }
          
          .stat-chip .material-icons {
            font-size: 16px;
          }
          
          .section-title {
            font-size: 16px;
          }
          
          .section-title .material-icons {
            font-size: 22px;
          }
          
          .podium-container {
            padding: 16px;
            gap: 12px;
          }
          
          .podium-avatar {
            width: 60px;
            height: 60px;
            font-size: 24px;
          }
          
          .podium-first .podium-avatar {
            width: 75px;
            height: 75px;
            font-size: 30px;
          }
          
          .crown-icon {
            font-size: 24px;
            top: -12px;
          }
          
          .podium-name {
            font-size: 13px;
            max-width: 80px;
          }
          
          .podium-first .podium-name {
            font-size: 14px;
          }
          
          .podium-score {
            font-size: 16px;
          }
          
          .podium-first .podium-score {
            font-size: 19px;
          }
          
          .podium-stand {
            width: 75px;
            height: 85px;
          }
          
          .podium-stand-gold {
            height: 110px;
          }
          
          .podium-stand-silver {
            height: 85px;
          }
          
          .podium-stand-bronze {
            height: 70px;
          }
          
          .medal-icon {
            font-size: 28px;
          }
          
          .podium-first .medal-icon {
            font-size: 34px;
          }
          
          .rankings-list {
            max-height: 350px;
          }
          
          .ranking-item {
            padding: 14px;
            gap: 14px;
          }
          
          .ranking-position {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }
          
          .ranking-avatar {
            width: 44px;
            height: 44px;
            font-size: 18px;
          }
          
          .ranking-name {
            font-size: 15px;
          }
          
          .detail-item {
            font-size: 11px;
          }
          
          .detail-item .material-icons {
            font-size: 13px;
          }
          
          .ranking-score {
            font-size: 22px;
          }
          
          .close-ranking-btn {
            padding: 14px 20px;
            font-size: 15px;
          }
        }
        
        @media (max-width: 480px) {
          .ranking-modal-overlay {
            padding: 12px;
          }
          
          .ranking-modal {
            padding: 20px;
            border-radius: 18px;
          }
          
          .ranking-modal.minimized {
            bottom: 16px;
            right: 16px;
            max-width: 300px;
            padding: 12px 16px;
          }
          
          .ranking-modal-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .header-left {
            width: 100%;
          }
          
          .header-actions {
            position: absolute;
            top: 20px;
            right: 20px;
          }
          
          .live-icon-wrapper {
            width: 44px;
            height: 44px;
          }
          
          .live-icon-wrapper .material-icons {
            font-size: 24px;
          }
          
          .live-pulse {
            width: 9px;
            height: 9px;
            top: 5px;
            right: 5px;
          }
          
          .ranking-modal-header h2 {
            font-size: 1.15rem;
          }
          
          .header-subtitle {
            font-size: 12px;
          }
          
          .minimize-btn {
            width: 32px;
            height: 32px;
          }
          
          .minimize-btn .material-icons {
            font-size: 20px;
          }
          
          .ranking-stats-bar {
            padding: 12px;
            gap: 8px;
          }
          
          .stat-chip {
            padding: 6px 10px;
            font-size: 11px;
          }
          
          .stat-chip .material-icons {
            font-size: 15px;
          }
          
          .section-title {
            font-size: 15px;
            gap: 8px;
          }
          
          .section-title .material-icons {
            font-size: 20px;
          }
          
          .podium-container {
            padding: 12px;
            gap: 8px;
            flex-wrap: wrap;
          }
          
          .podium-container::before {
            font-size: 80px;
          }
          
          .podium-rank {
            font-size: 12px;
          }
          
          .podium-avatar {
            width: 55px;
            height: 55px;
            font-size: 22px;
            margin-bottom: 10px;
          }
          
          .podium-first .podium-avatar {
            width: 70px;
            height: 70px;
            font-size: 28px;
          }
          
          .crown-icon {
            font-size: 22px;
            top: -10px;
          }
          
          .podium-name {
            font-size: 12px;
            max-width: 70px;
          }
          
          .podium-first .podium-name {
            font-size: 13px;
          }
          
          .podium-score {
            font-size: 15px;
            margin-bottom: 12px;
          }
          
          .podium-first .podium-score {
            font-size: 18px;
          }
          
          .podium-stand {
            width: 70px;
            height: 75px;
            padding-top: 10px;
          }
          
          .podium-stand-gold {
            height: 100px;
          }
          
          .podium-stand-silver {
            height: 75px;
          }
          
          .podium-stand-bronze {
            height: 60px;
          }
          
          .medal-icon {
            font-size: 24px;
          }
          
          .podium-first .medal-icon {
            font-size: 30px;
          }
          
          .rankings-list {
            max-height: 280px;
            padding-right: 4px;
          }
          
          .ranking-item {
            padding: 12px;
            gap: 12px;
          }
          
          .ranking-position {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }
          
          .ranking-avatar {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
          
          .ranking-name {
            font-size: 14px;
          }
          
          .ranking-details {
            gap: 12px;
          }
          
          .detail-item {
            font-size: 10px;
          }
          
          .detail-item .material-icons {
            font-size: 12px;
          }
          
          .ranking-score {
            font-size: 20px;
          }
          
          .score-label {
            font-size: 10px;
          }
          
          .empty-state {
            padding: 50px 16px;
          }
          
          .empty-state .material-icons {
            font-size: 60px;
          }
          
          .empty-state p {
            font-size: 15px;
          }
          
          .empty-state small {
            font-size: 12px;
          }
          
          .close-ranking-btn {
            padding: 13px 18px;
            font-size: 14px;
          }
          
          .close-ranking-btn .material-icons {
            font-size: 20px;
          }
          
          .minimized-icon-wrapper {
            width: 44px;
            height: 44px;
          }
          
          .minimized-icon-wrapper .material-icons {
            font-size: 22px;
          }
          
          .live-pulse-mini {
            width: 9px;
            height: 9px;
          }
          
          .minimized-title {
            font-size: 14px;
          }
          
          .minimized-status {
            font-size: 12px;
          }
          
          .expand-btn {
            width: 32px;
            height: 32px;
          }
          
          .expand-btn .material-icons {
            font-size: 20px;
          }
        }
        
        @media (max-width: 360px) {
          .ranking-modal {
            padding: 16px;
          }
          
          .ranking-modal.minimized {
            max-width: 280px;
            bottom: 12px;
            right: 12px;
          }
          
          .ranking-modal-header h2 {
            font-size: 1.05rem;
          }
          
          .podium-container {
            padding: 10px;
            gap: 6px;
          }
          
          .podium-avatar {
            width: 50px;
            height: 50px;
            font-size: 20px;
            margin-bottom: 8px;
          }
          
          .podium-first .podium-avatar {
            width: 65px;
            height: 65px;
            font-size: 26px;
          }
          
          .crown-icon {
            font-size: 20px;
          }
          
          .podium-name {
            font-size: 11px;
            max-width: 60px;
          }
          
          .podium-first .podium-name {
            font-size: 12px;
          }
          
          .podium-score {
            font-size: 14px;
            margin-bottom: 10px;
          }
          
          .podium-first .podium-score {
            font-size: 17px;
          }
          
          .podium-stand {
            width: 65px;
            height: 70px;
          }
          
          .podium-stand-gold {
            height: 90px;
          }
          
          .podium-stand-silver {
            height: 70px;
          }
          
          .podium-stand-bronze {
            height: 55px;
          }
          
          .medal-icon {
            font-size: 22px;
          }
          
          .podium-first .medal-icon {
            font-size: 28px;
          }
          
          .ranking-item {
            padding: 10px;
            gap: 10px;
          }
          
          .ranking-position {
            width: 30px;
            height: 30px;
            font-size: 13px;
          }
          
          .ranking-avatar {
            width: 36px;
            height: 36px;
            font-size: 15px;
          }
          
          .ranking-name {
            font-size: 13px;
          }
          
          .ranking-details {
            flex-direction: column;
            gap: 4px;
          }
          
          .ranking-score {
            font-size: 18px;
          }
          
          .close-ranking-btn {
            padding: 12px 16px;
            font-size: 13px;
          }
          
          .minimized-title {
            font-size: 13px;
          }
          
          .minimized-status {
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
}

export default RankingModal;
