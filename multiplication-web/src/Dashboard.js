import React from "react";
import { useNavigate } from "react-router-dom";
import people from "./assets/people.png";
import Header from "./Header";

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-bg">
      <Header user={user} onLogout={onLogout} />
      <div className="dashboard-content">
        <div className="dashboard-breadcrumb card">
          Dashboard
        </div>
        <div className="dashboard-main-row">
          <div className="dashboard-main-col">
            <div className="dashboard-welcome card">
              <div>
                <h1>Hi, {user.name.split(" ")[0]}!</h1>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                </p>
              </div>
              <div className="dashboard-people-wrapper">
                <img src={people} alt="" className="dashboard-people" />
              </div>
            </div>
            <div className="dashboard-games card">
              <h2>Games</h2>
              <div className="game-list">
                {["LEVEL 1", "LEVEL 2", "LEVEL 3"].map((level, i) => (
                  <div className="game-row" key={level}>
                    <span className={`material-icons game-icon game-icon-${i}`}>{
                      i === 0 ? "star" : i === 1 ? "speed" : "psychology"
                    }</span>
                    <span className="game-level">{level}</span>
                    <button
                      className="game-btn edit"
                      onClick={() => navigate("/games/level-1/edit")}
                    >
                      <span className="material-icons">edit</span> Edit
                    </button>
                    <button className="game-btn play"><span className="material-icons">play_arrow</span> Play</button>
                    <button className="game-btn group"><span className="material-icons">groups</span> Group Play</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dashboard-insights card">
            <div className="insights-header">
              <span className="material-icons" style={{ color: "#a259ff", marginRight: 8 }}>show_chart</span>
              <b>Quick Insights</b>
              <a href="#" className="insights-link">View all reports <span className="material-icons" style={{ fontSize: 16, verticalAlign: "middle" }}>arrow_forward</span></a>
            </div>
            <div className="insights-list">
              <div className="insight insight-red">
                <span className="material-icons">close</span>
                <div>
                  <b>Most Challenging Question</b>
                  <div className="insight-desc">"What is 7 x 8?" in Level 2</div>
                  <div className="insight-link">28% success rate</div>
                </div>
              </div>
              <div className="insight insight-green">
                <span className="material-icons">emoji_events</span>
                <div>
                  <b>Best Performing Level</b>
                  <div className="insight-desc">Level 1 showing excellent results</div>
                  <div className="insight-link">87% average score</div>
                </div>
              </div>
              <div className="insight insight-blue">
                <span className="material-icons">history</span>
                <div>
                  <b>Latest Session</b>
                  <div className="insight-desc">Last group session completed</div>
                  <div className="insight-link">15 players, 92% completion rate</div>
                </div>
              </div>
              <div className="insight insight-orange">
                <span className="material-icons">error_outline</span>
                <div>
                  <b>Questions Need Review</b>
                  <div className="insight-desc">Questions with low success rates</div>
                  <div className="insight-link">4 questions below 40%</div>
                </div>
              </div>
              <div className="insight insight-pink">
                <span className="material-icons">schedule</span>
                <div>
                  <b>Peak Activity Time</b>
                  <div className="insight-desc">Most sessions conducted at</div>
                  <div className="insight-link">2:00 - 3:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        .dashboard-bg {
          min-height: 100vh;
          background: #EAEAEA;
          padding: 0;
        }
        .dashboard-content {
          padding: 32px 24px 24px 24px;
          max-width: 1300px;
          margin: 0 auto;
        }
        .dashboard-breadcrumb {
          margin-bottom: 18px;
          padding: 12px 18px;
          font-size: 13px;
          color: #444;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          font-family: 'Inter', Arial, sans-serif;
          font-weight: 500;
          letter-spacing: 0.01em;
        }
        .dashboard-main-row {
          display: flex;
          gap: 24px;
        }
        .dashboard-main-col {
          flex: 1.5;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .dashboard-insights {
          flex: 1.2;
          min-width: 340px;
          max-width: 420px;
        }
        .card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          padding: 22px 32px;
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: visible;
        }
        .dashboard-welcome {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: visible;
          min-height: 120px;
          height: 120px;
          max-height: 140px;
        }
        .dashboard-welcome h1 {
          margin: 0 0 10px 0;
          font-size: 2.2rem;
        }
        .dashboard-welcome p {
          margin: 0;
          color: #888;
          font-size: 1rem;
        }
        .dashboard-people-wrapper {
          position: relative;
          display: flex;
          align-items: flex-start;
          height: 120px;
          min-width: 120px;
        }
        .dashboard-people {
          width: 200px;
          height: auto;
          position: absolute;
          top: -80px;
          right: 0;
          z-index: 2;
          background: transparent;
        }
        .game-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-top: 18px;
        }
        .game-row {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #f8f8f8;
          border-radius: 10px;
          padding: 14px 18px;
        }
        .game-icon {
          font-size: 30px;
        }
        .game-icon-0 { color: #ffb300; }
        .game-icon-1 { color: #3ecf8e; }
        .game-icon-2 { color: #a259ff; }
        .game-level {
          font-weight: 600;
          font-size: 17px;
          margin-right: 18px;
        }
        .game-btn {
          border: none;
          border-radius: 7px;
          padding: 7px 16px;
          font-size: 15px;
          font-weight: 500;
          margin-right: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .game-btn.edit { background: #ffb86b; color: #fff; }
        .game-btn.play { background: #3ecf8e; color: #fff; }
        .game-btn.group { background: #4fd1ff; color: #fff; }
        .game-btn:last-child { margin-right: 0; }
        .insights-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .insights-link {
          color: #888;
          font-size: 13px;
          text-decoration: none;
          display: flex;
          align-items: center;
        }
        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .insight {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          border-radius: 12px;
          padding: 16px 18px;
          background: #fafbfc;
          border: 1.5px solid #eee;
        }
        .insight-red { border-color: #ff6b6b; background: #fff6f6; }
        .insight-green { border-color: #3ecf8e; background: #f6fff9; }
        .insight-blue { border-color: #4fd1ff; background: #f6fcff; }
        .insight-orange { border-color: #ffb86b; background: #fffaf6; }
        .insight-pink { border-color: #ff61d2; background: #fff6fb; }
        .insight .material-icons {
          font-size: 32px;
          margin-top: 2px;
        }
        .insight-desc {
          color: #888;
          font-size: 13px;
        }
        .insight-link {
          color: #a259ff;
          font-size: 13px;
          margin-top: 2px;
        }
        @media (max-width: 1100px) {
          .dashboard-main-row {
            flex-direction: column;
          }
          .dashboard-main-col {
            flex-direction: column;
          }
          .dashboard-insights {
            max-width: 100vw;
            min-width: 0;
            margin-top: 24px;
          }
          .dashboard-people-wrapper {
            justify-content: center;
            min-width: 0;
            height: 90px;
          }
          .dashboard-people {
            width: 90px;
            top: -28px;
          }
        }
        @media (max-width: 700px) {
          .dashboard-content {
            padding: 10px 2vw;
          }
          .card {
            padding: 16px 8px;
          }
          .dashboard-breadcrumb {
            padding: 8px 10px;
            font-size: 12px;
          }
          .dashboard-people-wrapper {
            height: 60px;
          }
          .dashboard-people {
            width: 60px;
            top: -18px;
          }
          .dashboard-welcome {
            min-height: 70px;
            height: 70px;
            max-height: 90px;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;