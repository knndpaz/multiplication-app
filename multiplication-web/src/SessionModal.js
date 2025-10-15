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

      // Close modal after starting
      onClose();
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  return (
    <>
      <div className={`session-modal-bg ${isMinimized ? "minimized-bg" : ""}`}>
        <div className={`session-modal ${isMinimized ? "minimized" : ""}`}>
          {!isMinimized ? (
            <>
              <div className="session-modal-header">
                <h2>Session Started!</h2>
                <button className="minimize-btn" onClick={onMinimize}>
                  <span className="material-icons">minimize</span>
                </button>
              </div>
              <div className="session-code">
                Code: <span style={{ color: "#4fd1ff" }}>{sessionCode}</span>
              </div>
              <div className="session-stats">
                <div className="stat">
                  <span className="stat-label">Players Joined:</span>
                  <span className="stat-value">{playerCount}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Waiting Players:</span>
                  <span className="stat-value">{waitingPlayers.length}</span>
                </div>
              </div>

              {waitingPlayers.length > 0 && (
                <div className="waiting-players-list">
                  <h4>Players Ready:</h4>
                  {waitingPlayers.map((player, idx) => (
                    <div key={idx} className="waiting-player">
                      {player.name}
                    </div>
                  ))}
                </div>
              )}

              <div className="session-actions">
                <button
                  className="start-game-btn"
                  onClick={handleStartGame}
                  disabled={waitingPlayers.length === 0}
                >
                  <span className="material-icons">play_arrow</span>
                  START GAME ({waitingPlayers.length} players)
                </button>
                <button className="close-btn" onClick={onClose}>
                  Close Session
                </button>
              </div>
            </>
          ) : (
            <div className="minimized-content" onClick={onExpand}>
              <div className="minimized-info">
                <span className="minimized-code">Code: {sessionCode}</span>
                <span className="minimized-count">
                  {waitingPlayers.length} waiting
                </span>
              </div>
              <span className="material-icons">expand_more</span>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        
        /* Session Modal Styles */
        .session-modal-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.5);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .session-modal-bg.minimized-bg {
          background: transparent;
          pointer-events: none;
        }
        
        .session-modal {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          padding: 32px;
          min-width: 450px;
          max-width: 500px;
          transition: all 0.3s ease;
        }
        
        .session-modal.minimized {
          position: fixed;
          bottom: 20px;
          right: 20px;
          top: auto;
          left: auto;
          transform: none;
          min-width: 280px;
          padding: 16px 20px;
          cursor: pointer;
          pointer-events: auto;
        }
        
        .session-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .session-modal-header h2 {
          margin: 0;
          color: #333;
        }
        
        .minimize-btn {
          background: #f0f0f0;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
        }
        
        .minimize-btn:hover {
          background: #e0e0e0;
        }
        
        .session-code {
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          margin: 20px 0;
        }
        
        .session-stats {
          display: flex;
          gap: 20px;
          margin: 20px 0;
        }
        
        .stat {
          flex: 1;
          text-align: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .stat-label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        
        .waiting-players-list {
          margin: 20px 0;
          max-height: 120px;
          overflow-y: auto;
        }
        
        .waiting-players-list h4 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 14px;
        }
        
        .waiting-player {
          padding: 6px 12px;
          background: #e8f5e8;
          border-radius: 6px;
          margin-bottom: 4px;
          color: #2d5a2d;
          font-size: 14px;
        }
        
        .session-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .start-game-btn {
          background: #19d419;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .start-game-btn:hover:not(:disabled) {
          background: #17c717;
        }
        
        .start-game-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .close-btn {
          background: #f0f0f0;
          color: #666;
          border: none;
          border-radius: 8px;
          padding: 8px 20px;
          font-size: 14px;
          cursor: pointer;
        }
        
        .close-btn:hover {
          background: #e0e0e0;
        }
        
        .minimized-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        
        .minimized-info {
          display: flex;
          flex-direction: column;
        }
        
        .minimized-code {
          font-weight: bold;
          color: #4fd1ff;
          font-size: 14px;
        }
        
        .minimized-count {
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </>
  );
}

export default SessionModal;
