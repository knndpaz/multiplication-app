import React, { useEffect, useState, useRef } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Dimensions, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

const quizPlayers = [
  require('../assets/quizplayer1.png'),
  require('../assets/quizplayer2.png'),
  require('../assets/quizplayer3.png'),
  require('../assets/quizplayer4.png'),
];

export default function QuizScreen({ route, navigation }) {
  const { sessionId, studentId, studentName, selectedCharacter } = route.params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showCheck, setShowCheck] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [questionStartTimes, setQuestionStartTimes] = useState({});
  const [questionResults, setQuestionResults] = useState([]);
  const TIMER_DURATION = 50;
  const [timer, setTimer] = useState(TIMER_DURATION);
  const intervalRef = useRef();
  const timeoutRef = useRef();
  const screenWidth = Dimensions.get('window').width;

  // Track question start time
  useEffect(() => {
    setQuestionStartTimes(prev => ({
      ...prev,
      [currentIdx]: Date.now()
    }));
  }, [currentIdx]);

  // Function to save score and navigate to ranking
  const finishQuiz = async () => {
    try {
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const sessionRef = doc(db, "sessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);
      const sessionData = sessionSnap.data();
      
      // Calculate detailed analytics
      const playerResult = {
        studentId,
        name: studentName,
        score,
        totalQuestions: questions.length,
        correctAnswers: score,
        incorrectAnswers: questions.length - score,
        accuracy: (score / questions.length) * 100,
        totalTime,
        averageTimePerQuestion: totalTime / questions.length,
        finishedAt: endTime,
        questionResults: questionResults,
        level: sessionData.level
      };

      // Remove existing score for this student
      const currentScores = sessionData?.scores || [];
      const filteredScores = currentScores.filter(s => s.studentId !== studentId);
      
      // Update session with comprehensive data
      await updateDoc(sessionRef, {
        scores: [...filteredScores, playerResult],
        lastUpdated: endTime
      });

      navigation.navigate('RankingScreen', { 
        sessionId, 
        studentId,
        studentName 
      });
    } catch (error) {
      console.error("Error saving session data:", error);
      navigation.navigate('RankingScreen', { 
        sessionId, 
        studentId,
        studentName 
      });
    }
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Fetch questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const sessionDoc = await getDoc(doc(db, "sessions", sessionId));
        if (!sessionDoc.exists()) {
          console.error("Session not found!");
          return;
        }

        const sessionData = sessionDoc.data();
        const level = sessionData.level;
        const levelKey = level?.toLowerCase().replace(' ', '-');
        const teacherUid = "rTPhhHNRT5gMWFsZWdrtmpUVhWd2";

        if (!levelKey) {
          console.error("Level key is empty!");
          return;
        }

        const snap = await getDocs(collection(db, "questions", teacherUid, levelKey));
        const arr = [];
        snap.forEach(doc => {
          const data = doc.data();
          const options = Array.isArray(data.options) ? data.options : [];
          arr.push({
            ...data,
            id: doc.id,
            options: options.map((opt, idx) => ({
              key: String.fromCharCode(65 + idx),
              value: opt || "",
              color: "#eee"
            }))
          });
        });
        setQuestions(arr);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [sessionId]);

  // Track question results
  const recordQuestionResult = (questionId, question, isCorrect, timeTaken) => {
    const result = {
      questionId,
      question,
      isCorrect,
      timeTaken,
      answeredAt: Date.now()
    };
    setQuestionResults(prev => [...prev, result]);
  };

  // Handle text answer submission
  const handleSubmitAnswer = () => {
    const currentQuestion = questions[currentIdx];
    const timeTaken = Date.now() - (questionStartTimes[currentIdx] || Date.now());
    
    if (currentQuestion && currentQuestion.type === "singleAnswer") {
      clearInterval(intervalRef.current);
      const isCorrect = String(textAnswer).trim() === String(currentQuestion.answer).trim();
      
      // Record question result
      recordQuestionResult(currentQuestion.id, currentQuestion.question, isCorrect, timeTaken);
      
      if (isCorrect) {
        setScore(prev => prev + 1);
        setShowCheck(true);
      } else {
        setShowWrong(true);
      }
      
      timeoutRef.current = setTimeout(() => {
        setShowCheck(false);
        setShowWrong(false);
        setTextAnswer('');
        if (currentIdx < questions.length - 1) {
          setCurrentIdx(idx => idx + 1);
        } else {
          finishQuiz();
        }
      }, 1200);
    }
  };

  // SINGLE Timer effect - reset on question change and handle countdown
  useEffect(() => {
    console.log("Timer reset for question:", currentIdx);
    setTimer(TIMER_DURATION);
    
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          console.log("Timer expired!");
          clearInterval(intervalRef.current);
          setShowWrong(true);
          
          timeoutRef.current = setTimeout(() => {
            setShowWrong(false);
            setSelected(null);
            setTextAnswer('');
            if (currentIdx < questions.length - 1) {
              setCurrentIdx(idx => idx + 1);
            } else {
              finishQuiz();
            }
          }, 1200);
          
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIdx, questions.length]); // Remove 'score' from dependencies

  // Handle multiple choice selection
  useEffect(() => {
    if (selected !== null && questions.length > 0) {
      console.log("Multiple choice selected:", selected);
      clearInterval(intervalRef.current); // Stop timer
      const correctIdx = questions[currentIdx]?.correct;
      const currentQuestion = questions[currentIdx];
      const timeTaken = Date.now() - (questionStartTimes[currentIdx] || Date.now());
      const isCorrect = selected === correctIdx;
      
      // Record question result
      recordQuestionResult(currentQuestion.id, currentQuestion.question, isCorrect, timeTaken);
      
      if (isCorrect) {
        setScore(prev => prev + 1);
        setShowCheck(true);
      } else {
        setShowWrong(true);
      }
      
      timeoutRef.current = setTimeout(() => {
        console.log("Timeout completed, moving to next question...");
        setShowCheck(false);
        setShowWrong(false);
        setSelected(null);
        if (currentIdx < questions.length - 1) {
          console.log("Moving to next question:", currentIdx + 1);
          setCurrentIdx(idx => idx + 1);
        } else {
          console.log("Quiz finished!");
          finishQuiz();
        }
      }, 1200);
    }
  }, [selected, questions, currentIdx]); // Remove score dependency here too

  if (loading || !questions.length) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#222", fontSize: 22, marginTop: 100, textAlign: "center" }}>
          Loading questions...
        </Text>
      </View>
    );
  }

  const q = questions[currentIdx];
  if (!q) {
    console.log("No question found for index:", currentIdx);
    return null;
  }

  console.log("Current question:", currentIdx, q.question, "Type:", q.type);

  const characterImg = quizPlayers[selectedCharacter || 0]; // Use selected character or default to 0
  const timerBarMaxWidth = screenWidth - 40;
  const timerBarWidth = (timer / 50) * timerBarMaxWidth;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4fd1ff', '#ff5fcf']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Image
        source={require('../assets/bgoverlay.png')}
        style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]}
        resizeMode="cover"
      />
      <Image
        source={require('../assets/title.png')}
        style={styles.smallLogo}
        resizeMode="contain"
      />
      
      <View style={styles.quizBox}>
        <Text style={styles.questionText}>{q.question}</Text>
      </View>
      
      <View style={styles.characterTimerStack}>
        <Image
          source={characterImg}
          style={styles.characterImg}
          resizeMode="contain"
        />
        <View style={styles.timerBarContainer}>
          <View style={styles.timerBarBg}>
            <View style={[styles.timerBarFill, { width: timerBarWidth }]} />
            <View style={styles.timerTextWrapper}>
              <Text style={styles.timerText}>{timer}s 🕒</Text>
            </View>
          </View>
        </View>
      </View>
      
      {q.type === "singleAnswer" ? (
        <View style={styles.answerInputContainer}>
          <TextInput
            style={styles.answerInput}
            value={textAnswer}
            onChangeText={setTextAnswer}
            keyboardType="numeric"
            placeholder="Type your answer..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitAnswer}
            disabled={showCheck || showWrong}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.optionsRow}>
          {(q.options || []).map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.optionBtn,
                { backgroundColor: opt.color || "#eee" },
                selected === idx && styles.selectedBtn,
              ]}
              onPress={() => setSelected(idx)}
              activeOpacity={0.85}
              disabled={showCheck || showWrong}
            >
              <Text style={styles.optionText}>
                {`${opt.key}. ${opt.value}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {showCheck && (
        <View style={styles.fullScreenCheck}>
          <Image
            source={require('../assets/correct.png')}
            style={styles.fullCheckImg}
            resizeMode="contain"
          />
        </View>
      )}
      
      {showWrong && (
        <View style={styles.fullScreenCheck}>
          <Image
            source={require('../assets/wrong.png')}
            style={styles.fullCheckImg}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  smallLogo: {
    position: 'absolute',
    top: 24,
    left: 16,
    width: 90,
    height: 90,
    zIndex: 2,
  },
  quizBox: {
    marginTop: 120,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
    minHeight: 180,
    zIndex: 1,
  },
  questionText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
    fontFamily: 'LuckiestGuy',
  },
  characterTimerStack: {
    alignItems: 'center',
    marginTop: -40, // Pull up to overlap card if needed
    zIndex: 2,
  },
  characterImg: {
    width: 120,
    height: 120,
    marginBottom: 8,
    marginRight: 230,
  },
  timerBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  timerBarBg: {
    flex: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative', // Add for absolute timer text
  },
  timerBarFill: {
    height: '100%',
    backgroundColor: '#4fd1ff',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
  },
  timerTextWrapper: {
    position: 'absolute',
    right: 16,
    top: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    minWidth: 60,
    textAlign: 'right',
  },
  optionsRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  optionBtn: {
    width: 120,
    height: 54,
    borderRadius: 16,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  selectedBtn: {
    borderWidth: 3,
    borderColor: '#22c55e',
  },
  optionText: {
    color: '#222',
    fontSize: 20,
    fontFamily: 'LuckiestGuy',
    fontWeight: 'bold',
  },
  fullScreenCheck: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  fullCheckImg: {
    width: '80%',
    height: '80%',
    opacity: 0.8,
  },
  answerInputContainer: {
    marginTop: 18,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  answerInput: {
    width: '100%',
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontFamily: 'LuckiestGuy',
    marginBottom: 12,
    textAlign: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  submitButton: {
    width: '50%',
    height: 54,
    backgroundColor: '#4fd1ff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'LuckiestGuy',
    fontWeight: 'bold',
  },
});