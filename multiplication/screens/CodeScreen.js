import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';

export default function CodeScreen({ navigation }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      LuckiestGuy: require('../assets/LuckiestGuy-Regular.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

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
        {/* Enter Code Button */}
        <TouchableOpacity
          style={styles.codeButton}
          onPress={() => navigation?.navigate('SelectCharacter')}
        >
          <Text style={styles.codeText}>ENTER CODE</Text>
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
});