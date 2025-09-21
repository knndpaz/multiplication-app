import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore();

export async function getReportsAnalytics() {
  try {
    // Get all completed sessions
    const sessionsSnap = await getDocs(collection(db, "sessions"));
    const completedSessions = [];
    
    sessionsSnap.forEach(doc => {
      const data = doc.data();
      if (data.scores && data.scores.length > 0) {
        completedSessions.push({
          id: doc.id,
          ...data
        });
      }
    });

    // Get all students data
    const studentsSnap = await getDocs(collection(db, "students", "rTPhhHNRT5gMWFsZWdrtmpUVhWd2", "list"));
    const allStudents = [];
    studentsSnap.forEach(doc => {
      allStudents.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      totalStudents: allStudents.length,
      classAverage: calculateClassAverage(completedSessions),
      needSupport: calculateNeedSupport(completedSessions),
      topPerformers: calculateTopPerformers(completedSessions),
      studentPerformances: calculateStudentPerformances(completedSessions, allStudents),
      topPerformersList: getTopPerformersList(completedSessions),
      studentsNeedingSupport: getStudentsNeedingSupport(completedSessions)
    };
  } catch (error) {
    console.error("Error getting reports analytics:", error);
    return getDefaultReportsAnalytics();
  }
}

function calculateClassAverage(sessions) {
  let totalScores = [];
  
  sessions.forEach(session => {
    session.scores?.forEach(player => {
      if (player.accuracy !== undefined) {
        totalScores.push(player.accuracy);
      }
    });
  });

  if (totalScores.length === 0) return { average: 0, improvement: 0 };
  
  const average = totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length;
  
  // Calculate improvement (mock data for now - you'd need historical data)
  const improvement = 2.1;
  
  return {
    average: Math.round(average * 10) / 10,
    improvement: improvement
  };
}

function calculateNeedSupport(sessions) {
  let lowPerformers = new Set();
  
  sessions.forEach(session => {
    session.scores?.forEach(player => {
      if (player.accuracy && player.accuracy < 60) {
        lowPerformers.add(player.studentId);
      }
    });
  });

  return lowPerformers.size;
}

function calculateTopPerformers(sessions) {
  let highPerformers = new Set();
  
  sessions.forEach(session => {
    session.scores?.forEach(player => {
      if (player.accuracy && player.accuracy >= 85) {
        highPerformers.add(player.studentId);
      }
    });
  });

  return highPerformers.size;
}

function calculateStudentPerformances(sessions, allStudents) {
  const studentStats = {};
  
  // Initialize all students
  allStudents.forEach(student => {
    studentStats[student.id] = {
      id: student.id,
      name: `${student.firstname} ${student.lastname}`,
      scores: [],
      totalQuestions: 0,
      correctAnswers: 0
    };
  });

  // Collect performance data
  sessions.forEach(session => {
    session.scores?.forEach(player => {
      if (studentStats[player.studentId]) {
        studentStats[player.studentId].scores.push(player.accuracy || 0);
        studentStats[player.studentId].totalQuestions += player.totalQuestions || 0;
        studentStats[player.studentId].correctAnswers += player.correctAnswers || 0;
      }
    });
  });

  // Calculate overall scores and sort
  const performances = Object.values(studentStats).map(student => {
    const overallScore = student.scores.length > 0 
      ? student.scores.reduce((sum, score) => sum + score, 0) / student.scores.length
      : 0;
    
    return {
      ...student,
      overallScore: Math.round(overallScore),
      sessionsPlayed: student.scores.length
    };
  }).sort((a, b) => b.overallScore - a.overallScore);

  return performances;
}

function getTopPerformersList(sessions) {
  const studentStats = {};
  
  sessions.forEach(session => {
    session.scores?.forEach(player => {
      if (!studentStats[player.studentId]) {
        studentStats[player.studentId] = {
          name: player.name,
          scores: [],
          totalQuestions: 0,
          correctAnswers: 0,
          levels: new Set()
        };
      }
      
      studentStats[player.studentId].scores.push(player.accuracy || 0);
      studentStats[player.studentId].totalQuestions += player.totalQuestions || 0;
      studentStats[player.studentId].correctAnswers += player.correctAnswers || 0;
      studentStats[player.studentId].levels.add(session.level);
    });
  });

  return Object.entries(studentStats)
    .map(([id, stats]) => {
      const avgScore = stats.scores.length > 0 
        ? stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length
        : 0;
      
      return {
        id,
        name: stats.name,
        score: Math.round(avgScore),
        correctAnswers: stats.correctAnswers,
        totalQuestions: stats.totalQuestions,
        topLevel: Array.from(stats.levels).sort().pop() || "LEVEL 1"
      };
    })
    .filter(student => student.score >= 85)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function getStudentsNeedingSupport(sessions) {
  const studentStats = {};
  
  sessions.forEach(session => {
    session.scores?.forEach(player => {
      if (!studentStats[player.studentId]) {
        studentStats[player.studentId] = {
          name: player.name,
          scores: [],
          strugglingLevel: session.level
        };
      }
      
      studentStats[player.studentId].scores.push(player.accuracy || 0);
      
      // Track lowest performing level
      if (player.accuracy < 50) {
        studentStats[player.studentId].strugglingLevel = session.level;
      }
    });
  });

  return Object.entries(studentStats)
    .map(([id, stats]) => {
      const avgScore = stats.scores.length > 0 
        ? stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length
        : 0;
      
      return {
        id,
        name: stats.name,
        score: Math.round(avgScore),
        strugglingLevel: stats.strugglingLevel,
        issue: avgScore < 30 ? "Missing fundamentals" 
              : avgScore < 50 ? `Needs ${stats.strugglingLevel} Review`
              : `Struggling with ${stats.strugglingLevel}`
      };
    })
    .filter(student => student.score < 60)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);
}

function getDefaultReportsAnalytics() {
  return {
    totalStudents: 0,
    classAverage: { average: 0, improvement: 0 },
    needSupport: 0,
    topPerformers: 0,
    studentPerformances: [],
    topPerformersList: [],
    studentsNeedingSupport: []
  };
}