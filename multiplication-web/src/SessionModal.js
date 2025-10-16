import React from "react";
import {
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const db = getFirestore();

function SessionModal({
  sessionCode,
  sessionId,
  isMinimized,
  onMinimize,
  onExpand,
  onClose,
  onGameStart, // NEW PROP
}) {
  const [playerCount, setPlayerCount] = React.useState(0);
  const [waitingPlayers, setWaitingPlayers] = React.useState([]);

  // Listen for player count changes
  React.useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = onSnapshot(
      doc(db, "sessions", sessionId),
      (docSnap) => {
        const data = docSnap.data();
        setPlayerCount(data?.players?.length || 0);
        setWaitingPlayers(data?.waitingPlayers || []);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  const handleStartGame = async () => {
    if (!sessionId) return;

    try {
      await updateDoc(doc(db, "sessions", sessionId), {
        status: "started",
        gameStarted: true,
        gameStartedAt: serverTimestamp(),
      });

      // Trigger game start to show ranking modal
      onGameStart();
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  return (
    <>
      <div
        className={`session-modal-overlay ${
          isMinimized ? "minimized-overlay" : ""
        }`}
      >
        <div className={`session-modal ${isMinimized ? "minimized" : ""}`}>
          {!isMinimized ? (
            <>
              <div className="session-modal-header">
                <div className="header-left">
                  <div className="success-icon-wrapper">
                    <span className="material-icons">check_circle</span>
                  </div>
                  <div>
                    <h2>Session Active!</h2>
                    <p className="header-subtitle">
                      Share the code with students to join
                    </p>
                  </div>
                </div>
                <button
                  className="minimize-btn"
                  onClick={onMinimize}
                  title="Minimize"
                >
                  <span className="material-icons">minimize</span>
                </button>
              </div>

              <div className="session-code-container">
                <div className="code-label">Session Code</div>
                <div className="session-code">{sessionCode}</div>
                <div className="code-hint">
                  Students enter this code to join
                </div>
              </div>

              <div className="session-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-wrapper stat-icon-blue">
                    <span className="material-icons">groups</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Total Joined</div>
                    <div className="stat-value">{playerCount}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper stat-icon-green">
                    <span className="material-icons">how_to_reg</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Ready to Play</div>
                    <div className="stat-value stat-value-green">
                      {waitingPlayers.length}
                    </div>
                  </div>
                </div>
              </div>

              {waitingPlayers.length > 0 ? (
                <div className="waiting-players-section">
                  <div className="section-header">
                    <span className="material-icons">people</span>
                    <h4>Players Ready ({waitingPlayers.length})</h4>
                  </div>
                  <div className="waiting-players-list">
                    {waitingPlayers.map((player, idx) => (
                      <div key={idx} className="waiting-player-card">
                        <div className="player-avatar">
                          {player.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="player-info">
                          <div className="player-name">{player.name}</div>
                          <div className="player-status">
                            <span className="status-dot"></span>
                            Ready
                          </div>
                        </div>
                        <span className="material-icons check-icon">
                          check_circle
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <span className="material-icons">hourglass_empty</span>
                  <p>Waiting for players to join...</p>
                  <small>Share the session code with students</small>
                </div>
              )}

              <div className="session-actions">
                <button
                  className="start-game-btn"
                  onClick={handleStartGame}
                  disabled={waitingPlayers.length === 0}
                >
                  <span className="material-icons">play_arrow</span>
                  Start Game Now
                  {waitingPlayers.length > 0 && (
                    <span className="player-badge">
                      {waitingPlayers.length}
                    </span>
                  )}
                </button>
                <button className="close-session-btn" onClick={onClose}>
                  <span className="material-icons">close</span>
                  End Session
                </button>
              </div>
            </>
          ) : (
            <div className="minimized-content" onClick={onExpand}>
              <div className="minimized-left">
                <div className="minimized-icon-wrapper">
                  <span className="material-icons">cast</span>
                </div>
                <div className="minimized-info">
                  <div className="minimized-code">Code: {sessionCode}</div>
                  <div className="minimized-status">
                    <span className="status-dot-mini"></span>
                    {waitingPlayers.length} ready
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        /* Overlay */
        .session-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 9999;
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
        
        .session-modal-overlay.minimized-overlay {
          background: transparent;
          backdrop-filter: none;
          pointer-events: none;
          padding: 0;
        }
        
        /* Modal */
        .session-modal {
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 32px;
          width: 100%;
          max-width: 580px;
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
        
        .session-modal.minimized {
          position: fixed;
          bottom: 24px;
          right: 24px;
          top: auto;
          left: auto;
          transform: none;
          max-width: 320px;
          padding: 16px 20px;
          cursor: pointer;
          pointer-events: auto;
          animation: slideInRight 0.3s ease;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
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
        
        .session-modal.minimized:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
          transform: translateY(-2px);
        }
        
        /* Header */
        .session-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          gap: 16px;
        }
        
        .header-left {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
        }
        
        .success-icon-wrapper {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        }
        
        .success-icon-wrapper .material-icons {
          font-size: 32px;
          color: white;
        }
        
        .session-modal-header h2 {
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
        
        /* Session Code */
        .session-code-container {
          text-align: center;
          padding: 24px;
          background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
          border-radius: 20px;
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }
        
        .code-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .session-code {
          font-size: 48px;
          font-weight: 800;
          color: white;
          letter-spacing: 8px;
          margin: 12px 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          font-family: 'Courier New', monospace;
        }
        
        .code-hint {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }
        
        /* Stats Grid */
        .session-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .stat-card {
          background: #F9FAFB;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s;
        }
        
        .stat-card:hover {
          background: #F3F4F6;
          transform: translateY(-2px);
        }
        
        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .stat-icon-blue {
          background: linear-gradient(135deg, #3B82F6, #2563EB);
        }
        
        .stat-icon-green {
          background: linear-gradient(135deg, #10B981, #059669);
        }
        
        .stat-icon-wrapper .material-icons {
          font-size: 24px;
          color: white;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-label {
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1F2937;
          line-height: 1;
        }
        
        .stat-value-green {
          color: #10B981;
        }
        
        /* Waiting Players Section */
        .waiting-players-section {
          margin-bottom: 24px;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .section-header .material-icons {
          font-size: 22px;
          color: #667EEA;
        }
        
        .section-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1F2937;
        }
        
        .waiting-players-list {
          max-height: 280px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .waiting-players-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .waiting-players-list::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 10px;
        }
        
        .waiting-players-list::-webkit-scrollbar-thumb {
          background: #9CA3AF;
          border-radius: 10px;
        }
        
        .waiting-player-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
          border-radius: 12px;
          border: 2px solid #A7F3D0;
          transition: all 0.2s;
        }
        
        .waiting-player-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }
        
        .player-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #10B981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .player-info {
          flex: 1;
          min-width: 0;
        }
        
        .player-name {
          font-weight: 600;
          color: #065F46;
          font-size: 15px;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .player-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #059669;
          font-weight: 500;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #10B981;
          border-radius: 50%;
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
        
        .check-icon {
          font-size: 24px;
          color: #10B981;
          flex-shrink: 0;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          background: #F9FAFB;
          border-radius: 16px;
          margin-bottom: 24px;
        }
        
        .empty-state .material-icons {
          font-size: 64px;
          color: #D1D5DB;
          margin-bottom: 16px;
          animation: rotate 3s linear infinite;
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
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
        
        /* Actions */
        .session-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .start-game-btn {
          background: linear-gradient(135deg, #10B981, #059669);
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
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          font-family: 'Poppins', sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .start-game-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .start-game-btn:hover::before {
          width: 300px;
          height: 300px;
        }
        
        .start-game-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }
        
        .start-game-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .start-game-btn:disabled {
          background: linear-gradient(135deg, #D1D5DB, #9CA3AF);
          cursor: not-allowed;
          box-shadow: none;
        }
        
        .start-game-btn .material-icons {
          font-size: 24px;
          z-index: 1;
        }
        
        .player-badge {
          background: rgba(255, 255, 255, 0.3);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
          z-index: 1;
        }
        
        .close-session-btn {
          background: #F3F4F6;
          color: #6B7280;
          border: none;
          border-radius: 14px;
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          font-family: 'Poppins', sans-serif;
        }
        
        .close-session-btn:hover {
          background: #E5E7EB;
          color: #374151;
        }
        
        .close-session-btn .material-icons {
          font-size: 20px;
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
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #667EEA, #764BA2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .minimized-icon-wrapper .material-icons {
          font-size: 24px;
          color: white;
        }
        
        .minimized-info {
          flex: 1;
          min-width: 0;
        }
        
        .minimized-code {
          font-weight: 700;
          color: #667EEA;
          font-size: 15px;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .minimized-status {
          font-size: 13px;
          color: #6B7280;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }
        
        .status-dot-mini {
          width: 8px;
          height: 8px;
          background: #10B981;
          border-radius: 50%;
          animation: pulse 2s infinite;
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
          .session-modal {
            padding: 24px;
            max-width: 100%;
            border-radius: 20px;
          }
          
          .session-modal-header {
            margin-bottom: 20px;
          }
          
          .header-left {
            gap: 12px;
          }
          
          .success-icon-wrapper {
            width: 48px;
            height: 48px;
          }
          
          .success-icon-wrapper .material-icons {
            font-size: 28px;
          }
          
          .session-modal-header h2 {
            font-size: 1.25rem;
          }
          
          .header-subtitle {
            font-size: 13px;
          }
          
          .minimize-btn {
            width: 36px;
            height: 36px;
          }
          
          .session-code-container {
            padding: 20px;
          }
          
          .session-code {
            font-size: 36px;
            letter-spacing: 6px;
          }
          
          .session-stats-grid {
            gap: 12px;
          }
          
          .stat-card {
            padding: 14px;
          }
          
          .stat-icon-wrapper {
            width: 44px;
            height: 44px;
          }
          
          .stat-icon-wrapper .material-icons {
            font-size: 22px;
          }
          
          .stat-value {
            font-size: 24px;
          }
          
          .waiting-players-list {
            max-height: 220px;
          }
          
          .start-game-btn {
            padding: 14px 20px;
            font-size: 15px;
          }
        }
        
        @media (max-width: 480px) {
          .session-modal-overlay {
            padding: 12px;
          }
          
          .session-modal {
            padding: 20px;
            border-radius: 18px;
          }
          
          .session-modal.minimized {
            bottom: 16px;
            right: 16px;
            max-width: 280px;
            padding: 12px 16px;
          }
          
          .session-modal-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .header-left {
            width: 100%;
          }
          
          .minimize-btn {
            position: absolute;
            top: 20px;
            right: 20px;
          }
          
          .success-icon-wrapper {
            width: 44px;
            height: 44px;
          }
          
          .success-icon-wrapper .material-icons {
            font-size: 24px;
          }
          
          .session-modal-header h2 {
            font-size: 1.15rem;
          }
          
          .header-subtitle {
            font-size: 12px;
          }
          
          .session-code-container {
            padding: 16px;
          }
          
          .code-label {
            font-size: 11px;
          }
          
          .session-code {
            font-size: 32px;
            letter-spacing: 4px;
            margin: 8px 0;
          }
          
          .code-hint {
            font-size: 12px;
          }
          
          .session-stats-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          
          .stat-card {
            padding: 12px;
          }
          
          .stat-icon-wrapper {
            width: 40px;
            height: 40px;
          }
          
          .stat-icon-wrapper .material-icons {
            font-size: 20px;
          }
          
          .stat-label {
            font-size: 11px;
          }
          
          .stat-value {
            font-size: 22px;
          }
          
          .section-header h4 {
            font-size: 15px;
          }
          
          .waiting-players-list {
            max-height: 180px;
          }
          
          .waiting-player-card {
            padding: 10px 12px;
          }
          
          .player-avatar {
            width: 36px;
            height: 36px;
            font-size: 14px;
          }
          
          .player-name {
            font-size: 14px;
          }
          
          .player-status {
            font-size: 11px;
          }
          
          .check-icon {
            font-size: 20px;
          }
          
          .empty-state {
            padding: 30px 16px;
          }
          
          .empty-state .material-icons {
            font-size: 52px;
          }
          
          .empty-state p {
            font-size: 15px;
          }
          
          .empty-state small {
            font-size: 12px;
          }
          
          .start-game-btn {
            padding: 13px 18px;
            font-size: 14px;
          }
          
          .start-game-btn .material-icons {
            font-size: 20px;
          }
          
          .player-badge {
            padding: 3px 10px;
            font-size: 13px;
          }
          
          .close-session-btn {
            padding: 11px 18px;
            font-size: 14px;
          }
          
          .close-session-btn .material-icons {
            font-size: 18px;
          }
          
          .minimized-icon-wrapper {
            width: 40px;
            height: 40px;
          }
          
          .minimized-icon-wrapper .material-icons {
            font-size: 20px;
          }
          
          .minimized-code {
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
          .session-modal {
            padding: 16px;
          }
          
          .session-modal.minimized {
            max-width: 260px;
            bottom: 12px;
            right: 12px;
          }
          
          .session-code {
            font-size: 28px;
            letter-spacing: 3px;
          }
          
          .stat-value {
            font-size: 20px;
          }
          
          .waiting-player-card {
            padding: 8px 10px;
            gap: 10px;
          }
          
          .player-avatar {
            width: 32px;
            height: 32px;
            font-size: 13px;
          }
          
          .player-name {
            font-size: 13px;
          }
          
          .start-game-btn {
            padding: 12px 16px;
            font-size: 13px;
          }
          
          .close-session-btn {
            padding: 10px 16px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}

export default SessionModal;
