import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "./assets/logo.png";
import people from "./assets/people.png";
import overlay from "./assets/overlay.png";

function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check if current path matches
  const isActive = (path) => location.pathname === path;

  return (
    <header className="header-bg">
      <img src={overlay} alt="" className="header-overlay" />
      <div className="header-left">
        <img src={logo} alt="Multiplication Logo" className="header-logo" />
      </div>
      <nav className="header-nav">
        <a
          className={`header-link${isActive("/") ? " active" : ""}`}
          href="#"
          onClick={e => {
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
          onClick={e => {
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
          onClick={e => {
            e.preventDefault();
            navigate("/students");
          }}
        >
          <span className="material-icons">groups</span>
          Students
        </a>
      </nav>
      <div className="header-user">
        <div className="header-user-info">
          <div className="header-user-name">
            {user?.firstname} {user?.lastname}
          </div>
          <div className="header-user-email">{user?.email}</div>
        </div>
        <img src={people} alt="User" className="header-user-img" />
        <button className="header-logout" onClick={onLogout}>
          <span className="material-icons">logout</span> Logout
        </button>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        .header-bg {
          width: 100vw;
          height: 100px;
          background: linear-gradient(180deg, #4fd1ff 0%, #ff61d2 100%);
          display: flex;
          align-items: center;
          padding: 0 32px;
          box-sizing: border-box;
          position: relative;
          z-index: 10;
          overflow: hidden;
        }
        .header-overlay {
          position: absolute;
          top: 0; left: 0; width: 100vw; height: 100%;
          object-fit: cover;
          opacity: 0.5;
          z-index: 0;
          pointer-events: none;
        }
        .header-left {
          flex: 0 0 auto;
          z-index: 1;
        }
        .header-logo {
          height: 100px;
        }
        .header-nav {
          display: flex;
          gap: 18px;
          margin-left: 32px;
          flex: 1;
          z-index: 1;
        }
        .header-link {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #fff;
          font-weight: 500;
          font-size: 17px;
          text-decoration: none;
          padding: 10px 18px;
          border-radius: 12px;
          opacity: 0.85;
          transition: background 0.2s, opacity 0.2s;
        }
        .header-link.active, .header-link:hover {
          background: rgba(255,255,255,0.18);
          opacity: 1;
        }
        .material-icons {
          font-size: 22px;
        }
        .header-user {
          display: flex;
          align-items: center;
          gap: 18px;
          border-left: 1px solid #fff5;
          padding-left: 24px;
          margin-left: 24px;
          z-index: 1;
        }
        .header-user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-right: 8px;
        }
        .header-user-name {
          color: #fff;
          font-size: 14px;
          font-weight: 600;
        }
        .header-user-email {
          color: #fff;
          font-size: 11px;
          opacity: 0.8;
        }
        .header-user-img {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
        }
        .header-logout {
          background: none;
          border: none;
          color: #fff;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          margin-left: 12px;
          opacity: 0.9;
          transition: opacity 0.2s;
        }
        .header-logout:hover {
          opacity: 1;
        }
        @media (max-width: 900px) {
          .header-bg {
            flex-direction: column;
            height: auto;
            padding: 12px;
          }
          .header-nav {
            margin-left: 0;
            margin-top: 10px;
          }
          .header-user {
            margin-left: 0;
            padding-left: 0;
            border-left: none;
            margin-top: 10px;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;