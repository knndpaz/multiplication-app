import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';

const names = [
  'PRINCE UMPAD',
  'PRINCE UMPAD',
  'PRINCE UMPAD',
  'PRINCE UMPAD',
  'PRINCE UMPAD',
];

export default function NameScreen({ navigation }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [selected, setSelected] = useState(0);

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
      {/* Small logo top left */}
      <Image
        source={require('../assets/title.png')}
        style={styles.smallLogo}
        resizeMode="contain"
      />
      {/* Header gradient */}
      <View style={styles.headerGradient}>
        <LinearGradient
          colors={['#f97316', '#facc15']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.headerBox}
        >
          <Text style={styles.headerText}>SELECT YOUR NAME</Text>
        </LinearGradient>
      </View>
      {/* Name list */}
      <View style={styles.nameList}>
        {names.map((name, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.nameBox,
              selected === idx && styles.nameSelected,
            ]}
            onPress={() => setSelected(idx)}
            activeOpacity={0.8}
          >
            <Text style={styles.nameText}>{name}</Text>
            {selected === idx && (
              <View style={styles.checkIcon}>
                <Image
                  source={require('../assets/check.png')}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      {/* Play button gradient */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => navigation?.navigate('PasswordScreen')}
      >
        <LinearGradient
          colors={['#f97316', '#facc15']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.playButtonGradient}
        >
          <Image
            source={require('../assets/next.png')}
            style={styles.playIcon}
            resizeMode="contain"
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  smallLogo: {
    position: 'absolute',
    top: 32,
    left: 24,
    width: 120,
    height: 120,
    zIndex: 2,
  },
  headerGradient: {
    marginTop: 100,
    alignSelf: 'flex-start',
    marginLeft: 24,
    marginBottom: 8,
  },
  headerBox: {
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 10,
    minWidth: 220,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 50,
    marginLeft: -30,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'LuckiestGuy',
    letterSpacing: 1,
  },
  nameList: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  nameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginVertical: 8,
    width: '85%',
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    borderWidth: 2,
    borderColor: 'transparent',
  },
  nameSelected: {
    borderColor: '#22c55e',
  },
  nameText: {
    flex: 1,
    color: '#222',
    fontSize: 20,
    fontFamily: 'LuckiestGuy',
    letterSpacing: 1,
  },
  checkIcon: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    alignSelf: 'center',
    borderRadius: 9999,
    marginBottom: 32,
    overflow: 'hidden',
  },
  playButtonGradient: {
    padding: 18,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: 40,
    height: 40,
  },
});