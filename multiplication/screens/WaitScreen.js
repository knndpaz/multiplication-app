import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";

export default function WaitScreen({ navigation, route }) {
  const [spinValue] = useState(new Animated.Value(0));
  const [gameStarted, setGameStarted] = useState(false);
  const { sessionId, studentId, studentName, level, playerId, code, selectedCharacter } = route.params;

  useEffect(() => {
    // Add player to waiting list when component mounts
    const addToWaitingList = async () => {
      try {
        await updateDoc(doc(db, "sessions", sessionId), {
          waitingPlayers: arrayUnion({
            studentId,
            name: studentName,
            playerId,
            joinedAt: Date.now()
          })
        });
      } catch (error) {
        console.error("Error adding to waiting list:", error);
      }
    };

    addToWaitingList();

    // Listen for game start
    const unsubscribe = onSnapshot(doc(db, "sessions", sessionId), (doc) => {
      const data = doc.data();
      if (data?.gameStarted === true) {
        setGameStarted(true);
        // Navigate to QuizScreen when game starts
        navigation.replace('QuizScreen', {
          sessionId,
          studentId,
          studentName,
          level,
          playerId,
          code,
          selectedCharacter
        });
      }
    });

    return () => unsubscribe();
  }, [sessionId, studentId, studentName, playerId]);

  useEffect(() => {
    // Create spinning animation
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
  }, [spinValue]);

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#4fd1ff', '#ff5fcf']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Background overlay pattern */}
      <Image
        source={require('../assets/bgoverlay.png')}
        style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]}
        resizeMode="cover"
      />

      {/* Logo at top */}
      <Image
        source={require('../assets/title.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Loading Spinner */}
      <View style={styles.spinnerContainer}>
        <Animated.View
          style={[
            styles.spinner,
            { transform: [{ rotate: spinInterpolate }] }
          ]}
        >
          <View style={styles.spinnerOuter}>
            <View style={styles.spinnerInner} />
          </View>
        </Animated.View>
      </View>

      {/* Waiting Text */}
      <Text style={styles.waitingText}>WAITING FOR TEACHER TO START...</Text>
      <Text style={styles.subText}>
        Session Code: {code}
      </Text>
      <Text style={styles.playerName}>
        Welcome, {studentName}!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logo: {
    position: 'absolute',
    top: 80,
    width: 200,
    height: 100,
    zIndex: 2,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  spinner: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF8C42',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  spinnerInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFB366',
    position: 'relative',
  },
  waitingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    fontFamily: 'LuckiestGuy',
    letterSpacing: 1,
    marginTop: 20,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'LuckiestGuy',
    marginTop: 10,
  },
  playerName: {
    fontSize: 18,
    color: '#4fd1ff',
    textAlign: 'center',
    fontFamily: 'LuckiestGuy',
    marginTop: 15,
    fontWeight: 'bold',
  },
});