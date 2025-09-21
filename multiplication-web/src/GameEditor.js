import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useParams } from "react-router-dom";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const db = getFirestore();
const levels = ["level-1", "level-2", "level-3"];

const levelInfo = {
  "level-1": { title: "LEVEL 1", difficulty: "Easy Difficulty" },
  "level-2": { title: "LEVEL 2", difficulty: "Medium Difficulty" },
  "level-3": { title: "LEVEL 3", difficulty: "Hard Difficulty" },
};

function GameEditor({ user, onLogout }) {
  const { level } = useParams(); // <-- Move this inside the component
  const [selectedLevel, setSelectedLevel] = useState(levels.includes(level) ? level : levels[0]);
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [numA, setNumA] = useState("");
  const [numB, setNumB] = useState("");
  const [manualMultipleChoice, setManualMultipleChoice] = useState(true);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [singleAnswer, setSingleAnswer] = useState("");
  const [error, setError] = useState("");

  // Generator state
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [genCount, setGenCount] = useState("");
  const [genReverse, setGenReverse] = useState(false);
  const [genMultipleChoice, setGenMultipleChoice] = useState(true);
  const [genAvoidDuplicates, setGenAvoidDuplicates] = useState(true);

  const maxQuestions = 20;

  // Loading and saved state
  const [loading, setLoading] = useState(false);
  const [showSavedPopup, setShowSavedPopup] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      if (!user?.uid) return;
      const qSnap = await getDocs(collection(db, "questions", user.uid, selectedLevel));
      const loaded = [];
      qSnap.forEach(doc => loaded.push(doc.data()));
      setQuestions(loaded);
    }
    fetchQuestions();
  }, [user, selectedLevel]);

  function handleOptionChange(idx, value) {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  }

  function handleAddQuestion() {
    setError("");
    if (questions.length >= maxQuestions) {
      setError("Maximum 20 questions allowed.");
      return;
    }
    if ((questionText && (numA || numB)) || (!questionText && (!numA || !numB))) {
      setError("Enter either a question text OR two numbers to multiply.");
      return;
    }
    let qText = questionText;
    if (!qText) {
      qText = `What is ${numA} x ${numB}?`;
    }
    if (manualMultipleChoice) {
      if (options.some(opt => !opt)) {
        setError("All 4 options are required.");
        return;
      }
      if (correctIndex === null) {
        setError("Select the correct answer.");
        return;
      }
      setQuestions([
        ...questions,
        {
          question: qText,
          options: [...options],
          correct: correctIndex,
          answer: options[correctIndex]
        }
      ]);
    } else {
      if (!singleAnswer) {
        setError("Please enter the correct answer.");
        return;
      }
      setQuestions([
        ...questions,
        {
          question: qText,
          options: [singleAnswer],
          correct: 0,
          answer: singleAnswer
        }
      ]);
    }
    // Reset form
    setQuestionText("");
    setNumA("");
    setNumB("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(null);
    setSingleAnswer("");
  }

  function handleClear() {
    setQuestionText("");
    setNumA("");
    setNumB("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(null);
    setSingleAnswer("");
    setError("");
  }

  function handleDelete(idx) {
    setQuestions(questions.filter((_, i) => i !== idx));
  }

  function handleGenerateQuestions() {
    setError("");
    let start = parseInt(rangeStart, 10);
    let end = parseInt(rangeEnd, 10);
    let count = parseInt(genCount, 10);

    if (isNaN(start) || isNaN(end) || isNaN(count) || start < 0 || end < start || count < 1) {
      setError("Please enter valid number range and question count.");
      return;
    }

    let pairs = [];
    for (let a = start; a <= end; a++) {
      for (let b = start; b <= end; b++) {
        if (!genReverse && a > b) continue;
        pairs.push([a, b]);
      }
    }

    if (genAvoidDuplicates) {
      pairs = Array.from(new Set(pairs.map(pair => pair.join(",")))).map(str => str.split(",").map(Number));
    }

    // Shuffle pairs
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    let newQuestions = [];
    let usedPairs = new Set();

    for (let i = 0; i < pairs.length && newQuestions.length < count && questions.length + newQuestions.length < maxQuestions; i++) {
      const [a, b] = pairs[i];
      const key = genReverse ? `${a},${b}` : `${Math.min(a, b)},${Math.max(a, b)}`;
      if (genAvoidDuplicates && usedPairs.has(key)) continue;
      usedPairs.add(key);

      const correctAnswer = a * b;
      let qText = `What is ${a} x ${b}?`;

      if (genMultipleChoice) {
        let wrongs = new Set();
        while (wrongs.size < 3) {
          let wrong = correctAnswer + Math.floor(Math.random() * 10) - 5;
          if (wrong !== correctAnswer && wrong > 0) wrongs.add(wrong);
        }
        let optionsArr = Array.from(wrongs);
        const correctPos = Math.floor(Math.random() * 4);
        optionsArr.splice(correctPos, 0, correctAnswer);

        newQuestions.push({
          question: qText,
          options: optionsArr.map(String),
          correct: correctPos,
          answer: optionsArr[correctPos].toString()
        });
      } else {
        newQuestions.push({
          question: qText,
          options: [correctAnswer.toString()],
          correct: 0,
          answer: correctAnswer.toString()
        });
      }
    }

    setQuestions([...questions, ...newQuestions]);
  }

  async function handleSave() {
    if (questions.length === 0) {
      setError("No questions to save.");
      return;
    }
    
    if (!user?.uid) {
      setError("User not authenticated. Please log in again.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      console.log("Saving questions for user:", user.uid, "level:", selectedLevel);
      
      // Clear existing questions first
      const existingSnap = await getDocs(collection(db, "questions", user.uid, selectedLevel));
      const deletePromises = existingSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Save new questions
      const savePromises = questions.map(q => 
        addDoc(collection(db, "questions", user.uid, selectedLevel), {
          question: q.question,
          options: q.options,
          correct: q.correct,
          answer: q.answer,
          type: q.options.length === 4 ? "multipleChoice" : "singleAnswer",
          createdAt: new Date().toISOString(),
        })
      );
      
      await Promise.all(savePromises);
      
      console.log("Questions saved successfully");
      setLoading(false);
      setShowSavedPopup(true);
      setTimeout(() => setShowSavedPopup(false), 1800);
      
      // Reload questions after save
      const qSnap = await getDocs(collection(db, "questions", user.uid, selectedLevel));
      const loaded = [];
      qSnap.forEach(doc => {
        loaded.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setQuestions(loaded);
      
    } catch (err) {
      console.error("Error saving questions:", err);
      setLoading(false);
      setError("Failed to save questions: " + err.message);
    }
  }

  return (
    <div className="game-editor-bg">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Saving...</div>
        </div>
      )}
      {showSavedPopup && (
        <div className="saved-popup">
          <span className="material-icons" style={{ fontSize: 38, color: "#19d419", marginRight: 8 }}>check_circle</span>
          Questions Saved!
        </div>
      )}
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
            <div style={{ fontWeight: 700, fontSize: 22 }}>
              {levelInfo[selectedLevel].title}
            </div>
            <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
              Basic Multiplication - {levelInfo[selectedLevel].difficulty}
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
              <span style={{ float: "right", color: "#888", fontWeight: 400, fontSize: 15 }}>{questions.length} / {maxQuestions} Questions</span>
            </div>
            <div className="game-editor-form">
              <div className="game-editor-form-row">
                <label>Question Text</label>
                <input
                  className="game-editor-input"
                  placeholder="e.g., What is 3 x 4?"
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  disabled={!!numA || !!numB}
                />
              </div>
              <div className="game-editor-form-or">Or Build Visually</div>
              <div className="game-editor-form-row" style={{ gap: 12 }}>
                <input
                  className="game-editor-input"
                  style={{ width: 80 }}
                  type="number"
                  placeholder="Num A"
                  value={numA}
                  onChange={e => setNumA(e.target.value)}
                  disabled={!!questionText}
                />
                <span style={{ fontWeight: 700, fontSize: 22 }}>X</span>
                <input
                  className="game-editor-input"
                  style={{ width: 80 }}
                  type="number"
                  placeholder="Num B"
                  value={numB}
                  onChange={e => setNumB(e.target.value)}
                  disabled={!!questionText}
                />
              </div>
              <div className="game-editor-form-row" style={{ marginTop: 18 }}>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={manualMultipleChoice}
                      onChange={e => setManualMultipleChoice(e.target.checked)}
                      style={{ marginRight: 6 }}
                    />
                    Multiple Choice
                  </label>
                </div>
                {manualMultipleChoice ? (
                  <div className="game-editor-options">
                    {["A", "B", "C", "D"].map((label, idx) => (
                      <div key={label} className="game-editor-option-row">
                        <input
                          type="radio"
                          name="option"
                          checked={correctIndex === idx}
                          onChange={() => setCorrectIndex(idx)}
                          disabled={!options[idx]}
                        /> {label}
                        <input
                          className="game-editor-input"
                          placeholder={`Option ${label}`}
                          value={options[idx]}
                          onChange={e => handleOptionChange(idx, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="game-editor-form-row" style={{ marginTop: 8 }}>
                    <label>Correct Answer</label>
                    <input
                      className="game-editor-input"
                      placeholder="Enter correct answer"
                      value={singleAnswer}
                      onChange={e => setSingleAnswer(e.target.value)}
                    />
                  </div>
                )}
              </div>
              {error && <div style={{ color: "red", fontSize: 13, marginTop: 8 }}>{error}</div>}
              <div className="game-editor-form-actions">
                <button className="game-editor-clear-btn" type="button" onClick={handleClear}>
                  <span className="material-icons">delete</span> Clear
                </button>
                <button className="game-editor-add-btn" type="button" onClick={handleAddQuestion}>
                  <span className="material-icons">add</span> Add question
                </button>
              </div>
            </div>
            <hr style={{ margin: "32px 0 18px 0", border: "none", borderTop: "1.5px solid #eee" }} />
            <div className="game-editor_current-title">
              <span className="material-icons" style={{ verticalAlign: "middle", marginRight: 8, color: "#444" }}>description</span>
              Current Questions
            </div>
            <div className="game-editor-current-list">
              {questions.map((q, i) => (
                <div className="game-editor-current-card" key={i}>
                  <div className="game-editor-current-q">{q.question}</div>
                  <div className="game-editor-current-a"><b>Answer:</b> {q.answer}</div>
                  <div className="game-editor-current-actions">
                    <button className="game-editor-delete-btn" onClick={() => handleDelete(i)}>
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13 }}>
                    Options: {q.options.map((opt, idx) => (
                      <span key={idx} style={{ marginRight: 8 }}>
                        <b>{String.fromCharCode(65 + idx)}:</b> {opt}
                        {idx === q.correct ? " (Correct)" : ""}
                      </span>
                    ))}
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
                    <input
                      className="game-editor-input"
                      style={{ width: 60 }}
                      type="number"
                      value={rangeStart}
                      onChange={e => setRangeStart(e.target.value)}
                      placeholder="Start"
                    />
                    <span style={{ alignSelf: "center" }}>to</span>
                    <input
                      className="game-editor-input"
                      style={{ width: 60 }}
                      type="number"
                      value={rangeEnd}
                      onChange={e => setRangeEnd(e.target.value)}
                      placeholder="End"
                    />
                    <span className="material-icons" style={{ color: "#bbb", marginLeft: 4, alignSelf: "center" }}>help_outline</span>
                  </div>
                </div>
                <div className="game-editor-form-row" style={{ marginTop: 10 }}>
                  <label>Generate Options</label>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        checked={genReverse}
                        onChange={e => setGenReverse(e.target.checked)}
                      /> Include reverse (e.g., 3×2 and 2×3)
                    </label><br />
                    <label>
                      <input
                        type="checkbox"
                        checked={genMultipleChoice}
                        onChange={e => setGenMultipleChoice(e.target.checked)}
                      /> Add multiple choice options
                    </label><br />
                    <label>
                      <input
                        type="checkbox"
                        checked={genAvoidDuplicates}
                        onChange={e => setGenAvoidDuplicates(e.target.checked)}
                      /> Avoid duplicates
                    </label>
                  </div>
                </div>
                <div className="game-editor-form-row" style={{ marginTop: 10 }}>
                  <label>How many questions?</label>
                  <input
                    className="game-editor-input"
                    style={{ width: 120 }}
                    type="number"
                    value={genCount}
                    onChange={e => setGenCount(e.target.value)}
                    placeholder="e.g. 10"
                  />
                </div>
                <button className="game-editor-generate-btn" type="button" onClick={handleGenerateQuestions}>
                  Generate
                </button>
              </div>
            </div>
            <div className="game-editor-side-actions card">
              <button className="game-editor-discard-btn" onClick={() => setQuestions([])}>
                <span className="material-icons">undo</span> Discard
              </button>
              <button className="game-editor-save-btn" onClick={handleSave}>
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
          flex-wrap: wrap;
          gap: 18px;
        }
        .game-editor-option-row {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 160px;
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
        .game-editor_current-title {
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
        .loading-overlay {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(255,255,255,0.7);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .loading-spinner {
          border: 6px solid #eee;
          border-top: 6px solid #19d419;
          border-radius: 50%;
          width: 54px;
          height: 54px;
          animation: spin 1s linear infinite;
          margin-bottom: 18px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        .loading-text {
          font-size: 20px;
          color: #19d419;
          font-weight: 600;
        }
        .saved-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(1);
          background: #fff;
          color: #19d419;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(25,212,25,0.12);
          padding: 28px 44px;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          z-index: 10000;
          animation: popup-bounce 0.5s;
        }
        @keyframes popup-bounce {
          0% { transform: translate(-50%, -50%) scale(0.7);}
          60% { transform: translate(-50%, -50%) scale(1.1);}
          100% { transform: translate(-50%, -50%) scale(1);}
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