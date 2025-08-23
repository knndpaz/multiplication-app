import React from "react";
import { useNavigate } from "react-router-dom";
import people from "./assets/people.png";
import Header from "./Header";
import circleX from "./assets/circle-x.png";
import trophy from "./assets/trophy.png";
import time from "./assets/time.png";
import timeFill from "./assets/time-fill.png";
import warning from "./assets/warning.png";
import insightstone from "./assets/insights.png";
import cake from "./assets/cake.png";
import speedo from "./assets/speedo.png";
import fire from "./assets/fire.png";

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  // Quick Insights data
  const insights = [
    {
      key: "red",
      icon: circleX,
      borderColor: "#ff6b6b",
      bgColor: "#fff6f6",
      title: "Most Challenging Question",
      desc: '"What is 7 x 8?" in Level 2',
      link: "28% success rate",
    },
    {
      key: "green",
      icon: trophy,
      borderColor: "#3ecf8e",
      bgColor: "#f6fff9",
      title: "Best Performing Level",
      desc: "Level 1 showing excellent results",
      link: "87% average score",
    },
    {
      key: "blue",
      icon: time,
      borderColor: "#4fd1ff",
      bgColor: "#f6fcff",
      title: "Latest Session",
      desc: "Last group session completed",
      link: "15 players, 92% completion rate",
    },
    {
      key: "orange",
      icon: warning,
      borderColor: "#ffb86b",
      bgColor: "#fffaf6",
      title: "Questions Need Review",
      desc: "Questions with low success rates",
      link: "4 questions below 40%",
    },
    {
      key: "pink",
      icon: timeFill,
      borderColor: "#ff61d2",
      bgColor: "#fff6fb",
      title: "Peak Activity Time",
      desc: "Most sessions conducted at",
      link: "2:00 - 3:00 PM",
    },
  ];

  const gameIcons = [cake, speedo, fire];

  return (
    <div className="dashboard-bg">
      <Header user={user} onLogout={onLogout} />
      <div className="dashboard-content">
        <div className="dashboard-breadcrumb card">
          Dashboard
        </div>
        <div className="dashboard-main-row">
          <div className="dashboard-main-col equal-height-col">
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
                    <img
                      src={gameIcons[i]}
                      alt=""
                      className={`game-img-icon game-img-icon-${i}`}
                      style={{ width: 32, height: 32 }}
                    />
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
          <div className="dashboard-insights card equal-height-col">
            <div className="insights-header">
              <img src={insightstone} alt="" style={{ width: 32, height: 32, marginRight: 8 }} />
              <b>Quick Insights</b>
              <a href="#" className="insights-link">View all reports <span className="material-icons" style={{ fontSize: 16, verticalAlign: "middle" }}>arrow_forward</span></a>
            </div>
            <div className="insights-list">
              {insights.map((insight, idx) => (
                <div
                  key={insight.key}
                  className={`insight insight-${insight.key}`}
                  style={{
                    borderColor: insight.borderColor,
                    background: insight.bgColor,
                  }}
                >
                  <div
                    className="insight-shadow"
                    style={{
                      background: insight.borderColor,
                    }}
                  />
                  <img
                    src={insight.icon}
                    alt=""
                    style={{
                      width: 38,
                      height: 38,
                      marginTop: 2,
                      marginRight: 8,
                      flexShrink: 0,
                      zIndex: 1,
                    }}
                  />
                  <div style={{ zIndex: 1 }}>
                    <b>{insight.title}</b>
                    <div className="insight-desc">{insight.desc}</div>
                    <div className="insight-link">{insight.link}</div>
                  </div>
                </div>
              ))}
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
          padding: 32px 2vw 24px 2vw;
          max-width: 100vw;
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
          width: 100%;
          box-sizing: border-box;
        }
        .dashboard-main-row {
          display: flex;
          gap: 32px;
          justify-content: center;
          align-items: stretch;
          width: 100%;
        }
        .dashboard-main-col,
        .dashboard-insights {
          flex: 1 1 0;
          min-width: 0;
          max-width: 700px;
        }
        .dashboard-main-col {
          display: flex;
          flex-direction: column;
          gap: 30px; /* Reduced gap between welcome and games */
          height: 100%;
        }
        .equal-height-col {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .dashboard-main-row {
          align-items: stretch;
        }
        .dashboard-main-col.equal-height-col {
          justify-content: stretch;
        }
        .dashboard-insights.equal-height-col {
          justify-content: stretch;
        }
        .dashboard-main-col.equal-height-col {
          height: auto;
        }
        .dashboard-insights.equal-height-col {
          height: auto;
        }
        .dashboard-welcome,
        .dashboard-games {
          flex: 1 1 0;
          min-height: 0;
        }
        .dashboard-welcome {
          margin-bottom: 0;
        }
        .dashboard-games {
          margin-bottom: 0;
        }
        .card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          padding: 22px 32px;
          flex: 1 1 0;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: visible;
          width: 100%;
          box-sizing: border-box;
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
          position: relative;
          overflow: visible;
        }
        .insight-shadow {
          position: absolute;
          left: -18px;
          top: 10px;
          bottom: 10px;
          width: 10px;
          border-radius: 8px;
          z-index: 0;
          /* background set inline */
          box-shadow: none;
          opacity: 1;
        }
        .insight-red { border-color: #ff6b6b; background: #fff6f6; }
        .insight-green { border-color: #3ecf8e; background: #f6fff9; }
        .insight-blue { border-color: #4fd1ff; background: #f6fcff; }
        .insight-orange { border-color: #ffb86b; background: #fffaf6; }
        .insight-pink { border-color: #ff61d2; background: #fff6fb; }
        .insight-desc {
          color: #888;
          font-size: 13px;
        }
        .insight-link {
          color: #a259ff;
          font-size: 13px;
          margin-top: 2px;
        }
        .game-img-icon {
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
        }
        @media (max-width: 1100px) {
          .dashboard-main-row {
            flex-direction: column;
            align-items: stretch;
            gap: 24px;
          }
          .dashboard-main-col,
          .dashboard-insights {
            max-width: 100vw;
            min-width: 0;
            margin-top: 0;
            width: 100%;
          }
          .dashboard-breadcrumb {
            max-width: 100vw;
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