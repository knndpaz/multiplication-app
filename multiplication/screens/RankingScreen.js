import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const rankings = [
  { name: 'Prince Umpad', score: 100 },
  { name: 'Princess Numpad', score: 90 },
  { name: '', score: 0 },
  { name: '', score: 0 },
  { name: '', score: 0 },
  { name: '', score: 0 },
  { name: '', score: 0 },
  { name: '', score: 0 },
];

export default function RankingScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4fd1ff', '#ff5fcf']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Image
        source={require('../assets/title.png')}
        style={styles.smallLogo}
        resizeMode="contain"
      />
      <Text style={styles.headerText}>RANKING</Text>
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 40 }}>
        {rankings.map((rank, idx) => (
          <View key={idx} style={styles.rankRow}>
            <View style={styles.rankBar}>
              <Text style={styles.rankName}>{rank.name}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
  headerText: {
    marginTop: 80,
    alignSelf: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    color: '#222',
    letterSpacing: 1,
    marginBottom: 24,
  },
  scrollArea: {
    marginTop: 12,
    marginHorizontal: 0,
    width: '100%',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 0,
  },
  rankBar: {
    backgroundColor: '#e5e7eb',
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 8,
    minWidth: '70%',
    marginLeft: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  rankName: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    color: '#222',
  },
});