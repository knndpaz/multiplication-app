import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function CodeScreen({ navigation }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      LuckiestGuy: require('../assets/LuckiestGuy-Regular.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  const handleJoinSession = async () => {
    if (!codeInput.trim()) {
      setJoinError("Please enter a session code");
      return;
    }

    setJoinError("");
    setIsJoining(true);
    
    try {
      console.log("Looking for session with code:", codeInput);
      
      const q = query(collection(db, "sessions"), where("code", "==", codeInput.trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setJoinError("Session not found. Please check the code.");
        setIsJoining(false);
        return;
      }

      const sessionDoc = snap.docs[0];
      const sessionData = sessionDoc.data();
      
      console.log("Found session:", sessionData);

      // Check if session is still accepting players
      if (sessionData.status === "completed") {
        setJoinError("This session has already ended.");
        setIsJoining(false);
        return;
      }

      // Generate unique player ID
      const playerId = "player-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
      
      // Add player to general players array (for counting)
      await updateDoc(doc(db, "sessions", sessionDoc.id), {
        players: arrayUnion(playerId),
      });

      console.log("Successfully joined session, navigating to NameScreen");

      // Navigate to SelectCharacter instead of NameScreen
      navigation.navigate("SelectCharacter", { 
        sessionId: sessionDoc.id,
        level: sessionData.level,
        playerId,
        code: codeInput.trim()
      });

    } catch (error) {
      console.error("Error joining session:", error);
      setJoinError("Failed to join session. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

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
        
        {/* Code Input */}
        <TextInput
          value={codeInput}
          onChangeText={(text) => {
            setCodeInput(text);
            setJoinError(""); // Clear error when typing
          }}
          placeholder="Enter session code"
          placeholderTextColor="#9ca3af"
          style={styles.codeInput}
          keyboardType="numeric"
          maxLength={6}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {/* Join Button */}
        <TouchableOpacity
          style={[styles.codeButton, isJoining && styles.codeButtonDisabled]}
          onPress={handleJoinSession}
          disabled={isJoining}
        >
          {isJoining ? (
            <ActivityIndicator size="small" color="#9ca3af" />
          ) : (
            <Text style={styles.codeText}>JOIN</Text>
          )}
        </TouchableOpacity>
        
        {/* Error Message */}
        {joinError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{joinError}</Text>
          </View>
        ) : null}
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
    paddingHorizontal: 20,
  },
  logo: {
    marginTop: -100,
    width: 600,
    height: 300,
    marginBottom: 48,
  },
  codeInput: {
    height: 60,
    borderColor: '#e5e7eb',
    borderWidth: 2,
    borderRadius: 30,
    paddingHorizontal: 25,
    marginTop: 20,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#374151',
  },
  codeButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 32,
    paddingHorizontal: 40,
    paddingVertical: 16,
    marginTop: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeButtonDisabled: {
    backgroundColor: '#d1d5db',
    elevation: 0,
    shadowOpacity: 0,
  },
  codeText: {
    color: '#9ca3af',
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    letterSpacing: 1,
  },
  errorContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});