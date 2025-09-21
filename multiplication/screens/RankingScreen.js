import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function RankingScreen({ route, navigation }) {
  const { sessionId, studentId } = route.params;
  const [scores, setScores] = useState([]);
  const [currentStudentData, setCurrentStudentData] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      console.error("SessionId is missing");
      return;
    }

    const unsub = onSnapshot(
      doc(db, "sessions", sessionId), 
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const scoresArr = Array.isArray(data?.scores) ? data.scores : [];
          
          // Find current student's data
          const currentStudent = scoresArr.find(score => score.studentId === studentId);
          setCurrentStudentData(currentStudent);
          
          // Sort by score descending, then finishedAt ascending
          scoresArr.sort((a, b) => b.score - a.score || a.finishedAt - b.finishedAt);
          setScores(scoresArr);
        }
      },
      (error) => {
        console.error("Error listening to session:", error);
      }
    );
    
    return () => unsub();
  }, [sessionId, studentId]);

  const handleCheckResults = () => {
    navigation.navigate('ResultScreen', {
      sessionId,
      studentId,
      studentData: currentStudentData,
      allScores: scores
    });
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
      <Text style={styles.headerText}>RANKING</Text>
      
      {/* Rankings List */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {scores.length === 0 ? (
          <Text style={styles.noScoresText}>Waiting for scores...</Text>
        ) : (
          scores.map((rank, idx) => (
            <View key={`${rank.studentId}-${idx}`} style={styles.rankRow}>
              <View style={[
                styles.rankBar,
                rank.studentId === studentId && styles.currentStudentBar
              ]}>
                <Text style={[
                  styles.rankName,
                  rank.studentId === studentId && styles.currentStudentName
                ]}>
                  {rank.name}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Check Your Results Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.checkResultsButton}
          onPress={handleCheckResults}
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
              <Text style={styles.buttonText}>CHECK YOUR RESULTS</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  rankRow: {
    marginBottom: 12,
    alignItems: 'center',
  },
  rankBar: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '90%',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  currentStudentBar: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#ff6b6b',
  },
  rankName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    color: '#333',
    textAlign: 'center',
  },
  currentStudentName: {
    color: '#ff6b6b',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  checkResultsButton: {
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
  noScoresText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
    fontFamily: 'LuckiestGuy',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});