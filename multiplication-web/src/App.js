import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Reports from "./Reports";
import Students from "./Students";
import GameEditor from "./GameEditor";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "Justine Nabunturan",
    email: "justine@email.com",
  });

  const handleLogout = () => {
    // Your logout logic here
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
              <Login onLogin={() => setLoggedIn(true)} />
            )
          }
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
          path="/games/level-1/edit"
          element={<GameEditor user={user} onLogout={handleLogout} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
