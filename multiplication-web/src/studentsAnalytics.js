import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

const db = getFirestore();

export async function getStudentAnalytics(studentId) {
  try {
    // Get student info
    const studentsSnap = await getDocs(collection(db, "students", "rTPhhHNRT5gMWFsZWdrtmpUVhWd2", "list"));
    let studentInfo = null;
    
    studentsSnap.forEach(doc => {
      if (doc.id === studentId) {
        studentInfo = { id: doc.id, ...doc.data() };
      }
    });

    if (!studentInfo) {
      return null;
    }

    // Get all sessions where this student participated
    const sessionsSnap = await getDocs(collection(db, "sessions"));
    const studentSessions = [];
    
    sessionsSnap.forEach(doc => {
      const data = doc.data();
      if (data.scores && data.scores.length > 0) {
        const studentScore = data.scores.find(score => score.studentId === studentId);
        if (studentScore) {
          studentSessions.push({
            ...studentScore,
            sessionLevel: data.level,
            sessionDate: data.createdAt?.toDate() || new Date()
          });
        }
      }
    });

    // Calculate analytics
    const analytics = calculateStudentAnalytics(studentInfo, studentSessions);
    
    return analytics;
  } catch (error) {
    console.error("Error getting student analytics:", error);
    return null;
  }
}

function calculateStudentAnalytics(studentInfo, sessions) {
  const totalSessions = sessions.length;
  const totalQuestions = sessions.reduce((sum, session) => sum + (session.totalQuestions || 0), 0);
  const totalCorrect = sessions.reduce((sum, session) => sum + (session.correctAnswers || 0), 0);
  const totalTime = sessions.reduce((sum, session) => sum + (session.totalTime || 0), 0);
  
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const overallProgress = avgAccuracy; // Simplified for now
  
  // Level progress calculation
  const levelProgress = calculateLevelProgress(sessions);
  
  // Trends calculation
  const trends = calculateTrends(sessions);
  
  // Session statistics
  const sessionStats = calculateSessionStats(sessions);

  return {
    name: `${studentInfo.firstname} ${studentInfo.lastname}`,
    grade: "4",
    studentId: studentInfo.id.slice(-3).toUpperCase(),
    lastUpdated: "5 minutes ago",
    overallProgress,
    avgAccuracy,
    totalTime: Math.round(totalTime / 1000), // Convert to seconds
    sessionsCompleted: totalSessions,
    levelProgress,
    trends,
    sessionStats,
    performanceMessage: generatePerformanceMessage(avgAccuracy, sessions)
  };
}

function calculateLevelProgress(sessions) {
  const levels = [
    { name: "Level 1", difficulty: "Easy level", color: "#ff9800", icon: "filter_1" },
    { name: "Level 2", difficulty: "Medium level", color: "#4caf50", icon: "filter_2" },
    { name: "Level 3", difficulty: "Hard level", color: "#2196f3", icon: "filter_3" }
  ];

  // Create separate entries for each session
  const levelProgress = [];
  levels.forEach(level => {
    const levelSessions = sessions.filter(s => s.sessionLevel === level.name.toUpperCase());
    levelSessions.forEach((session, index) => {
      const questionResults = session.questionResults || [];
      const totalQuestions = questionResults.length || session.totalQuestions || 0;
      const correctAnswers = questionResults.filter(q => q.isCorrect).length || session.correctAnswers || 0;
      const incorrectAnswers = totalQuestions - correctAnswers;
      const completion = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      // Generate question progress in sequential order based on actual question results
      const questionProgress = questionResults.map(q => q.isCorrect);

      levelProgress.push({
        ...level,
        name: `${level.name} - Session ${index + 1}`,
        completion,
        status: completion >= 90 ? "Completed" : "In Progress",
        correctAnswers,
        incorrectAnswers,
        questionProgress,
        sessionDate: session.sessionDate
      });
    });
  });

  return levelProgress;
}

function calculateTrends(sessions) {
  // Sort sessions by date
  const sortedSessions = sessions.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));
  
  // Calculate accuracy improvement (compare first half vs second half)
  const midPoint = Math.floor(sortedSessions.length / 2);
  const firstHalf = sortedSessions.slice(0, midPoint);
  const secondHalf = sortedSessions.slice(midPoint);
  
  const firstHalfAccuracy = firstHalf.length > 0 ? 
    firstHalf.reduce((sum, s) => sum + (s.accuracy || 0), 0) / firstHalf.length : 0;
  const secondHalfAccuracy = secondHalf.length > 0 ? 
    secondHalf.reduce((sum, s) => sum + (s.accuracy || 0), 0) / secondHalf.length : 0;
  
  const accuracyImprovement = Math.max(0, Math.round(secondHalfAccuracy - firstHalfAccuracy));
  
  // Calculate average session time
  const avgSessionTime = sessions.length > 0 ? 
    Math.round(sessions.reduce((sum, s) => sum + (s.totalTime || 0), 0) / sessions.length / 60000) : 0;
  
  // Sessions this week (mock data)
  const sessionsThisWeek = Math.min(sessions.length, 7);
  
  // First try success rate (mock calculation)
  const firstTrySuccess = Math.round(Math.random() * 20 + 80); // 80-100%
  
  return {
    accuracyImprovement,
    avgSessionTime,
    sessionsThisWeek,
    firstTrySuccess
  };
}

function calculateSessionStats(sessions) {
  const totalQuestions = sessions.reduce((sum, session) => sum + (session.totalQuestions || 0), 0);
  const totalCorrect = sessions.reduce((sum, session) => sum + (session.correctAnswers || 0), 0);
  const totalTime = sessions.reduce((sum, session) => sum + (session.totalTime || 0), 0);
  
  const correctPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const avgResponseTime = sessions.length > 0 ? 
    Math.round(totalTime / totalQuestions / 1000 * 10) / 10 : 0; // Convert to seconds with 1 decimal
  
  // Mock some additional stats
  const hintsUsed = Math.floor(totalQuestions * 0.1); // 10% of questions used hints
  const fastestTime = Math.round(Math.random() * 2 + 1.5); // 1.5-3.5 seconds
  
  return {
    problemsSolved: totalQuestions,
    correctAnswers: totalCorrect,
    correctPercentage,
    hintsUsed,
    avgResponseTime,
    fastestTime
  };
}

function generatePerformanceMessage(accuracy, sessions) {
  if (accuracy >= 90) {
    return "Justine is performing exceptionally well across all levels. She shows strong understanding of fraction concepts and maintains high accuracy rates.";
  } else if (accuracy >= 75) {
    return "Good performance with room for improvement. Focus on accuracy in challenging problems.";
  } else if (accuracy >= 60) {
    return "Making progress but needs additional support with fundamental concepts.";
  } else {
    return "Requires significant support and additional practice to improve understanding.";
  }
}