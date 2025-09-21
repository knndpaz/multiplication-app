import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';

export default function NameScreen({ navigation, route }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wrongPassword, setWrongPassword] = useState(route?.params?.wrongPassword || false);

  const { sessionId, level, playerId, code, selectedCharacter } = route.params || {};

  useEffect(() => {
    Font.loadAsync({
      LuckiestGuy: require('../assets/LuckiestGuy-Regular.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    async function fetchStudents() {
      try {
        console.log("Fetching students from path: students/rTPhhHNRT5gMWFsZWdrtmpUVhWd2/list");
        
        // Use the correct path that matches your Firestore structure
        const studentsRef = collection(db, "students", "rTPhhHNRT5gMWFsZWdrtmpUVhWd2", "list");
        const snap = await getDocs(studentsRef);
        
        const arr = [];
        snap.forEach(doc => {
          console.log("Student doc:", doc.id, doc.data());
          arr.push({ ...doc.data(), id: doc.id });
        });
        
        console.log("Fetched students:", arr);
        setStudents(arr);
      } catch (error) {
        console.error("Error fetching students:", error);
        
        // Show a user-friendly error message
        alert("Unable to load student list. Please check your connection and try again.");
      }
      setLoading(false);
    }
    
    fetchStudents();
  }, []);

  useEffect(() => {
    if (wrongPassword) {
      const timer = setTimeout(() => setWrongPassword(false), 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [wrongPassword]);

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient
          colors={['#4fd1ff', '#ff5fcf']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 20, fontFamily: 'LuckiestGuy', fontSize: 16 }}>
          Loading students...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4fd1ff', '#ff5fcf']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {wrongPassword && (
        <View style={styles.popup}>
          <Text style={styles.popupText}>Wrong Password! Try Again</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.headerText}>SELECT YOUR NAME</Text>
        <Text style={styles.sessionInfo}>Session: {code} | Level: {level}</Text>
      </View>
      
      {students.length === 0 ? (
        <View style={styles.noStudentsContainer}>
          <Text style={styles.noStudentsText}>
            No students found. Please contact your teacher.
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.nameList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.nameBox}
              onPress={() => navigation.navigate('PasswordScreen', { 
                studentId: item.id,
                sessionId,
                level,
                playerId,
                code,
                selectedCharacter
              })}
            >
              <Text style={styles.nameText}>
                {item.firstname} {item.lastname}
              </Text>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'LuckiestGuy',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  sessionInfo: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  nameList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginVertical: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 2,
    borderColor: 'transparent',
  },
  nameText: {
    flex: 1,
    color: '#333',
    fontSize: 18,
    fontFamily: 'LuckiestGuy',
    letterSpacing: 0.5,
  },
  arrow: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noStudentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noStudentsText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'LuckiestGuy',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  popup: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 3,
    borderColor: '#ff6b6b',
  },
  popupText: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'LuckiestGuy',
    textAlign: 'center',
  },
});