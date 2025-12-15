import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import * as Font from "expo-font";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function TitleScreen({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isPlayHovered, setIsPlayHovered] = useState(false);
  const [floatingElements] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      symbol: ["➕", "➖", "✖️", "➗", "🌟", "⭐", "💫", "✨", "🎯", "🎮"][
        Math.floor(Math.random() * 10)
      ],
      animValue: new Animated.Value(0),
      left: Math.random() * 100,
      duration: 12000 + Math.random() * 8000,
      delay: Math.random() * 5000,
      size: 20 + Math.random() * 20,
    }))
  );

  const logoScale = useRef(new Animated.Value(1)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const playButtonBounce = useRef(new Animated.Value(0)).current;
  const playIconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Load fonts
    Font.loadAsync({
      BernerBasisschrift1: require("../assets/fonts/BernerBasisschrift1.ttf"),
    }).then(() => {
      setFontsLoaded(true);
    });
  }, []);

  // Play welcome voice audio once when component mounts
  useEffect(() => {
    const playAudio = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/Voice Records/Welcome.m4a")
        );
        await sound.playAsync();
        setTimeout(() => sound.unloadAsync(), 5000); // Unload after 5 seconds
      } catch (error) {
        console.error("Error playing welcome audio:", error);
      }
    };

    playAudio();
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;

    // Start floating animations
    floatingElements.forEach((element) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(element.delay),
          Animated.timing(element.animValue, {
            toValue: 1,
            duration: element.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Logo bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Play button gentle bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(playButtonBounce, {
          toValue: -10,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(playButtonBounce, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Play icon pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(playIconScale, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(playIconScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fontsLoaded]);

  const handleLogoPress = () => {
    // Bounce animation on press
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1.1,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePlayPress = async () => {
    // Play sound effect
    try {
      const { sound: popSound } = await Audio.Sound.createAsync(
        require("../assets/audio/pop.mp3")
      );
      await popSound.playAsync();
      // Unload after playing to free memory
      setTimeout(() => {
        popSound.unloadAsync();
      }, 1000);
    } catch (error) {
      console.error("Error playing pop sound:", error);
    }

    Animated.parallel([
      Animated.sequence([
        Animated.timing(playButtonScale, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(playButtonScale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(playIconScale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(playIconScale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Check if there's a session code in route params (passed from App.js)
      const { session } = route.params || {};
      if (session) {
        setTimeout(() => navigation?.navigate("CodeScreen", { session }), 200);
      } else {
        setTimeout(() => navigation?.navigate("CodeScreen"), 200);
      }
    });
  };

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "5deg"],
  });

  if (!fontsLoaded) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <LinearGradient
          colors={["#4fd1ff", "#5b9cf5", "#ff5fcf"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={["#4fd1ff", "#5b9cf5", "#ff5fcf"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Overlay image */}
      <Image
        source={require("../assets/bgoverlay.png")}
        style={[
          StyleSheet.absoluteFillObject,
          { width: "100%", height: "100%", opacity: 0.3 },
        ]}
        resizeMode="cover"
      />

      {/* Floating Math Symbols */}
      {floatingElements.map((element) => {
        const translateY = element.animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [height + 100, -100],
        });

        return (
          <Animated.Text
            key={element.id}
            style={[
              styles.floatingSymbol,
              {
                left: `${element.left}%`,
                fontSize: Math.min(element.size, width * 0.06),
                transform: [{ translateY }],
              },
            ]}
          >
            {element.symbol}
          </Animated.Text>
        );
      })}

      {/* Content */}
      <View style={styles.content}>
        {/* Logo with Animation */}
        <TouchableOpacity
          onPress={handleLogoPress}
          activeOpacity={0.9}
          style={[styles.logoContainer, { marginTop: -height * 0.05 }]}
        >
          <Animated.View
            style={{
              transform: [{ scale: logoScale }, { rotate: logoRotation }],
            }}
          >
            <Image
              source={require("../assets/title.png")}
              style={[
                styles.logo,
                {
                  width: Math.min(width * 0.85, 600),
                  height: Math.min(width * 0.45, 300),
                },
              ]}
              resizeMode="contain"
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Subtitle */}
        <Text
          style={[styles.subtitle, { fontSize: Math.min(width * 0.07, 32) }]}
        >
          Let's learn math and play! ✨🎮
        </Text>

        {/* Play Button */}
        <Animated.View
          style={{
            transform: [
              { translateY: playButtonBounce },
              { scale: playButtonScale },
            ],
          }}
        >
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPress}
            onPressIn={() => setIsPlayHovered(true)}
            onPressOut={() => setIsPlayHovered(false)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#f97316", "#facc15"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={[
                styles.playButtonGradient,
                {
                  paddingHorizontal: Math.min(width * 0.1, 40),
                  paddingVertical: Math.min(height * 0.025, 18),
                },
              ]}
            >
              {/* YouTube-style Play Icon */}
              <Animated.View
                style={[
                  styles.playIconCircle,
                  {
                    width: Math.min(width * 0.12, 50),
                    height: Math.min(width * 0.12, 50),
                    borderRadius: Math.min(width * 0.06, 25),
                  },
                  { transform: [{ scale: playIconScale }] },
                ]}
              >
                <View
                  style={[
                    styles.playTriangle,
                    {
                      borderLeftWidth: Math.min(width * 0.04, 18),
                      borderBottomWidth: Math.min(width * 0.025, 12),
                      borderTopWidth: Math.min(width * 0.025, 12),
                    },
                  ]}
                />
              </Animated.View>
              <Text
                style={[
                  styles.playText,
                  { fontSize: Math.min(width * 0.09, 38) },
                ]}
              >
                PLAY
              </Text>
            </LinearGradient>
            {/* Glow effect */}
            {isPlayHovered && <View style={styles.glowEffect} />}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    paddingHorizontal: 16,
  },
  floatingSymbol: {
    position: "absolute",
    opacity: 0.6,
    zIndex: 1,
  },

  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 600,
    height: 300,
  },
  subtitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    fontFamily: "BernerBasisschrift1",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  playButton: {
    marginTop: 12,
    borderRadius: 60,
    overflow: "hidden",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    fontWeight: "bold",
  },
  playButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 60,
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  playIconCircle: {
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 4,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 18,
    borderRightWidth: 0,
    borderBottomWidth: 12,
    borderTopWidth: 12,
    borderLeftColor: "#f97316",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderTopColor: "transparent",
  },
  playText: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "900",
    fontFamily: "BernerBasisschrift1",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 3,
  },
  glowEffect: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    backgroundColor: "#facc15",
    opacity: 0.3,
    zIndex: -1,
  },
});
