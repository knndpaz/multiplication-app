import React from 'react';
import { useSession } from './SessionContext';

function GlobalSessionModal() {
  const {
    sessionId,
    sessionCode,
    sessionLevel,
    showSessionModal,
    waitingPlayers,
    gameStarted,
    liveScores,
    currentQuestion,
    totalQuestions,
    restoreSession,
    closeSession
  } = useSession();

  console.log('GlobalSessionModal render:', {
    sessionId,
    showSessionModal,
    gameStarted,
    shouldShow: sessionId && !showSessionModal
  });

  // Show indicator when there's a session but modal is not visible
  if (!sessionId || showSessionModal) {
    return null;
  }

  const playersCount = waitingPlayers?.length || 0;
  const activePlayersCount = liveScores?.length || 0;

  // Different content based on game state
  let title, subtitle, color, showPulse;
  
  if (gameStarted) {
    title = `🎮 Live Game: ${sessionCode}`;
    subtitle = `${sessionLevel} • Q${currentQuestion}/${totalQuestions} • ${activePlayersCount} players`;
    color = '#4CAF50';
    showPulse = true;
  } else {
    title = `📋 Session: ${sessionCode}`;
    subtitle = `${sessionLevel} • ${playersCount} players waiting`;
    color = '#4fd1ff';
    showPulse = playersCount > 0;
  }

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: color,
          borderRadius: '15px',
          padding: '15px 20px',
          color: 'white',
          cursor: 'pointer',
          zIndex: 999999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          minWidth: '280px',
          maxWidth: '350px',
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: '14px'
        }} 
        onClick={() => {
          console.log('Global indicator clicked, restoring session');
          restoreSession();
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {title}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {subtitle}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '15px' }}>
            {/* Pulse indicator */}
            {showPulse && (
              <div 
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#FFD700',
                  animation: 'globalPulse 2s infinite'
                }} 
              />
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Close button clicked');
                closeSession();
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
              title="Close session"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes globalPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </>
  );
}

export default GlobalSessionModal;