import React from "react";
import Header from "./Header";

function GameEditor({ user, onLogout }) {
  return (
    <div className="game-editor-bg">
      <Header user={user} onLogout={onLogout} />
      <div className="game-editor-content">
        <div className="game-editor-breadcrumb card">
          <span>Dashboard</span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>{'>'}</span>
          <span>Games</span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>{'>'}</span>
          <span>Level 1</span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>{'>'}</span>
          <span style={{ color: "#888" }}>Question Editor</span>
        </div>
        <div className="game-editor-header-row">
          <div className="game-editor-level-card card">
            <div style={{ fontWeight: 700, fontSize: 22 }}>LEVEL 1</div>
            <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
              Basic Multiplication - Easy Difficulty
            </div>
          </div>
          <button className="game-editor-testplay-btn card">
            <span className="material-icons" style={{ verticalAlign: "middle", marginRight: 6, color: "#ffb300" }}>sports_esports</span>
            Test Play
          </button>
        </div>
        <div className="game-editor-main-row">
          <div className="game-editor-main-col card">
            <div className="game-editor-section-title">
              <span className="material-icons" style={{ verticalAlign: "middle", marginRight: 8, color: "#888" }}>edit</span>
              Question Editor
              <span style={{ float: "right", color: "#888", fontWeight: 400, fontSize: 15 }}>4 Questions</span>
            </div>
            <div className="game-editor-form">
              <div className="game-editor-form-row">
                <label>Question Text</label>
                <input className="game-editor-input" placeholder="e.g., What is 3 x 4?" />
              </div>
              <div className="game-editor-form-or">Or Build Visually</div>
              <div className="game-editor-form-row" style={{ gap: 12 }}>
                <input className="game-editor-input" style={{ width: 80 }} />
                <span style={{ fontWeight: 700, fontSize: 22 }}>X</span>
                <input className="game-editor-input" style={{ width: 80 }} />
              </div>
              <div className="game-editor-form-row" style={{ marginTop: 18 }}>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>Multiple Choice Options (4 Required)</div>
                <div className="game-editor-options">
                  <div>
                    <input type="radio" name="option" /> A
                    <input className="game-editor-input" placeholder="Option A" />
                  </div>
                  <div>
                    <input type="radio" name="option" /> B
                    <input className="game-editor-input" placeholder="Option B" />
                  </div>
                  <div>
                    <input type="radio" name="option" /> C
                    <input className="game-editor-input" placeholder="Option C" />
                  </div>
                  <div>
                    <input type="radio" name="option" /> D
                    <input className="game-editor-input" placeholder="Option D" />
                  </div>
                </div>
              </div>
              <div className="game-editor-form-actions">
                <button className="game-editor-clear-btn">
                  <span className="material-icons">delete</span> Clear
                </button>
                <button className="game-editor-add-btn">
                  <span className="material-icons">add</span> Add question
                </button>
              </div>
            </div>
            <hr style={{ margin: "32px 0 18px 0", border: "none", borderTop: "1.5px solid #eee" }} />
            <div className="game-editor-current-title">
              <span className="material-icons" style={{ verticalAlign: "middle", marginRight: 8, color: "#444" }}>description</span>
              Current Questions
            </div>
            <div className="game-editor-current-list">
              {[1, 2, 3, 4].map(i => (
                <div className="game-editor-current-card" key={i}>
                  <div className="game-editor-current-q">What is 3 x 4?</div>
                  <div className="game-editor-current-a"><b>Answer:</b> 12</div>
                  <div className="game-editor-current-actions">
                    <button className="game-editor-edit-btn"><span className="material-icons">edit</span></button>
                    <button className="game-editor-delete-btn"><span className="material-icons">delete</span></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="game-editor-side-col">
            <div className="game-editor-side-card card">
              <div className="game-editor-side-title">
                <span className="material-icons" style={{ verticalAlign: "middle", marginRight: 8 }}>smart_toy</span>
                AI Question Generator
              </div>
              <div className="game-editor-side-form">
                <div className="game-editor-form-row">
                  <label>Number Range</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="game-editor-input" style={{ width: 60 }} />
                    <span style={{ alignSelf: "center" }}>to</span>
                    <input className="game-editor-input" style={{ width: 60 }} />
                    <span className="material-icons" style={{ color: "#bbb", marginLeft: 4, alignSelf: "center" }}>help_outline</span>
                  </div>
                </div>
                <div className="game-editor-form-row" style={{ marginTop: 10 }}>
                  <label>Generate Options</label>
                  <div>
                    <label><input type="checkbox" /> Include reverse (e.g., 3×2 and 2×3)</label><br />
                    <label><input type="checkbox" /> Add multiple choice options</label><br />
                    <label><input type="checkbox" /> Avoid duplicates</label>
                  </div>
                </div>
                <div className="game-editor-form-row" style={{ marginTop: 10 }}>
                  <label>How many questions?</label>
                  <input className="game-editor-input" style={{ width: 120 }} />
                </div>
                <button className="game-editor-generate-btn">Generate</button>
              </div>
            </div>
            <div className="game-editor-side-actions card">
              <button className="game-editor-discard-btn">
                <span className="material-icons">undo</span> Discard
              </button>
              <button className="game-editor-save-btn">
                <span className="material-icons">check_circle</span> Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        .game-editor-bg {
          min-height: 100vh;
          background: #EAEAEA;
          padding: 0;
        }
        .game-editor-content {
          padding: 32px 24px 24px 24px;
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
        .game-editor-breadcrumb {
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
        .game-editor-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .game-editor-level-card {
          display: inline-block;
          min-width: 220px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          padding: 16px 24px;
        }
        .game-editor-testplay-btn {
          background: #fff;
          color: #ffb300;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          padding: 12px 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .game-editor-main-row {
          display: flex;
          gap: 24px;
        }
        .game-editor-main-col {
          flex: 2.2;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .game-editor-section-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 18px;
          color: #222;
          display: flex;
          align-items: center;
        }
        .game-editor-form {
          margin-bottom: 18px;
        }
        .game-editor-form-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
        }
        .game-editor-form-or {
          color: #888;
          font-size: 13px;
          margin: 8px 0 8px 0;
          font-weight: 500;
        }
        .game-editor-input {
          border: 1.5px solid #e0e0e0;
          border-radius: 7px;
          padding: 7px 14px;
          font-size: 15px;
          background: #fafbfc;
          color: #444;
          margin-top: 4px;
        }
        .game-editor-options {
          display: flex;
          gap: 18px;
        }
        .game-editor-options > div {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .game-editor-form-actions {
          display: flex;
          gap: 14px;
          margin-top: 18px;
        }
        .game-editor-clear-btn {
          background: #ff4444;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .game-editor-add-btn {
          background: #19d419;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .game-editor-current-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
        }
        .game-editor-current-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .game-editor-current-card {
          background: #fff;
          border: 2px solid #ffb300;
          border-radius: 12px;
          padding: 18px 18px 12px 18px;
          margin-bottom: 0;
          box-shadow: 0 2px 8px rgba(255,179,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .game-editor-current-q {
          font-size: 1.1rem;
          font-weight: 500;
          color: #222;
        }
        .game-editor-current-a {
          font-size: 13px;
          color: #444;
        }
        .game-editor-current-actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        .game-editor-edit-btn {
          background: #ffb300;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 16px;
          cursor: pointer;
        }
        .game-editor-delete-btn {
          background: #ff4444;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 16px;
          cursor: pointer;
        }
        .game-editor-side-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-width: 340px;
        }
        .game-editor-side-card {
          margin-bottom: 0;
        }
        .game-editor-side-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
        }
        .game-editor-side-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .game-editor-generate-btn {
          background: #19d419;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
        }
        .game-editor-side-actions {
          display: flex;
          gap: 18px;
          margin-top: 18px;
        }
        .game-editor-discard-btn {
          background: #eee;
          color: #444;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .game-editor-save-btn {
          background: #19d419;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        @media (max-width: 1100px) {
          .game-editor-main-row {
            flex-direction: column;
          }
          .game-editor-side-col {
            min-width: 0;
            margin-top: 24px;
          }
          .game-editor-current-list {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 700px) {
          .game-editor-content {
            padding: 10px 2vw;
          }
          .card {
            padding: 12px 6px;
          }
        }
      `}</style>
    </div>
  );
}

export default GameEditor;