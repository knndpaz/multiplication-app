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

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Lifted session state to App level
  const [sessionCode, setSessionCode] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isModalMinimized, setIsModalMinimized] = useState(false);

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
    setIsModalMinimized(false);
  };

  // Function to close session
  const closeSession = () => {
    setShowSessionModal(false);
    setSessionCode(null);
    setSessionId(null);
    setIsModalMinimized(false);
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

      {/* Session Modal - persists across all pages */}
      {showSessionModal && (
        <SessionModal
          sessionCode={sessionCode}
          sessionId={sessionId}
          isMinimized={isModalMinimized}
          onMinimize={() => setIsModalMinimized(true)}
          onExpand={() => setIsModalMinimized(false)}
          onClose={closeSession}
        />
      )}
    </Router>
  );
}

export default App;
