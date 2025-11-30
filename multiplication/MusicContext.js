import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";

const MusicContext = createContext({ isMusicOn: true, toggleMusic: () => {}, startBackgroundMusic: async () => {}, stopBackgroundMusic: async () => {} });

export function MusicProvider({ children }) {
  const [isMusicOn, setIsMusicOn] = useState(true);
  const soundRef = useRef(null);
  const pendingResumeRef = useRef(null);

  // Start background music on-demand. Does not auto-play on provider mount.
  const startBackgroundMusic = async () => {
    if (soundRef.current) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("./assets/audio/431. Cartoon.mp3"),
        { isLooping: true }
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      // Likely autoplay blocked on web; attach one-time listeners to resume on user interaction
      if (typeof document !== "undefined") {
        const resume = async () => {
          try {
            if (!soundRef.current) {
              const { sound } = await Audio.Sound.createAsync(
                require("./assets/audio/431. Cartoon.mp3"),
                { isLooping: true }
              );
              soundRef.current = sound;
            }
            await soundRef.current.playAsync().catch(() => {});
          } catch (e) {
            // ignore
          }
          document.removeEventListener("click", resume);
          document.removeEventListener("touchend", resume);
          pendingResumeRef.current = null;
        };

        pendingResumeRef.current = resume;
        document.addEventListener("click", resume);
        document.addEventListener("touchend", resume);
      }
    }
  };

  const stopBackgroundMusic = async () => {
    // remove pending resume listener if any
    if (pendingResumeRef.current && typeof document !== "undefined") {
      document.removeEventListener("click", pendingResumeRef.current);
      document.removeEventListener("touchend", pendingResumeRef.current);
      pendingResumeRef.current = null;
    }
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (e) {
        // ignore
      }
      soundRef.current = null;
    }
  };

  const toggleMusic = () => {
    setIsMusicOn((prev) => {
      const next = !prev;
      if (next) {
        // start playing when toggled on
        startBackgroundMusic().catch(() => {});
      } else {
        stopBackgroundMusic().catch(() => {});
      }
      return next;
    });
  };

  // Cleanup when provider unmounts
  useEffect(() => {
    return () => {
      stopBackgroundMusic().catch(() => {});
    };
  }, []);

  return (
    <MusicContext.Provider value={{ isMusicOn, toggleMusic, startBackgroundMusic, stopBackgroundMusic }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
