import React, { useEffect, useState, useRef } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const question = "If Prince Umpad has 6 essays, how many essays do Prince Umpad has?";
const options = [
  { key: 'A', value: 16, color: '#fbbf24' },
  { key: 'B', value: 50, color: '#f472b6' },
  { key: 'C', value: 19, color: '#f87171' },
  { key: 'D', value: 55, color: '#67e8f9' },
];
const correctIndex = 1; // index for "B. 50"
const quizPlayers = [
  require('../assets/quizplayer1.png'),
  require('../assets/quizplayer2.png'),
  require('../assets/quizplayer3.png'),
  require('../assets/quizplayer4.png'),
];

export default function QuizScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [showCheck, setShowCheck] = useState(false);
  const [timer, setTimer] = useState(50);
  const intervalRef = useRef();
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (selected === correctIndex) {
      setShowCheck(true);
      setTimeout(() => {
        navigation.navigate('RankingScreen');
      }, 1200); // Show check for 1.2s before redirect
    } else {
      setShowCheck(false);
    }
  }, [selected]);

  // For demo, always use quizplayer1.png
  const characterImg = quizPlayers[0];

  // Timer bar width calculation
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
      {/* Question Card */}
      <View style={styles.quizBox}>
        <Text style={styles.questionText}>{question}</Text>
      </View>
      {/* Character above Timer Bar */}
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
      {/* Options */}
      <View style={styles.optionsRow}>
        {options.map((opt, idx) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.optionBtn,
              { backgroundColor: opt.color },
              selected === idx && styles.selectedBtn,
            ]}
            onPress={() => setSelected(idx)}
            activeOpacity={0.85}
            disabled={showCheck}
          >
            <Text style={styles.optionText}>{`${opt.key}. ${opt.value}`}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Full screen check mark */}
      {showCheck && (
        <View style={styles.fullScreenCheck}>
          <Image
            source={require('../assets/correct.png')}
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
});