import React, { useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

export default function AutoJoinScreen({ navigation, route }) {
  const { session } = route.params || {};

  useEffect(() => {
    const autoJoin = async () => {
      if (!session) {
        navigation.navigate("TitleScreen");
        return;
      }

      try {
        console.log("Auto-joining session with code:", session);

        const q = query(
          collection(db, "sessions"),
          where("code", "==", session.trim())
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          console.error("Session not found for auto-join");
          navigation.navigate("TitleScreen");
          return;
        }

        const sessionDoc = snap.docs[0];
        const sessionData = sessionDoc.data();

        console.log("Found session:", sessionData);

        if (sessionData.status === "completed") {
          console.error("Session has ended");
          navigation.navigate("TitleScreen");
          return;
        }

        const playerId =
          "player-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);

        await updateDoc(doc(db, "sessions", sessionDoc.id), {
          players: arrayUnion(playerId),
        });

        console.log("Successfully auto-joined session, navigating to SelectCharacter");

        navigation.navigate("SelectCharacter", {
          sessionId: sessionDoc.id,
          level: sessionData.level,
          playerId,
          code: session.trim(),
        });
      } catch (error) {
        console.error("Error auto-joining session:", error);
        navigation.navigate("TitleScreen");
      }
    };

    autoJoin();
  }, [session, navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4fd1ff", "#5b9cf5", "#ff5fcf"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.text}>Joining session...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
});
