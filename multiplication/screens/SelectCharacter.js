import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const characters = [
  require('../assets/player1.png'),
  require('../assets/player2.png'),
  require('../assets/player3.png'),
  require('../assets/player4.png'),
];

export default function SelectCharacter({ navigation, route }) {
  const [selected, setSelected] = useState(0); // Default to first character

  // Get route params
  const { sessionId, level, playerId, code } = route.params || {};

  const handleContinue = () => {
    // Pass selected character to NameScreen
    navigation.navigate('NameScreen', {
      sessionId,
      level,
      playerId,
      code,
      selectedCharacter: selected
    });
  };

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
          <Text style={styles.headerText}>SELECT A CHARACTER</Text>
        </LinearGradient>
      </View>
      {/* Character grid */}
      <View style={styles.grid}>
        {characters.map((src, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.characterBox,
              selected === idx && styles.characterSelected,
            ]}
            onPress={() => setSelected(idx)}
            activeOpacity={0.8}
          >
            <Image source={src} style={styles.characterImg} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </View>
      {/* Continue button - only show if character is selected */}
      {selected !== null && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={handleContinue}
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
      )}
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
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 48,
  },
  characterBox: {
    width: 160,
    height: 160,
    margin: 12,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  characterSelected: {
    borderColor: '#facc15',
    backgroundColor: '#fffde7',
    elevation: 6,
    shadowColor: '#facc15',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  characterImg: {
    width: 140,
    height: 140,
  },
  playButton: {
    alignSelf: 'center',
    borderRadius: 9999,
    marginBottom: 32,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
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