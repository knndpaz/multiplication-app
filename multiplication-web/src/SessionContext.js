import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

export function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(null);
  const [sessionCode, setSessionCode] = useState(null);
  const [sessionLevel, setSessionLevel] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [waitingPlayers, setWaitingPlayers] = useState([]);
  const [readyPlayers, setReadyPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [liveScores, setLiveScores] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [sessionUnsubscribe, setSessionUnsubscribe] = useState(null);

  const startSession = (code, id, level, unsubscribe) => {
    console.log('Starting session:', { code, id, level });
    setSessionCode(code);
    setSessionId(id);
    setSessionLevel(level);
    setShowSessionModal(true);
    setSessionUnsubscribe(() => unsubscribe);
    
    // Reset other state
    setPlayerCount(0);
    setWaitingPlayers([]);
    setReadyPlayers([]);
    setGameStarted(false);
    setLiveScores([]);
    setCurrentQuestion(0);
    setTotalQuestions(0);
  };

  const minimizeSession = () => {
    console.log('Minimizing session - hiding modal but keeping session active');
    setShowSessionModal(false);
  };

  const restoreSession = () => {
    console.log('Restoring session - showing modal again');
    if (sessionId) {
      setShowSessionModal(true);
    }
  };

  const closeSession = () => {
    console.log('Closing session completely');
    
    // Unsubscribe from Firebase listener
    if (sessionUnsubscribe) {
      sessionUnsubscribe();
      setSessionUnsubscribe(null);
    }
    
    // Reset all session state
    setSessionCode(null);
    setSessionId(null);
    setSessionLevel(null);
    setShowSessionModal(false);
    setPlayerCount(0);
    setWaitingPlayers([]);
    setReadyPlayers([]);
    setGameStarted(false);
    setLiveScores([]);
    setCurrentQuestion(0);
    setTotalQuestions(0);
  };

  const value = {
    // State
    sessionId,
    sessionCode,
    sessionLevel,
    showSessionModal,
    playerCount,
    waitingPlayers,
    readyPlayers,
    gameStarted,
    liveScores,
    currentQuestion,
    totalQuestions,

    // Actions
    startSession,
    minimizeSession,
    restoreSession,
    closeSession,
    setPlayerCount,
    setWaitingPlayers,
    setReadyPlayers,
    setGameStarted,
    setLiveScores,
    setCurrentQuestion,
    setTotalQuestions,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}