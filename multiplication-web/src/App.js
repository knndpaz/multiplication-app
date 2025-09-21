import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Reports from "./Reports";
import Students from "./Students";
import GameEditor from "./GameEditor";
import Signup from "./Signup";
import StudentAnalytics from "./StudentAnalytics";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            loggedIn ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/signup"
          element={<Signup onSignup={handleLogin} />}
        />
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
    </Router>
  );
}

export default App;
