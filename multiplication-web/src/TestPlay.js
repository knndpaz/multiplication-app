import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore();

function TestPlay({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  
  const level = location.state?.level || 'level-1';

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const snap = await getDocs(collection(db, "questions", user.uid, level));
        const arr = [];
        snap.forEach(doc => {
          arr.push(doc.data());
        });
        setQuestions(arr.slice(0, 10)); // Limit to 10 questions for testing
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    }
    fetchQuestions();
  }, [user.uid, level]);

  const handleAnswer = (answerIndex) => {
    setSelected(answerIndex);
    
    setTimeout(() => {
      const q = questions[currentIdx];
      const isCorrect = answerIndex === q.correct;
      
      if (isCorrect) {
        setScore(score + 1);
      }
      
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setSelected(null);
      } else {
        setGameFinished(true);
      }
    }, 1000);
  };

  const handleFinish = () => {
    navigate('/games/' + level + '/edit');
  };

  if (questions.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading test questions...</div>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <h2>Test Complete!</h2>
          <p style={{ fontSize: '18px', margin: '20px 0' }}>Score: {score}/{questions.length}</p>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
            Accuracy: {Math.round((score / questions.length) * 100)}%
          </p>
          <button 
            onClick={handleFinish}
            style={{
              background: '#4fd1ff',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Back to Editor
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div style={{ background: 'linear-gradient(180deg, #4fd1ff 0%, #ff5fcf 100%)', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '50px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', marginBottom: '30px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Question {currentIdx + 1} of {questions.length}</h3>
          <h2 style={{ margin: '0', color: '#333', fontSize: '24px' }}>{q.question}</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {q.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null}
              style={{
                background: selected === idx ? (idx === q.correct ? '#4caf50' : '#f44336') : '#fff',
                color: selected === idx ? '#fff' : '#333',
                border: 'none',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '18px',
                cursor: selected !== null ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {String.fromCharCode(65 + idx)}. {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestPlay;