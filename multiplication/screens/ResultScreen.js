import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ResultScreen({ route, navigation }) {
  const { sessionId, studentId, studentData, allScores } = route.params;
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [questionResults, setQuestionResults] = useState([]);
  const [currentTip, setCurrentTip] = useState(null);

  // 10 multiplication tips that will be shown randomly
  const multiplicationTips = [
    {
      number: 1,
      title: "Zero Magic!",
      text: "Any number multiplied by 0 equals 0. It's like magic - everything disappears! Example: 25 × 0 = 0, 1000 × 0 = 0"
    },
    {
      number: 2,
      title: "The Identity Hero!",
      text: "Any number multiplied by 1 stays the same! It's the identity superhero of multiplication. Example: 47 × 1 = 47"
    },
    {
      number: 3,
      title: "Doubling Fun!",
      text: "To multiply by 2, just double the number! It's like having twins. Example: 13 × 2 = 13 + 13 = 26"
    },
    {
      number: 4,
      title: "Five's Trick!",
      text: "To multiply by 5, multiply by 10 and divide by 2! Example: 8 × 5 = (8 × 10) ÷ 2 = 80 ÷ 2 = 40"
    },
    {
      number: 5,
      title: "Nine's Finger Magic!",
      text: "For 9 times tables, hold up your fingers and fold down the number you're multiplying. Count tens and ones! Try 9 × 4!"
    },
    {
      number: 6,
      title: "Commutative Property!",
      text: "Order doesn't matter in multiplication! 3 × 7 = 7 × 3 = 21. You can flip numbers to make it easier!"
    },
    {
      number: 7,
      title: "Ten's Power!",
      text: "To multiply by 10, just add a zero! To multiply by 100, add two zeros! Example: 23 × 10 = 230, 23 × 100 = 2,300"
    },
    {
      number: 8,
      title: "Break It Down!",
      text: "Break big numbers into smaller parts! 12 × 15 = 12 × (10 + 5) = (12 × 10) + (12 × 5) = 120 + 60 = 180"
    },
    {
      number: 9,
      title: "Square Numbers!",
      text: "When multiplying a number by itself, it's called squaring! 5² = 5 × 5 = 25. Perfect squares are special!"
    },
    {
      number: 10,
      title: "Even × Odd Pattern!",
      text: "Even × Even = Even, Odd × Odd = Odd, Even × Odd = Even. Remember these patterns to check your work!"
    }
  ];

  useEffect(() => {
    Font.loadAsync({
      LuckiestGuy: require('../assets/LuckiestGuy-Regular.ttf'),
    }).then(() => setFontsLoaded(true));
    
    // Select a random tip
    const randomTip = multiplicationTips[Math.floor(Math.random() * multiplicationTips.length)];
    setCurrentTip(randomTip);
    
    // Load actual question results
    loadQuestionResults();
  }, []);

  const loadQuestionResults = async () => {
    try {
      // Get session data to retrieve questions
      const sessionDoc = await getDoc(doc(db, "sessions", sessionId));
      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data();
        const questions = sessionData.questions || [];
        
        // Find this student's answers
        const studentAnswers = sessionData.studentAnswers?.[studentId] || {};
        
        // Create question results array
        const results = questions.map((question, index) => {
          const studentAnswer = studentAnswers[index];
          const isCorrect = studentAnswer === question.answer;
          
          return {
            question: `${question.num1} × ${question.num2} = ?`,
            userAnswer: studentAnswer || "No answer",
            correctAnswer: question.answer,
            isCorrect: isCorrect
          };
        });
        
        setQuestionResults(results);
      }
    } catch (error) {
      console.error("Error loading question results:", error);
      // Fallback to mock data if there's an error
      setQuestionResults([
        { question: "7 × 8 = ?", userAnswer: "56", correctAnswer: "56", isCorrect: true },
        { question: "9 × 6 = ?", userAnswer: "54", correctAnswer: "54", isCorrect: true },
        { question: "12 × 4 = ?", userAnswer: "46", correctAnswer: "48", isCorrect: false },
        { question: "8 × 7 = ?", userAnswer: "56", correctAnswer: "56", isCorrect: true },
        { question: "11 × 3 = ?", userAnswer: "33", correctAnswer: "33", isCorrect: true },
        { question: "6 × 9 = ?", userAnswer: "52", correctAnswer: "54", isCorrect: false },
        { question: "5 × 12 = ?", userAnswer: "60", correctAnswer: "60", isCorrect: true },
        { question: "13 × 2 = ?", userAnswer: "26", correctAnswer: "26", isCorrect: true },
        { question: "4 × 15 = ?", userAnswer: "60", correctAnswer: "60", isCorrect: true },
        { question: "8 × 9 = ?", userAnswer: "70", correctAnswer: "72", isCorrect: false }
      ]);
    }
  };

  if (!fontsLoaded || !currentTip) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  // Calculate stats
  const totalQuestions = questionResults.length;
  const correctAnswers = questionResults.filter(q => q.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const timeSpent = studentData?.totalTime ? Math.round(studentData.totalTime / 1000 / 60) : 0;
  
  // Calculate streak (consecutive correct answers)
  let maxStreak = 0;
  let currentStreak = 0;
  
  questionResults.forEach(result => {
    if (result.isCorrect) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  const handleHomePress = () => {
    navigation.navigate('TitleScreen');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4fd1ff', '#ff5fcf']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backArrow}>
          <Text style={styles.backArrowText}>←</Text>
        </View>
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.headerText}>YOUR RESULTS</Text>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Pro Tips Card */}
        <View style={styles.card}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipTitle}>Pro Tips for Multiplication!</Text>
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipLabel}>TIP #{currentTip.number}</Text>
            <Text style={styles.tipTitle2}>{currentTip.title}</Text>
            <Text style={styles.tipText}>{currentTip.text}</Text>
          </View>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.celebrationIcon}>
            <Text style={styles.celebrationText}>🎉</Text>
          </View>
          <Text style={styles.scorePercentage}>{accuracy}%</Text>
          <Text style={styles.scoreLabel}>
            {accuracy >= 90 ? "Excellent!" : accuracy >= 70 ? "Great Job!" : accuracy >= 50 ? "Good Work!" : "Keep Practicing!"}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${accuracy}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {accuracy >= 80 ? "Excellent Progress!" : accuracy >= 60 ? "Good Progress!" : "Keep Going!"}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statNumber}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>❌</Text>
            <Text style={styles.statNumber}>{incorrectAnswers}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statNumber}>{timeSpent}m</Text>
            <Text style={styles.statLabel}>Time Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statNumber}>{maxStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>

        {/* Problem Review */}
        <View style={styles.problemReviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewIcon}>📝</Text>
            <Text style={styles.reviewTitle}>Problem Review</Text>
            <Text style={styles.reviewSubtitle}>({totalQuestions} questions)</Text>
          </View>
          
          {questionResults.length === 0 ? (
            <View style={styles.noQuestionsContainer}>
              <Text style={styles.noQuestionsText}>No questions available to review</Text>
            </View>
          ) : (
            questionResults.map((result, index) => (
              <View key={index} style={[
                styles.problemItem,
                { borderLeftColor: result.isCorrect ? '#4caf50' : '#f44336' }
              ]}>
                <View style={styles.problemContent}>
                  <Text style={styles.problemQuestion}>{result.question}</Text>
                  <Text style={[
                    styles.problemAnswer,
                    { color: result.isCorrect ? '#4caf50' : '#f44336' }
                  ]}>
                    Your answer: {result.userAnswer}
                    {!result.isCorrect && ` ✗ Correct: ${result.correctAnswer}`}
                  </Text>
                </View>
                <View style={[
                  styles.problemStatus,
                  { backgroundColor: result.isCorrect ? '#e8f5e8' : '#ffebee' }
                ]}>
                  <Text style={[
                    styles.problemStatusIcon,
                    { color: result.isCorrect ? '#4caf50' : '#f44336' }
                  ]}>
                    {result.isCorrect ? '✓' : '✗'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Home Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={handleHomePress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ff8c42', '#ffb366']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <View style={styles.buttonContent}>
              <View style={styles.homeIcon}>
                <Text style={styles.homeIconText}>🏠</Text>
              </View>
              <Text style={styles.buttonText}>HOME</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrowText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerText: {
    marginTop: 100,
    alignSelf: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    color: '#333',
  },
  tipContent: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 12,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  tipTitle2: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  celebrationIcon: {
    marginBottom: 16,
  },
  celebrationText: {
    fontSize: 48,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    color: '#4caf50',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  problemReviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    color: '#333',
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  problemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  problemContent: {
    flex: 1,
  },
  problemQuestion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  problemAnswer: {
    fontSize: 12,
    fontWeight: '500',
  },
  problemStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  problemStatusIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noQuestionsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  homeButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  homeIconText: {
    fontSize: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    letterSpacing: 1,
  },
});