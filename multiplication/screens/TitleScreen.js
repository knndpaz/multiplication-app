import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';

export default function TitleScreen({ navigation }) {
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
        {/* Play Button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => navigation?.navigate('CodeScreen')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#f97316', '#facc15']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.playButtonGradient}
          >
            <View style={styles.playIcon}>
              {/* Play icon image */}
              <Image
                source={require('../assets/playbutton.png')}
                style={{ width: 36, height: 36 }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.playText}>PLAY</Text>
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
  playButton: {
    marginTop: 32,
    borderRadius: 9999,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 9999,
    justifyContent: 'center',
  },
  playIcon: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
  },
});