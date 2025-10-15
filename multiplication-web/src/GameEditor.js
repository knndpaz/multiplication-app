import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const db = getFirestore();
const levels = ["level-1", "level-2", "level-3"];

const levelInfo = {
  "level-1": { title: "LEVEL 1", difficulty: "Easy Difficulty" },
  "level-2": { title: "LEVEL 2", difficulty: "Medium Difficulty" },
  "level-3": { title: "LEVEL 3", difficulty: "Hard Difficulty" },
};

function GameEditor({ user, onLogout }) {
  const { level } = useParams();
  const [selectedLevel, setSelectedLevel] = useState(
    levels.includes(level) ? level : levels[0]
  );
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [numA, setNumA] = useState("");
  const [numB, setNumB] = useState("");
  const [manualMultipleChoice, setManualMultipleChoice] = useState(true);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [singleAnswer, setSingleAnswer] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [globalTimeLimit, setGlobalTimeLimit] = useState(30);
  const [error, setError] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

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
      const qSnap = await getDocs(
        collection(db, "questions", user.uid, selectedLevel)
      );
      const loaded = [];
      qSnap.forEach((doc) =>
        loaded.push({
          ...doc.data(),
          locked: doc.data().locked || false,
          timeLimit: doc.data().timeLimit || 30,
        })
      );
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
    if (questions.length >= maxQuestions && editingIndex === null) {
      setError("Maximum 20 questions allowed.");
      return;
    }
    if (
      (questionText && (numA || numB)) ||
      (!questionText && (!numA || !numB))
    ) {
      setError("Enter either a question text OR two numbers to multiply.");
      return;
    }
    let qText = questionText;
    if (!qText) {
      qText = `What is ${numA} x ${numB}?`;
    }

    let newQuestion;
    if (manualMultipleChoice) {
      if (options.some((opt) => !opt)) {
        setError("All 4 options are required.");
        return;
      }
      if (correctIndex === null) {
        setError("Select the correct answer.");
        return;
      }
      newQuestion = {
        question: qText,
        options: [...options],
        correct: correctIndex,
        answer: options[correctIndex],
        timeLimit: timeLimit,
        locked: false,
      };
    } else {
      if (!singleAnswer) {
        setError("Please enter the correct answer.");
        return;
      }
      newQuestion = {
        question: qText,
        options: [singleAnswer],
        correct: 0,
        answer: singleAnswer,
        timeLimit: timeLimit,
        locked: false,
      };
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = {
        ...newQuestion,
        locked: updatedQuestions[editingIndex].locked,
      };
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, newQuestion]);
    }

    // Reset form
    handleClear();
  }

  function handleClear() {
    setQuestionText("");
    setNumA("");
    setNumB("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(null);
    setSingleAnswer("");
    setTimeLimit(30);
    setError("");
    setEditingIndex(null);
  }

  function handleEdit(idx) {
    const q = questions[idx];
    setQuestionText(q.question);
    setManualMultipleChoice(q.options.length === 4);
    if (q.options.length === 4) {
      setOptions(q.options);
      setCorrectIndex(q.correct);
    } else {
      setSingleAnswer(q.answer);
    }
    setTimeLimit(q.timeLimit || 30);
    setEditingIndex(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(idx) {
    if (questions[idx].locked) {
      setError("Cannot delete a locked question. Unlock it first.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  }

  function handleToggleLock(idx) {
    const updatedQuestions = [...questions];
    updatedQuestions[idx].locked = !updatedQuestions[idx].locked;
    setQuestions(updatedQuestions);
  }

  function handleClearAll() {
    const unlockedQuestions = questions.filter((q) => !q.locked);
    if (unlockedQuestions.length === 0) {
      setError("No unlocked questions to clear.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to clear ${unlockedQuestions.length} unlocked question(s)? Locked questions will be kept.`
      )
    ) {
      setQuestions(questions.filter((q) => q.locked));
    }
  }

  function handleApplyGlobalTime() {
    const updatedQuestions = questions.map((q) => ({
      ...q,
      timeLimit: globalTimeLimit,
    }));
    setQuestions(updatedQuestions);
  }

  function handleGenerateQuestions() {
    setError("");
    let start = parseInt(rangeStart, 10);
    let end = parseInt(rangeEnd, 10);
    let count = parseInt(genCount, 10);

    if (
      isNaN(start) ||
      isNaN(end) ||
      isNaN(count) ||
      start < 0 ||
      end < start ||
      count < 1
    ) {
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
      pairs = Array.from(new Set(pairs.map((pair) => pair.join(",")))).map(
        (str) => str.split(",").map(Number)
      );
    }

    // Shuffle pairs
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    let newQuestions = [];
    let usedPairs = new Set();

    for (
      let i = 0;
      i < pairs.length &&
      newQuestions.length < count &&
      questions.length + newQuestions.length < maxQuestions;
      i++
    ) {
      const [a, b] = pairs[i];
      const key = genReverse
        ? `${a},${b}`
        : `${Math.min(a, b)},${Math.max(a, b)}`;
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
          answer: optionsArr[correctPos].toString(),
          timeLimit: globalTimeLimit,
          locked: false,
        });
      } else {
        newQuestions.push({
          question: qText,
          options: [correctAnswer.toString()],
          correct: 0,
          answer: correctAnswer.toString(),
          timeLimit: globalTimeLimit,
          locked: false,
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
      const existingSnap = await getDocs(
        collection(db, "questions", user.uid, selectedLevel)
      );
      const deletePromises = existingSnap.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      const savePromises = questions.map((q) =>
        addDoc(collection(db, "questions", user.uid, selectedLevel), {
          question: q.question,
          options: q.options,
          correct: q.correct,
          answer: q.answer,
          timeLimit: q.timeLimit || 30,
          locked: q.locked || false,
          type: q.options.length === 4 ? "multipleChoice" : "singleAnswer",
          createdAt: new Date().toISOString(),
        })
      );

      await Promise.all(savePromises);

      setLoading(false);
      setShowSavedPopup(true);
      setTimeout(() => setShowSavedPopup(false), 1800);

      const qSnap = await getDocs(
        collection(db, "questions", user.uid, selectedLevel)
      );
      const loaded = [];
      qSnap.forEach((doc) => {
        loaded.push({
          id: doc.id,
          ...doc.data(),
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
          <span
            className="material-icons"
            style={{ fontSize: 38, color: "#4CAF50", marginRight: 8 }}
          >
            check_circle
          </span>
          Questions Saved!
        </div>
      )}
      <Header user={user} onLogout={onLogout} />
      <div className="game-editor-content">
        <div className="game-editor-breadcrumb card">
          <span>Dashboard</span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>{">"}</span>
          <span>Games</span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>{">"}</span>
          <span>{levelInfo[selectedLevel].title}</span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>{">"}</span>
          <span style={{ color: "#888" }}>Question Editor</span>
        </div>
        <div className="game-editor-header-row">
          <div className="game-editor-level-card card">
            <div style={{ fontWeight: 700, fontSize: 22, color: "white" }}>
              {levelInfo[selectedLevel].title}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: 13,
                marginTop: 2,
              }}
            >
              Basic Multiplication - {levelInfo[selectedLevel].difficulty}
            </div>
          </div>
          <button className="game-editor-testplay-btn card">
            <span
              className="material-icons"
              style={{ verticalAlign: "middle", marginRight: 6 }}
            >
              sports_esports
            </span>
            Test Play
          </button>
        </div>
        <div className="game-editor-main-row">
          <div className="game-editor-main-col card">
            <div className="game-editor-section-title">
              <span
                className="material-icons"
                style={{ verticalAlign: "middle", marginRight: 8 }}
              >
                edit
              </span>
              {editingIndex !== null ? "Edit Question" : "Question Editor"}
              <span
                style={{
                  marginLeft: "auto",
                  color: "#888",
                  fontWeight: 400,
                  fontSize: 15,
                }}
              >
                {questions.length} / {maxQuestions} Questions
              </span>
            </div>
            <div className="game-editor-form">
              <div className="game-editor-form-row">
                <label>Question Text</label>
                <input
                  className="game-editor-input"
                  placeholder="e.g., What is 3 x 4?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  disabled={!!numA || !!numB}
                />
              </div>
              <div className="game-editor-form-or">Or Build Visually</div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <input
                  className="game-editor-input"
                  style={{ width: 140, marginTop: 0 }}
                  type="number"
                  placeholder="Num A"
                  value={numA}
                  onChange={(e) => setNumA(e.target.value)}
                  disabled={!!questionText}
                />
                <span
                  style={{ fontWeight: 700, fontSize: 22, color: "#9D7CE8" }}
                >
                  ×
                </span>
                <input
                  className="game-editor-input"
                  style={{ width: 140, marginTop: 0 }}
                  type="number"
                  placeholder="Num B"
                  value={numB}
                  onChange={(e) => setNumB(e.target.value)}
                  disabled={!!questionText}
                />
              </div>
              <div className="game-editor-form-row" style={{ marginTop: 18 }}>
                <label>Time Limit (seconds)</label>
                <input
                  className="game-editor-input"
                  style={{ width: 120 }}
                  type="number"
                  min="5"
                  max="300"
                  placeholder="30"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                />
              </div>
              <div className="game-editor-form-row" style={{ marginTop: 18 }}>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={manualMultipleChoice}
                      onChange={(e) =>
                        setManualMultipleChoice(e.target.checked)
                      }
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
                        />{" "}
                        <span style={{ fontWeight: 600 }}>{label}</span>
                        <input
                          className="game-editor-input"
                          style={{ marginTop: 0 }}
                          placeholder={`Option ${label}`}
                          value={options[idx]}
                          onChange={(e) =>
                            handleOptionChange(idx, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="game-editor-form-row"
                    style={{ marginTop: 8 }}
                  >
                    <label>Correct Answer</label>
                    <input
                      className="game-editor-input"
                      placeholder="Enter correct answer"
                      value={singleAnswer}
                      onChange={(e) => setSingleAnswer(e.target.value)}
                    />
                  </div>
                )}
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="game-editor-form-actions">
                <button
                  className="game-editor-clear-btn"
                  type="button"
                  onClick={handleClear}
                >
                  <span className="material-icons">close</span>{" "}
                  {editingIndex !== null ? "Cancel" : "Clear"}
                </button>
                <button
                  className="game-editor-add-btn"
                  type="button"
                  onClick={handleAddQuestion}
                >
                  <span className="material-icons">
                    {editingIndex !== null ? "save" : "add"}
                  </span>
                  {editingIndex !== null ? "Update Question" : "Add Question"}
                </button>
              </div>
            </div>
            <hr
              style={{
                margin: "32px 0 18px 0",
                border: "none",
                borderTop: "1.5px solid #eee",
              }}
            />
            <div className="game-editor_current-title">
              <span
                className="material-icons"
                style={{ verticalAlign: "middle", marginRight: 8 }}
              >
                description
              </span>
              Current Questions
              <button className="clear-all-btn" onClick={handleClearAll}>
                <span className="material-icons">delete_sweep</span> Clear All
              </button>
            </div>
            <div className="game-editor-current-list">
              {questions.map((q, i) => (
                <div
                  className={`game-editor-current-card ${
                    q.locked ? "locked" : ""
                  }`}
                  key={i}
                >
                  <div className="question-header">
                    <div className="question-number">Q{i + 1}</div>
                    <div className="time-badge">
                      <span className="material-icons" style={{ fontSize: 14 }}>
                        timer
                      </span>
                      {q.timeLimit || 30}s
                    </div>
                  </div>
                  <div className="game-editor-current-q">{q.question}</div>
                  <div className="game-editor-current-a">
                    <b>Answer:</b> {q.answer}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
                    {q.options.map((opt, idx) => (
                      <span
                        key={idx}
                        style={{ marginRight: 8, display: "inline-block" }}
                      >
                        <b>{String.fromCharCode(65 + idx)}:</b> {opt}
                        {idx === q.correct && (
                          <span style={{ color: "#4CAF50" }}> ✓</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="game-editor-current-actions">
                    <button
                      className="action-btn lock-btn"
                      onClick={() => handleToggleLock(i)}
                      title={q.locked ? "Unlock" : "Lock"}
                    >
                      <span className="material-icons">
                        {q.locked ? "lock" : "lock_open"}
                      </span>
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(i)}
                      disabled={q.locked}
                      title="Edit"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(i)}
                      disabled={q.locked}
                      title="Delete"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="game-editor-side-col">
            <div className="game-editor-side-card card global-time-card">
              <div className="game-editor-side-title">
                <span
                  className="material-icons"
                  style={{ verticalAlign: "middle", marginRight: 8 }}
                >
                  schedule
                </span>
                Global Time Settings
              </div>
              <div className="game-editor-side-form">
                <div className="game-editor-form-row">
                  <label>Set time for all questions (seconds)</label>
                  <input
                    className="game-editor-input"
                    style={{ width: 120 }}
                    type="number"
                    min="5"
                    max="300"
                    value={globalTimeLimit}
                    onChange={(e) =>
                      setGlobalTimeLimit(parseInt(e.target.value) || 30)
                    }
                  />
                </div>
                <button
                  className="apply-global-btn"
                  type="button"
                  onClick={handleApplyGlobalTime}
                >
                  <span className="material-icons">update</span> Apply to All
                  Questions
                </button>
              </div>
            </div>
            <div className="game-editor-side-card card">
              <div className="game-editor-side-title">
                <span
                  className="material-icons"
                  style={{ verticalAlign: "middle", marginRight: 8 }}
                >
                  smart_toy
                </span>
                AI Question Generator
              </div>
              <div className="game-editor-side-form">
                <div className="game-editor-form-row">
                  <label>Number Range</label>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <input
                      className="game-editor-input"
                      style={{ width: 120 }}
                      type="number"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      placeholder="Start"
                    />
                    <span>to</span>
                    <input
                      className="game-editor-input"
                      style={{ width: 120 }}
                      type="number"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      placeholder="End"
                    />
                  </div>
                </div>
                <div className="game-editor-form-row" style={{ marginTop: 10 }}>
                  <label>Generate Options</label>
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={genReverse}
                        onChange={(e) => setGenReverse(e.target.checked)}
                      />{" "}
                      Include reverse (e.g., 3×2 and 2×3)
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={genMultipleChoice}
                        onChange={(e) => setGenMultipleChoice(e.target.checked)}
                      />{" "}
                      Add multiple choice options
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={genAvoidDuplicates}
                        onChange={(e) =>
                          setGenAvoidDuplicates(e.target.checked)
                        }
                      />{" "}
                      Avoid duplicates
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
                    onChange={(e) => setGenCount(e.target.value)}
                    placeholder="e.g. 10"
                  />
                </div>
                <button
                  className="game-editor-generate-btn"
                  type="button"
                  onClick={handleGenerateQuestions}
                >
                  <span className="material-icons">auto_awesome</span> Generate
                </button>
              </div>
            </div>
            <div className="game-editor-side-actions card">
              <button
                className="game-editor-discard-btn"
                onClick={() => setQuestions([])}
              >
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
        
        * {
          box-sizing: border-box;
        }
        
        .game-editor-bg {
          min-height: 100vh;
          background: linear-gradient(180deg, #F864D3 0%, #9D7CE8 50%, #6BAAFF 100%);
          padding: 0;
        }
        
        .game-editor-content {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          padding: 24px;
          margin-bottom: 20px;
        }
        
        .game-editor-breadcrumb {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #444;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          font-weight: 500;
          padding: 14px 20px;
        }
        
        .game-editor-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .game-editor-level-card {
          flex: 1;
          min-width: 220px;
          background: linear-gradient(135deg, #9D7CE8 0%, #B794F6 100%);
          color: white;
          padding: 20px 28px;
        }
        
        .game-editor-testplay-btn {
          background: linear-gradient(135deg, #FFB6D9 0%, #FF8DC7 100%);
          color: white;
          border: none;
          font-size: 16px;
          font-weight: 600;
          padding: 14px 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: transform 0.2s;
        }
        
        .game-editor-testplay-btn:hover {
          transform: translateY(-2px);
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
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: #333;
          display: flex;
          align-items: center;
        }
        
        .game-editor-form {
          margin-bottom: 20px;
        }
        
        .game-editor-form-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 14px;
        }
        
        .game-editor-form-row label {
          font-weight: 600;
          color: #555;
          margin-bottom: 6px;
          font-size: 14px;
        }
        
        .game-editor-form-or {
          color: #888;
          font-size: 13px;
          margin: 12px 0;
          font-weight: 500;
          text-align: center;
        }
        
        .game-editor-input {
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 15px;
          background: #fafbfc;
          color: #444;
          transition: border 0.2s;
          margin-top: 4px;
        }
        
        .game-editor-input:focus {
          outline: none;
          border-color: #9D7CE8;
          background: white;
        }
        
        .game-editor-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .game-editor-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .game-editor-option-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .game-editor-form-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        
        .game-editor-clear-btn {
          background: #ff4757;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }
        
        .game-editor-clear-btn:hover {
          background: #ee5a6f;
        }
        
        .game-editor-add-btn {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .game-editor-add-btn:hover {
          background: linear-gradient(135deg, #45a049 0%, #4CAF50 100%);
        }
        
        .game-editor_current-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .clear-all-btn {
          background: #ff4757;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: background 0.2s;
        }
        
        .clear-all-btn:hover {
          background: #ee5a6f;
        }
        
        .game-editor-current-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }
        
        .game-editor-current-card {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          transition: all 0.2s;
        }
        
        .game-editor-current-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }
        
        .game-editor-current-card.locked {
          background: linear-gradient(135deg, #e0e0e0 0%, #cfcfcf 100%);
          border-color: #999;
        }
        
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        
        .question-number {
          background: rgba(255,255,255,0.9);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          color: #9D7CE8;
        }
        
        .time-badge {
          background: rgba(255,255,255,0.9);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #FF8DC7;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .game-editor-current-q {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          line-height: 1.4;
        }
        
        .game-editor-current-a {
          font-size: 13px;
          color: #555;
        }
        
        .game-editor-current-actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        
        .action-btn {
          background: white;
          border: 2px solid #ddd;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex: 1;
        }
        
        .action-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }
        
        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .lock-btn {
          color: #FF9800;
          border-color: #FF9800;
        }
        
        .lock-btn:hover:not(:disabled) {
          background: #FF9800;
          color: white;
        }
        
        .edit-btn {
          color: #2196F3;
          border-color: #2196F3;
        }
        
        .edit-btn:hover:not(:disabled) {
          background: #2196F3;
          color: white;
        }
        
        .delete-btn {
          color: #ff4757;
          border-color: #ff4757;
        }
        
        .delete-btn:hover:not(:disabled) {
          background: #ff4757;
          color: white;
        }
        
        .game-editor-side-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 320px;
        }
        
        .game-editor-side-card {
          margin-bottom: 0;
        }
        
        .global-time-card {
          background: linear-gradient(135deg, #E0C3FC 0%, #FFE5F1 100%);
        }
        
        .game-editor-side-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          color: #333;
        }
        
        .game-editor-side-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 14px;
        }
        
        .checkbox-group label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .checkbox-group input[type="checkbox"] {
          margin-right: 8px;
        }
        
        .apply-global-btn {
          background: linear-gradient(135deg, #9D7CE8 0%, #B794F6 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
          transition: transform 0.2s;
        }
        
        .apply-global-btn:hover {
          transform: translateY(-2px);
        }
        
        .game-editor-generate-btn {
          background: linear-gradient(135deg, #FFD6E8 0%, #FFF5BA 100%);
          color: #333;
          border: none;
          border-radius: 10px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s;
        }
        
        .game-editor-generate-btn:hover {
          transform: translateY(-2px);
        }
        
        .game-editor-side-actions {
          display: flex;
          gap: 12px;
          padding: 16px;
        }
        
        .game-editor-discard-btn {
          background: #f5f5f5;
          color: #666;
          border: 2px solid #ddd;
          border-radius: 10px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .game-editor-discard-btn:hover {
          background: #e0e0e0;
        }
        
        .game-editor-save-btn {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          justify-content: center;
          transition: transform 0.2s;
        }
        
        .game-editor-save-btn:hover {
          transform: translateY(-2px);
        }
        
        .error-message {
          color: #ff4757;
          background: #ffe0e0;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-top: 10px;
          border-left: 4px solid #ff4757;
        }
        
        .loading-overlay {
          position: fixed;
          top: 0; 
          left: 0; 
          width: 100vw; 
          height: 100vh;
          background: linear-gradient(180deg, rgba(255,182,217,0.95) 0%, rgba(157,124,232,0.95) 50%, rgba(107,170,255,0.95) 100%);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .loading-spinner {
          border: 6px solid rgba(255,255,255,0.3);
          border-top: 6px solid white;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-text {
          font-size: 22px;
          color: white;
          font-weight: 700;
        }
        
        .saved-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(1);
          background: white;
          color: #4CAF50;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
          padding: 32px 48px;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          z-index: 10000;
          animation: popup-bounce 0.5s;
        }
        
        @keyframes popup-bounce {
          0% { transform: translate(-50%, -50%) scale(0.7); }
          60% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        
        @media (max-width: 1200px) {
          .game-editor-main-row {
            flex-direction: column;
          }
          
          .game-editor-side-col {
            min-width: 0;
          }
          
          .game-editor-current-list {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }
        
        @media (max-width: 768px) {
          .game-editor-content {
            padding: 16px;
          }
          
          .card {
            padding: 16px;
          }
          
          .game-editor-header-row {
            flex-direction: column;
            align-items: stretch;
          }
          
          .game-editor-current-list {
            grid-template-columns: 1fr;
          }
          
          .game-editor-options {
            grid-template-columns: 1fr;
          }
          
          .game-editor-form-actions {
            flex-direction: column;
          }
          
          .game-editor-side-actions {
            flex-direction: column;
          }
        }
        
        @media (max-width: 480px) {
          .game-editor-breadcrumb {
            font-size: 11px;
            padding: 10px 14px;
            overflow-x: auto;
            white-space: nowrap;
          }
          
          .game-editor-section-title {
            font-size: 1rem;
          }
          
          .question-header {
            flex-wrap: wrap;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}

export default GameEditor;
