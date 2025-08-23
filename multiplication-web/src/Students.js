import React from "react";
import Header from "./Header";
import people from "./assets/people.png";

function Students({ user, onLogout }) {
  return (
    <div className="students-bg">
      <Header user={user} onLogout={onLogout} />
      <div className="students-content">
        <div className="students-breadcrumb card">
          <span>Dashboard</span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>{'>'}</span>
          <span style={{ color: "#888" }}>Students</span>
        </div>
        <div className="students-title-row card">
          <div className="students-title-left">
            <span className="material-icons students-title-icon" style={{ fontSize: 44, color: "#a259ff", marginRight: 12 }}>person</span>
            <div className="students-title">Student Performance Analytics</div>
          </div>
          <div className="students-title-right">
            <button className="students-add-btn">Add Student</button>
            <div className="students-search">
              <input placeholder="Search Student" />
              <span className="material-icons">search</span>
            </div>
          </div>
        </div>
        <div className="students-table card">
          <div className="students-table-header">
            <span>Name</span>
            <span>ID</span>
            <span>Password</span>
            <span></span>
          </div>
          {[1, 2, 3].map(i => (
            <div className="students-table-row" key={i}>
              <div className="students-info">
                <img src={people} alt="" className="students-img" />
                <span className="students-name">Justin Nabunturan</span>
              </div>
              <span className="students-id">ID: STU-BNQZPLUS</span>
              <span className="students-password">
                ******** <span className="material-icons students-eye">visibility</span>
              </span>
              <span className="students-actions">
                <button className="students-action-btn edit"><span className="material-icons">edit</span></button>
                <button className="students-action-btn delete"><span className="material-icons">delete</span></button>
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .students-bg {
          min-height: 100vh;
          background: #EAEAEA;
          padding: 0;
        }
        .students-content {
          padding: 32px 24px 24px 24px;
          max-width: 1300px;
          margin: 0 auto;
        }
        .card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          padding: 22px 32px;
          margin-bottom: 18px;
        }
        .students-breadcrumb {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #444;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          font-family: 'Inter', Arial, sans-serif;
          font-weight: 500;
          letter-spacing: 0.01em;
          margin-bottom: 18px;
          padding: 12px 18px;
        }
        .students-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .students-title-left {
          display: flex;
          align-items: center;
        }
        .students-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #222;
        }
        .students-title-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .students-add-btn {
          background: #19d419;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 28px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 8px;
        }
        .students-search {
          display: flex;
          align-items: center;
          background: #eaeaea;
          border-radius: 7px;
          padding: 4px 10px;
        }
        .students-search input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 15px;
          width: 140px;
        }
        .students-search .material-icons {
          font-size: 20px;
          color: #888;
        }
        .students-table {
          padding: 0;
        }
        .students-table-header {
          display: flex;
          align-items: center;
          background: #f7f7f7;
          border-radius: 12px 12px 0 0;
          font-size: 14px;
          color: #444;
          font-weight: 600;
          padding: 18px 32px;
          gap: 0;
        }
        .students-table-header span {
          flex: 1;
        }
        .students-table-row {
          display: flex;
          align-items: center;
          padding: 18px 32px;
          border-bottom: 1px solid #eee;
        }
        .students-table-row:last-child {
          border-bottom: none;
        }
        .students-info {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
        }
        .students-img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
        }
        .students-name {
          font-weight: 500;
          color: #222;
        }
        .students-id {
          flex: 1;
          color: #888;
          font-size: 13px;
        }
        .students-password {
          flex: 1;
          color: #444;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .students-eye {
          font-size: 18px;
          color: #888;
          cursor: pointer;
        }
        .students-actions {
          flex: 1;
          display: flex;
          gap: 8px;
        }
        .students-action-btn {
          border: none;
          background: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          font-size: 18px;
        }
        .students-action-btn.edit {
          color: #ffb300;
          background: #fffbe6;
        }
        .students-action-btn.delete {
          color: #ff4444;
          background: #ffeaea;
        }
        @media (max-width: 900px) {
          .students-content {
            padding: 10px 2vw;
          }
          .card {
            padding: 12px 6px;
          }
          .students-table-header, .students-table-row {
            padding-left: 10px;
            padding-right: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default Students;