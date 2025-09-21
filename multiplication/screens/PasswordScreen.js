import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";


export default function PasswordScreen({ navigation, route }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { studentId, sessionId, level, playerId, code, selectedCharacter } = route.params || {};

  useEffect(() => {
    Font.loadAsync({
      LuckiestGuy: require('../assets/LuckiestGuy-Regular.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  async function handleCheckPassword() {
    setLoading(true);
    const studentRef = doc(db, 'students', 'rTPhhHNRT5gMWFsZWdrtmpUVhWd2', 'list', studentId);
    const studentSnap = await getDoc(studentRef);
    setLoading(false);

    if (
      studentSnap.exists() &&
      String(studentSnap.data().password).trim() === String(password).trim()
    ) {
      // Navigate to WaitScreen instead of QuizScreen
      navigation.navigate('WaitScreen', { 
        sessionId,
        level,
        playerId,
        code,
        studentId,
        studentName: `${studentSnap.data().firstname} ${studentSnap.data().lastname}`,
        selectedCharacter
      });
    } else {
      navigation.replace('NameScreen', { 
        wrongPassword: true,
        sessionId,
        level,
        playerId,
        code
      });
    }
  }

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4fd1ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={['#4fd1ff', '#ff5fcf']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Overlay image */}
      <Image
        source={require('../assets/bgoverlay.png')}
        style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]}
        resizeMode="cover"
      />
      {/* Content */}
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require('../assets/title.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          keyboardType="numeric"
          secureTextEntry
        />
        {/* Enter Password Button */}
        <TouchableOpacity
          style={styles.codeButton}
          onPress={handleCheckPassword}
          disabled={loading}
        >
          <Text style={styles.codeText}>ENTER</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginTop: -100,
    width: 600,
    height: 300,
    marginBottom: 48,
  },
  codeButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginTop: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  codeText: {
    color: '#9ca3af',
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    fontSize: 24,
    fontFamily: 'LuckiestGuy',
    color: '#222',
    marginBottom: 24,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#4fd1ff',
    textAlign: 'center',
    width: 260,
  },
});