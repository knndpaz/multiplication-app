import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Reports from "./Reports";
import Students from "./Students";
import GameEditor from "./GameEditor";
import Signup from "./Signup";
import StudentAnalytics from "./StudentAnalytics";
import SessionModal from "./SessionModal";
import RankingModal from "./RankingModal";
import TestPlay from "./TestPlay";
import { SessionProvider, useSession } from "./SessionContext";
import GlobalSessionModal from "./GlobalSessionModal";

function AppContent() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Session Modal state (waiting room)
  const [sessionCode, setSessionCode] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isSessionMinimized, setIsSessionMinimized] = useState(false);

  const { setShowRankingModal } = useSession();

  const handleLogin = (userData) => {
    setUser(userData);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setLoggedIn(false);
  };

  // Function to start a new session (called from Dashboard)
  // `skipPassword` indicates a Play-created single-player session and
  // should prevent the SessionModal (waiting room) from opening.
  const startSession = (code, id, skipPassword = false) => {
    setSessionCode(code);
    setSessionId(id);
    // Only show the session modal when this is a group/teacher session.
    setShowSessionModal(!skipPassword);
    setIsSessionMinimized(false);
  };

  // Function to handle game start (transition from SessionModal to RankingModal)
  const handleGameStart = () => {
    setShowSessionModal(false);
    setIsSessionMinimized(false);
    // Show ranking modal when game starts
    setShowRankingModal(true);
  };

  // Function to close session completely
  const closeSession = async () => {
    if (sessionId) {
      try {
        // Update session status to ended
        await updateDoc(doc(db, "sessions", sessionId), {
          status: "ended",
          endedAt: new Date(),
        });
      } catch (error) {
        console.error("Error updating session status:", error);
      }
    }

    setShowSessionModal(false);
    setSessionCode(null);
    setSessionId(null);
    setIsSessionMinimized(false);
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
          element={
            loggedIn ? (
              <Reports user={user} onLogout={handleLogout} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/students"
          element={
            loggedIn ? (
              <Students user={user} onLogout={handleLogout} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/games/:level/edit"
          element={
            loggedIn ? (
              <GameEditor user={user} onLogout={handleLogout} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/student/:studentId"
          element={
            loggedIn ? (
              <StudentAnalytics user={user} onLogout={handleLogout} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/games/:level/play"
          element={
            loggedIn ? (
              <TestPlay user={user} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
      </Routes>

      {/* Session Modal (waiting room) - only show if ranking modal is not active */}
      {showSessionModal && (
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

      {/* Global Session Indicator */}
      <GlobalSessionModal />

      {/* Ranking Modal (live game) */}
      <RankingModal
        sessionCode={sessionCode}
        sessionId={sessionId}
        onClose={closeSession}
      />
    </Router>
  );
}

function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}

export default App;
