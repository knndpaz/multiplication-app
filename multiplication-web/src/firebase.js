import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALdS-E8fpyZX2kb8EGsm3n2fdlxiIXPLw",
  authDomain: "multiplication-66b2b.firebaseapp.com",
  projectId: "multiplication-66b2b",
  storageBucket: "multiplication-66b2b.firebasestorage.app",
  messagingSenderId: "229593363724",
  appId: "1:229593363724:web:9a4f127049079ceffd4529",
  measurementId: "G-1Q91CLNT3R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
