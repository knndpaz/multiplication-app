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
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getSessionAnalytics } from "./analytics";

const db = getFirestore();

function generateSessionCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function Dashboard({ user, onLogout, onStartSession }) {
  const navigate = useNavigate();

  // Analytics state
  const [analytics, setAnalytics] = React.useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = React.useState(true);

  // Load analytics on mount
  React.useEffect(() => {
    async function loadAnalytics() {
      setLoadingAnalytics(true);
      const data = await getSessionAnalytics();
      setAnalytics(data);
      setLoadingAnalytics(false);
    }
    loadAnalytics();
  }, []);

  // Generate insights from analytics
  const insights = React.useMemo(() => {
    if (!analytics) return [];

    return [
      {
        key: "red",
        icon: circleX,
        borderColor: "#ff6b6b",
        bgColor: "#fff6f6",
        title: "Most Challenging Question",
        desc: `"${analytics.mostChallengingQuestion.question}" in ${analytics.mostChallengingQuestion.level}`,
        link: `${analytics.mostChallengingQuestion.rate}% success rate`,
      },
      {
        key: "green",
        icon: trophy,
        borderColor: "#3ecf8e",
        bgColor: "#f6fff9",
        title: "Best Performing Level",
        desc: `${analytics.bestPerformingLevel.level} showing excellent results`,
        link: `${analytics.bestPerformingLevel.average}% average score`,
      },
      {
        key: "blue",
        icon: time,
        borderColor: "#4fd1ff",
        bgColor: "#f6fcff",
        title: "Latest Session",
        desc: "Last group session completed",
        link: `${analytics.latestSession.players} players, ${analytics.latestSession.completion}% completion rate`,
      },
      {
        key: "orange",
        icon: warning,
        borderColor: "#ffb86b",
        bgColor: "#fffaf6",
        title: "Questions Need Review",
        desc: "Questions with low success rates",
        link: `${analytics.questionsNeedReview} questions below 40%`,
      },
      {
        key: "pink",
        icon: timeFill,
        borderColor: "#ff61d2",
        bgColor: "#fff6fb",
        title: "Peak Activity Time",
        desc: "Most sessions conducted at",
        link: analytics.peakActivityTime,
      },
    ];
  }, [analytics]);

  const gameIcons = [cake, speedo, fire];

  async function handleGroupPlay(level) {
    const code = generateSessionCode();
    const sessionRef = await addDoc(collection(db, "sessions"), {
      code,
      level,
      createdAt: serverTimestamp(),
      players: [],
      waitingPlayers: [],
      status: "waiting",
      gameStarted: false,
    });

    // Call the parent function to start session at App level
    onStartSession(code, sessionRef.id);
  }

  return (
    <div className="dashboard-bg">
      <Header user={user} onLogout={onLogout} />
      <div className="dashboard-content">
        <div className="dashboard-breadcrumb card">Dashboard</div>
        <div className="dashboard-main-row">
          <div className="dashboard-main-col equal-height-col">
            <div className="dashboard-welcome card">
              <div>
                <h1>
                  Hi, {user?.firstname} {user?.lastname}!
                </h1>
                <p>
                  Monitor your multiplication game sessions and track student
                  progress with real-time analytics and insights.
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
                      onClick={() =>
                        navigate(
                          `/games/${level.toLowerCase().replace(" ", "-")}/edit`
                        )
                      }
                    >
                      <span className="material-icons">edit</span> Edit
                    </button>
                    <button
                      className="game-btn play"
                      onClick={() =>
                        window.open("http://localhost:8081", "_blank")
                      }
                    >
                      <span className="material-icons">play_arrow</span> Play
                    </button>
                    <button
                      className="game-btn group"
                      onClick={() => handleGroupPlay(level)}
                    >
                      <span className="material-icons">groups</span> Group Play
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dashboard-insights card equal-height-col">
            <div className="insights-header">
              <img
                src={insightstone}
                alt=""
                style={{ width: 32, height: 32, marginRight: 8 }}
              />
              <b>Quick Insights</b>
              <a href="/reports" className="insights-link">
                View all reports{" "}
                <span
                  className="material-icons"
                  style={{ fontSize: 16, verticalAlign: "middle" }}
                >
                  arrow_forward
                </span>
              </a>
            </div>
            <div className="insights-list">
              {loadingAnalytics ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#888",
                  }}
                >
                  Loading analytics...
                </div>
              ) : (
                insights.map((insight, idx) => (
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
                ))
              )}
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
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          padding: 22px 32px;
          margin-bottom: 18px;
        }
        
        .dashboard-breadcrumb {
          font-size: 13px;
          color: #444;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          font-family: 'Inter', Arial, sans-serif;
          font-weight: 500;
          padding: 12px 18px;
        }
        
        .dashboard-main-row {
          display: flex;
          gap: 24px;
          align-items: stretch;
        }
        
        .dashboard-main-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        
        .dashboard-insights {
          flex: 1;
          max-width: 400px;
        }
        
        .dashboard-welcome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 120px;
          position: relative;
        }
        
        .dashboard-welcome h1 {
          margin: 0 0 10px 0;
          font-size: 2.2rem;
          color: #333;
        }
        
        .dashboard-welcome p {
          margin: 0;
          color: #888;
          font-size: 1rem;
        }
        
        .dashboard-people-wrapper {
          position: relative;
          min-width: 120px;
          height: 120px;
        }
        
        .dashboard-people {
          width: 180px;
          height: auto;
          position: absolute;
          top: -60px;
          right: -20px;
        }
        
        .dashboard-games h2 {
          margin: 0 0 18px 0;
          color: #333;
        }
        
        .game-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .game-row {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #f8f8f8;
          border-radius: 10px;
          padding: 14px 18px;
        }
        
        .game-level {
          font-weight: 600;
          font-size: 17px;
          flex: 1;
        }
        
        .game-btn {
          border: none;
          border-radius: 7px;
          padding: 7px 14px;
          font-size: 14px;
          font-weight: 500;
          margin-left: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .game-btn.edit { background: #ffb86b; color: #fff; }
        .game-btn.play { background: #3ecf8e; color: #fff; }
        .game-btn.group { background: #4fd1ff; color: #fff; }
        
        .game-btn:hover {
          opacity: 0.9;
        }
        
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
          border: 1.5px solid #eee;
          position: relative;
        }
        
        .insight-shadow {
          position: absolute;
          left: -2px;
          top: 8px;
          bottom: 8px;
          width: 6px;
          border-radius: 3px;
        }
        
        .insight b {
          display: block;
          margin-bottom: 4px;
          color: #333;
        }
        
        .insight-desc {
          color: #666;
          font-size: 13px;
          margin-bottom: 2px;
        }
        
        .insight-link {
          color: #4fd1ff;
          font-size: 13px;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .dashboard-main-row {
            flex-direction: column;
          }
          
          .dashboard-insights {
            max-width: none;
          }
          
          .dashboard-welcome {
            flex-direction: column;
            text-align: center;
            min-height: auto;
          }
          
          .dashboard-people-wrapper {
            margin-top: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
