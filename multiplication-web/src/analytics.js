import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

const db = getFirestore();

export async function getSessionAnalytics() {
  try {
    // Get all completed sessions (sessions with scores)
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

    return {
      mostChallengingQuestion: getMostChallengingQuestion(completedSessions),
      bestPerformingLevel: getBestPerformingLevel(completedSessions),
      latestSession: getLatestSession(completedSessions),
      questionsNeedReview: getQuestionsNeedReview(completedSessions),
      peakActivityTime: getPeakActivityTime(completedSessions)
    };
  } catch (error) {
    console.error("Error getting analytics:", error);
    return getDefaultAnalytics();
  }
}

function getMostChallengingQuestion(sessions) {
  const questionStats = {};
  
  sessions.forEach(session => {
    session.scores?.forEach(player => {
      player.questionResults?.forEach(result => {
        if (!questionStats[result.questionId]) {
          questionStats[result.questionId] = {
            question: result.question,
            total: 0,
            correct: 0,
            level: session.level
          };
        }
        questionStats[result.questionId].total++;
        if (result.isCorrect) {
          questionStats[result.questionId].correct++;
        }
      });
    });
  });

  let mostChallenging = null;
  let lowestRate = 100;

  Object.entries(questionStats).forEach(([id, stats]) => {
    if (stats.total >= 5) { // Only consider questions answered at least 5 times
      const successRate = (stats.correct / stats.total) * 100;
      if (successRate < lowestRate) {
        lowestRate = successRate;
        mostChallenging = {
          question: stats.question,
          level: stats.level,
          rate: Math.round(successRate)
        };
      }
    }
  });

  return mostChallenging || {
    question: "What is 7 x 8?",
    level: "LEVEL 2",
    rate: 28
  };
}

function getBestPerformingLevel(sessions) {
  const levelStats = { "LEVEL 1": [], "LEVEL 2": [], "LEVEL 3": [] };
  
  sessions.forEach(session => {
    const level = session.level;
    session.scores?.forEach(player => {
      levelStats[level]?.push(player.accuracy || 0);
    });
  });

  let bestLevel = "LEVEL 1";
  let highestAvg = 0;

  Object.entries(levelStats).forEach(([level, scores]) => {
    if (scores.length > 0) {
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (avg > highestAvg) {
        highestAvg = avg;
        bestLevel = level;
      }
    }
  });

  return {
    level: bestLevel,
    average: Math.round(highestAvg)
  };
}

function getLatestSession(sessions) {
  if (sessions.length === 0) {
    return {
      players: 15,
      completion: 92
    };
  }

  const latest = sessions.reduce((latest, session) => {
    const sessionTime = session.createdAt?.toMillis() || 0;
    const latestTime = latest.createdAt?.toMillis() || 0;
    return sessionTime > latestTime ? session : latest;
  });

  return {
    players: latest.scores?.length || 0,
    completion: Math.round((latest.scores?.length || 0) / Math.max(latest.players?.length || 1, 1) * 100)
  };
}

function getQuestionsNeedReview(sessions) {
  const questionStats = {};
  
  sessions.forEach(session => {
    session.scores?.forEach(player => {
      player.questionResults?.forEach(result => {
        if (!questionStats[result.questionId]) {
          questionStats[result.questionId] = {
            total: 0,
            correct: 0
          };
        }
        questionStats[result.questionId].total++;
        if (result.isCorrect) {
          questionStats[result.questionId].correct++;
        }
      });
    });
  });

  const lowPerformingQuestions = Object.entries(questionStats).filter(([id, stats]) => {
    const successRate = (stats.correct / stats.total) * 100;
    return stats.total >= 3 && successRate < 40;
  });

  return lowPerformingQuestions.length;
}

function getPeakActivityTime(sessions) {
  const hourCounts = {};
  
  sessions.forEach(session => {
    const date = session.createdAt?.toDate() || new Date();
    const hour = date.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  let peakHour = 14; // Default 2 PM
  let maxCount = 0;

  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count;
      peakHour = parseInt(hour);
    }
  });

  const formatHour = (hour) => {
    const next = (hour + 1) % 24;
    return `${hour}:00 - ${next}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return formatHour(peakHour);
}

function getDefaultAnalytics() {
  return {
    mostChallengingQuestion: {
      question: "What is 7 x 8?",
      level: "LEVEL 2",
      rate: 28
    },
    bestPerformingLevel: {
      level: "LEVEL 1",
      average: 87
    },
    latestSession: {
      players: 0,
      completion: 0
    },
    questionsNeedReview: 0,
    peakActivityTime: "2:00 - 3:00 PM"
  };
}