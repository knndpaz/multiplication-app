import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "./assets/logo.png";
import people from "./assets/people.png";
import overlay from "./assets/overlay.png";

function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Helper to check if current path matches
  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="header-bg">
        <img src={overlay} alt="" className="header-overlay" />
        <div className="header-container">
          <div className="header-left">
            <img src={logo} alt="Multiplication Logo" className="header-logo" />
          </div>

          <nav className="header-nav desktop-nav">
            <a
              className={`header-link${isActive("/") ? " active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >
              <span className="material-icons">home</span>
              Dashboard
            </a>
            <a
              className={`header-link${isActive("/reports") ? " active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/reports");
              }}
            >
              <span className="material-icons">bar_chart</span>
              Reports
            </a>
            <a
              className={`header-link${isActive("/students") ? " active" : ""}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/students");
              }}
            >
              <span className="material-icons">groups</span>
              Students
            </a>
          </nav>

          <div className="header-right">
            <div className="header-user">
              <div className="header-user-info">
                <div className="header-user-name">
                  {user?.firstname} {user?.lastname}
                </div>
                <div className="header-user-email">{user?.email}</div>
              </div>
              <img src={people} alt="User" className="header-user-img" />
            </div>

            {/* Desktop Logout Button */}
            <button className="header-logout" onClick={onLogout}>
              <span className="material-icons">logout</span>
              Logout
            </button>

            <button
              className="header-burger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`burger-line ${menuOpen ? "open" : ""}`}></span>
              <span className={`burger-line ${menuOpen ? "open" : ""}`}></span>
              <span className={`burger-line ${menuOpen ? "open" : ""}`}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-user">
            <img src={people} alt="User" className="sidebar-user-img" />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.firstname} {user?.lastname}
              </div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a
            className={`sidebar-link${isActive("/") ? " active" : ""}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("/");
            }}
          >
            <span className="material-icons">home</span>
            Dashboard
          </a>
          <a
            className={`sidebar-link${isActive("/reports") ? " active" : ""}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("/reports");
            }}
          >
            <span className="material-icons">bar_chart</span>
            Reports
          </a>
          <a
            className={`sidebar-link${isActive("/students") ? " active" : ""}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("/students");
            }}
          >
            <span className="material-icons">groups</span>
            Students
          </a>
        </nav>

        <button className="sidebar-logout" onClick={onLogout}>
          <span className="material-icons">logout</span>
          Logout
        </button>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        .header-bg {
          width: 100%;
          background: linear-gradient(180deg, #60A5FA 0%, #A78BFA 50%, #F864D3 100%);
          position: relative;
          z-index: 100;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          font-family: 'Poppins', sans-serif;
        }
        
        .header-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.15;
          z-index: 0;
          pointer-events: none;
        }
        
        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }
        
        .header-left {
          display: flex;
          align-items: center;
        }
        
        .header-logo {
          height: 100px;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
          transition: transform 0.3s ease;
        }
        
        .header-logo:hover {
          transform: scale(1.05);
        }
        
        .desktop-nav {
          display: flex;
          gap: 8px;
          margin-left: 40px;
        }
        
        .header-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .header-link:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .header-link.active {
          background: rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .header-link .material-icons {
          font-size: 20px;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .header-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .header-user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .header-user-name {
          color: white;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.2;
        }
        
        .header-user-email {
          color: rgba(255, 255, 255, 0.9);
          font-size: 11px;
          line-height: 1.2;
        }
        
        .header-user-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header-logout {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-weight: 600;
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .header-logout:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .header-logout .material-icons {
          font-size: 20px;
        }

        /* Hide logout on mobile */
        @media (max-width: 768px) {
          .header-logout {
            display: none;
          }
        }

        
        .header-burger {
          display: none;
          flex-direction: column;
          justify-content: space-around;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 101;
        }
        
        .burger-line {
          width: 100%;
          height: 3px;
          background: white;
          border-radius: 10px;
          transition: all 0.3s ease;
          transform-origin: center;
        }
        
        .burger-line.open:nth-child(1) {
          transform: translateY(10px) rotate(45deg);
        }
        
        .burger-line.open:nth-child(2) {
          opacity: 0;
        }
        
        .burger-line.open:nth-child(3) {
          transform: translateY(-10px) rotate(-45deg);
        }
        
        /* Mobile Sidebar */
        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: -320px;
          width: 320px;
          height: 100vh;
          background: linear-gradient(180deg, #60A5FA 0%, #A78BFA 50%, #F864D3 100%);
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
          z-index: 102;
          transition: left 0.3s ease;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        
        .mobile-sidebar.open {
          left: 0;
        }
        
        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 12px;
        }
        
        .sidebar-user-img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .sidebar-user-info {
          flex: 1;
        }
        
        .sidebar-user-name {
          color: white;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 2px;
        }
        
        .sidebar-user-email {
          color: rgba(255, 255, 255, 0.9);
          font-size: 12px;
          line-height: 1.3;
        }
        
        .sidebar-nav {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          text-decoration: none;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }
        
        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(4px);
        }
        
        .sidebar-link.active {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .sidebar-link .material-icons {
          font-size: 24px;
        }
        
        .sidebar-logout {
          margin: 20px;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        
        .sidebar-logout:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .sidebar-logout .material-icons {
          font-size: 22px;
        }
        
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          z-index: 101;
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
        
        @media (max-width: 1024px) {
          .header-container {
            padding: 0 20px;
          }
          
          .desktop-nav {
            margin-left: 24px;
            gap: 4px;
          }
          
          .header-link {
            font-size: 14px;
            padding: 8px 14px;
            gap: 6px;
          }
          
          .header-user-info {
            display: none;
          }
        }
        
        @media (max-width: 768px) {
          .header-container {
            height: 70px;
            padding: 0 16px;
          }
          
          .header-logo {
            height: 60px;
          }
          
          .desktop-nav {
            display: none;
          }
          
          .header-user-info {
            display: none;
          }
          
          .header-burger {
            display: flex;
          }
        }
        
        @media (max-width: 480px) {
          .header-container {
            height: 65px;
          }
          
          .header-logo {
            height: 55px;
          }
          
          .header-user {
            padding: 6px 12px;
          }
          
          .header-user-img {
            width: 36px;
            height: 36px;
          }
          
          .mobile-sidebar {
            width: 280px;
            left: -280px;
          }
        }
      `}</style>
    </>
  );
}

export default Header;
