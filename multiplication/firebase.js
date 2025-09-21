import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALdS-E8fpyZX2kb8EGsm3n2fdlxiIXPLw",
  authDomain: "multiplication-66b2b.firebaseapp.com",
  projectId: "multiplication-66b2b",
  storageBucket: "multiplication-66b2b.appspot.com",
  messagingSenderId: "229593363724",
  appId: "1:229593363724:web:9a4f127049079ceffd4529"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };