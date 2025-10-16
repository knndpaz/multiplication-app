import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Reports from "./Reports";
import Students from "./Students";
import GameEditor from "./GameEditor";
import Signup from "./Signup";
import StudentAnalytics from "./StudentAnalytics";
import SessionModal from "./SessionModal";
import RankingModal from "./RankingModal"; // ADD THIS IMPORT

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Session Modal state (waiting room)
  const [sessionCode, setSessionCode] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isSessionMinimized, setIsSessionMinimized] = useState(false);

  // Ranking Modal state (live game)
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [isRankingMinimized, setIsRankingMinimized] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setLoggedIn(false);
  };

  // Function to start a new session (called from Dashboard)
  const startSession = (code, id) => {
    setSessionCode(code);
    setSessionId(id);
    setShowSessionModal(true);
    setIsSessionMinimized(false);
    setShowRankingModal(false); // Ensure ranking modal is closed
  };

  // Function to handle game start (transition from SessionModal to RankingModal)
  const handleGameStart = () => {
    setShowSessionModal(false);
    setIsSessionMinimized(false);
    setShowRankingModal(true);
    setIsRankingMinimized(false);
  };

  // Function to close session completely
  const closeSession = () => {
    setShowSessionModal(false);
    setShowRankingModal(false);
    setSessionCode(null);
    setSessionId(null);
    setIsSessionMinimized(false);
    setIsRankingMinimized(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            loggedIn ? (
              <Dashboard
                user={user}
                onLogout={handleLogout}
                onStartSession={startSession}
              />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
        <Route
          path="/reports"
          element={<Reports user={user} onLogout={handleLogout} />}
        />
        <Route
          path="/students"
          element={<Students user={user} onLogout={handleLogout} />}
        />
        <Route
          path="/games/:level/edit"
          element={<GameEditor user={user} onLogout={handleLogout} />}
        />
        <Route
          path="/student/:studentId"
          element={<StudentAnalytics user={user} onLogout={handleLogout} />}
        />
      </Routes>

      {/* Session Modal (waiting room) - only show if ranking modal is not active */}
      {showSessionModal && !showRankingModal && (
        <SessionModal
          sessionCode={sessionCode}
          sessionId={sessionId}
          isMinimized={isSessionMinimized}
          onMinimize={() => setIsSessionMinimized(true)}
          onExpand={() => setIsSessionMinimized(false)}
          onClose={closeSession}
          onGameStart={handleGameStart}
        />
      )}

      {/* Ranking Modal (live game) - only show after game starts */}
      {showRankingModal && (
        <RankingModal
          sessionCode={sessionCode}
          sessionId={sessionId}
          isMinimized={isRankingMinimized}
          onMinimize={() => setIsRankingMinimized(true)}
          onExpand={() => setIsRankingMinimized(false)}
          onClose={closeSession}
        />
      )}
    </Router>
  );
}

export default App;
