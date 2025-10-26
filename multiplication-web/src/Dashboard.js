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
  getDocs,
  collectionGroup,
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
  const [totalStudents, setTotalStudents] = React.useState(0);
  const [questionCounts, setQuestionCounts] = React.useState({
    "level-1": 0,
    "level-2": 0,
    "level-3": 0,
  });

  // Load analytics and students on mount
  React.useEffect(() => {
    async function loadData() {
      setLoadingAnalytics(true);

      // Load analytics
      const data = await getSessionAnalytics();
      setAnalytics(data);

      // Load total students from all users
      if (user?.uid) {
        try {
          const studentsSnap = await getDocs(collectionGroup(db, "list"));
          setTotalStudents(studentsSnap.size);
        } catch (err) {
          console.error("Error fetching students:", err);
          setTotalStudents(0);
        }

        // Load question counts for each level
        const levels = ["level-1", "level-2", "level-3"];
        const counts = {};
        for (const level of levels) {
          try {
            const questionsSnap = await getDocs(
              collection(db, "questions", user.uid, level)
            );
            counts[level] = questionsSnap.size;
          } catch (err) {
            console.error(`Error fetching questions for ${level}:`, err);
            counts[level] = 0;
          }
        }
        setQuestionCounts(counts);
      }

      setLoadingAnalytics(false);
    }
    loadData();
  }, [user]);

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
  const gameLevels = [
    { name: "LEVEL 1", level: "level-1", difficulty: "Easy", color: "#FFB6D9" },
    {
      name: "LEVEL 2",
      level: "level-2",
      difficulty: "Medium",
      color: "#B794F6",
    },
    { name: "LEVEL 3", level: "level-3", difficulty: "Hard", color: "#6BAAFF" },
  ];

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
        <div className="dashboard-breadcrumb card">
          <span
            className="material-icons"
            style={{ fontSize: 16, marginRight: 6 }}
          >
            home
          </span>
          Dashboard
        </div>

        <div className="dashboard-welcome-card card">
          <div className="welcome-content">
            <div className="welcome-badge">
              <span className="material-icons">waving_hand</span>
              Welcome Back
            </div>
            <h1>
              Hi, {user?.firstname} {user?.lastname}!
            </h1>
            <p>
              Monitor your multiplication game sessions and track student
              progress with real-time analytics and insights.
            </p>
            <div className="welcome-stats">
              <div
                className="stat-item clickable"
                onClick={() => navigate("/students")}
              >
                <span className="material-icons">school</span>
                <div>
                  <div className="stat-value">{totalStudents}</div>
                  <div className="stat-label">Students</div>
                </div>
              </div>
              <div
                className="stat-item clickable"
                onClick={() => navigate("/reports")}
              >
                <span className="material-icons">emoji_events</span>
                <div>
                  <div className="stat-value">42</div>
                  <div className="stat-label">Sessions</div>
                </div>
              </div>
              <div
                className="stat-item clickable"
                onClick={() => navigate("/reports")}
              >
                <span className="material-icons">trending_up</span>
                <div>
                  <div className="stat-value">87%</div>
                  <div className="stat-label">Avg Score</div>
                </div>
              </div>
            </div>
          </div>
          <div className="welcome-illustration">
            <img src={people} alt="People" className="dashboard-people" />
          </div>
        </div>

        <div className="dashboard-main-row">
          <div className="dashboard-games-section">
            <div className="section-header card">
              <div className="section-title">
                <span className="material-icons">videogame_asset</span>
                <h2>Game Levels</h2>
              </div>
              <div className="section-subtitle">
                Manage and play multiplication games
              </div>
            </div>

            <div className="games-grid">
              {gameLevels.map((level, i) => (
                <div className="game-card card" key={level.name}>
                  <div
                    className="game-card-header"
                    style={{
                      background: `linear-gradient(135deg, ${level.color} 0%, ${level.color}dd 100%)`,
                    }}
                  >
                    <img src={gameIcons[i]} alt="" className="game-icon" />
                    <div className="game-level-info">
                      <div className="game-level-name">{level.name}</div>
                      <div className="game-difficulty">
                        {level.difficulty} Difficulty
                      </div>
                    </div>
                  </div>

                  <div className="game-card-body">
                    <div className="game-stats">
                      <div className="game-stat">
                        <span className="material-icons">quiz</span>
                        <span>{questionCounts[level.level]} Questions</span>
                      </div>
                      <div className="game-stat">
                        <span className="material-icons">people</span>
                        <span>25 Max Players</span>
                      </div>
                    </div>

                    <div className="game-actions">
                      <button
                        className="game-action-btn edit-btn"
                        onClick={() => navigate(`/games/${level.level}/edit`)}
                      >
                        <span className="material-icons">edit</span>
                        <span>Edit</span>
                      </button>
                      <button
                        className="game-action-btn play-btn"
                        onClick={() =>
                          window.open("http://localhost:8081", "_blank")
                        }
                      >
                        <span className="material-icons">play_arrow</span>
                        <span>Play</span>
                      </button>
                      <button
                        className="game-action-btn group-btn"
                        onClick={() => handleGroupPlay(level.name)}
                      >
                        <span className="material-icons">groups</span>
                        <span>Group</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-insights-section">
            <div className="insights-card card">
              <div className="insights-header">
                <div className="insights-title">
                  <img src={insightstone} alt="" className="insights-icon" />
                  <h3>Quick Insights</h3>
                </div>
                <a href="/reports" className="insights-link">
                  View Reports
                  <span className="material-icons">arrow_forward</span>
                </a>
              </div>

              <div className="insights-list">
                {loadingAnalytics ? (
                  <div className="loading-state">
                    <div className="loading-spinner-small"></div>
                    <span>Loading analytics...</span>
                  </div>
                ) : (
                  insights.map((insight) => (
                    <div
                      key={insight.key}
                      className="insight-item"
                      style={{
                        borderLeftColor: insight.borderColor,
                        background: insight.bgColor,
                      }}
                    >
                      <div
                        className="insight-icon-wrapper"
                        style={{ background: insight.borderColor }}
                      >
                        <img
                          src={insight.icon}
                          alt=""
                          className="insight-icon-img"
                        />
                      </div>
                      <div className="insight-content">
                        <div className="insight-title">{insight.title}</div>
                        <div className="insight-desc">{insight.desc}</div>
                        <div
                          className="insight-link"
                          style={{ color: insight.borderColor }}
                        >
                          {insight.link}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        .dashboard-bg {
          min-height: 100vh;
          background: linear-gradient(180deg, #F864D3 0%, #9D7CE8 50%, #6BAAFF 100%);
          padding: 0;
          font-family: 'Poppins', sans-serif;
        }
        
        .dashboard-content {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: 24px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .dashboard-breadcrumb {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #333;
          font-weight: 600;
          padding: 14px 20px;
          margin-bottom: 20px;
        }
        
        .dashboard-welcome-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 40px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
          position: relative;
          overflow: hidden;
          min-height: 280px;
        }
        
        .welcome-content {
          flex: 1;
          z-index: 1;
        }
        
        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #FFB6D9 0%, #FF8DC7 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .welcome-badge .material-icons {
          font-size: 18px;
        }
        
        .welcome-content h1 {
          font-size: 2.5rem;
          color: #333;
          margin-bottom: 12px;
          font-weight: 700;
        }
        
        .welcome-content p {
          color: #666;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 24px;
          max-width: 600px;
        }
        
        .welcome-stats {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
        }
        
        .stat-item.clickable {
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 12px;
          margin: -8px -12px;
        }
        
        .stat-item.clickable:hover {
          background: rgba(157, 124, 232, 0.1);
          transform: translateY(-2px);
        }
        
        .stat-item .material-icons {
          font-size: 40px;
          color: #9D7CE8;
          background: rgba(157, 124, 232, 0.1);
          padding: 8px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .stat-item.clickable:hover .material-icons {
          background: rgba(157, 124, 232, 0.2);
          transform: scale(1.05);
        }
        
        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #333;
          line-height: 1;
        }
        
        .stat-label {
          font-size: 0.85rem;
          color: #888;
          margin-top: 2px;
        }
        
        .welcome-illustration {
          position: relative;
          min-width: 200px;
          height: 200px;
          z-index: 1;
        }
        
        .dashboard-people {
          width: 280px;
          height: auto;
          position: absolute;
          top: -40px;
          right: -40px;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1));
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .dashboard-main-row {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }
        
        .dashboard-games-section {
          flex: 2;
        }
        
        .section-header {
          padding: 20px 28px;
          margin-bottom: 20px;
        }
        
        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .section-title .material-icons {
          font-size: 28px;
          color: #9D7CE8;
        }
        
        .section-title h2 {
          font-size: 1.5rem;
          color: #333;
          font-weight: 700;
          margin: 0;
        }
        
        .section-subtitle {
          color: #888;
          font-size: 0.9rem;
          margin-left: 40px;
        }
        
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .game-card {
          padding: 0;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .game-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
        .game-card-header {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          background: linear-gradient(135deg, #FFB6D9 0%, #FF8DC7 100%);
        }
        
        .game-icon {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.9);
          padding: 10px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .game-level-info {
          color: white;
        }
        
        .game-level-name {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .game-difficulty {
          font-size: 0.85rem;
          opacity: 0.95;
        }
        
        .game-card-body {
          padding: 20px 24px 24px 24px;
        }
        
        .game-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .game-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #666;
        }
        
        .game-stat .material-icons {
          font-size: 18px;
          color: #9D7CE8;
        }
        
        .game-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        
        .game-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 12px 8px;
          border: none;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Poppins', sans-serif;
        }
        
        .game-action-btn .material-icons {
          font-size: 20px;
        }
        
        .edit-btn {
          background: linear-gradient(135deg, #FFB86B 0%, #FFA94D 100%);
          color: white;
        }
        
        .play-btn {
          background: linear-gradient(135deg, #3ECF8E 0%, #2DB77D 100%);
          color: white;
        }
        
        .group-btn {
          background: linear-gradient(135deg, #4FD1FF 0%, #2EB8E6 100%);
          color: white;
        }
        
        .game-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .dashboard-insights-section {
          flex: 1;
          min-width: 360px;
        }
        
        .insights-card {
          position: sticky;
          top: 24px;
        }
        
        .insights-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }
        
        .insights-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .insights-icon {
          width: 32px;
          height: 32px;
        }
        
        .insights-title h3 {
          font-size: 1.3rem;
          color: #333;
          font-weight: 700;
          margin: 0;
        }
        
        .insights-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #9D7CE8;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          transition: color 0.2s;
        }
        
        .insights-link:hover {
          color: #8B6BD8;
        }
        
        .insights-link .material-icons {
          font-size: 16px;
        }
        
        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #888;
          gap: 12px;
        }
        
        .loading-spinner-small {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(157, 124, 232, 0.2);
          border-top-color: #9D7CE8;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .insight-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          border-radius: 12px;
          border-left: 4px solid;
          transition: all 0.2s;
        }
        
        .insight-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .insight-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .insight-icon-img {
          width: 26px;
          height: 26px;
          filter: brightness(0) invert(1);
        }
        
        .insight-content {
          flex: 1;
        }
        
        .insight-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 6px;
          font-size: 0.95rem;
        }
        
        .insight-desc {
          color: #666;
          font-size: 0.85rem;
          margin-bottom: 6px;
          line-height: 1.4;
        }
        
        .insight-link {
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        @media (max-width: 1200px) {
          .dashboard-main-row {
            flex-direction: column;
          }
          
          .dashboard-insights-section {
            min-width: 0;
            width: 100%;
          }
          
          .insights-card {
            position: static;
          }
          
          .games-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-content {
            padding: 16px;
          }
          
          .card {
            padding: 20px;
          }
          
          .dashboard-welcome-card {
            flex-direction: column;
            text-align: center;
            padding: 32px 24px;
            min-height: auto;
          }
          
          .welcome-content h1 {
            font-size: 2rem;
          }
          
          .welcome-content p {
            max-width: 100%;
          }
          
          .welcome-stats {
            justify-content: center;
            gap: 24px;
          }
          
          .welcome-illustration {
            margin-top: 20px;
            height: 150px;
          }
          
          .dashboard-people {
            width: 220px;
            top: -20px;
            right: -20px;
          }
          
          .section-header {
            padding: 16px 20px;
          }
          
          .section-subtitle {
            margin-left: 0;
            margin-top: 8px;
          }
          
          .games-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .welcome-content h1 {
            font-size: 1.6rem;
          }
          
          .welcome-content p {
            font-size: 0.9rem;
          }
          
          .welcome-stats {
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
          
          .stat-item {
            width: 100%;
            justify-content: center;
          }
          
          .dashboard-people {
            width: 180px;
          }
          
          .game-actions {
            grid-template-columns: 1fr;
          }
          
          .insights-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
