import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKt13MMM1e8431ikxsD2BNFtDnPFl6EKQ",
  authDomain: "gen-lang-client-0175090783.firebaseapp.com",
  projectId: "gen-lang-client-0175090783",
  storageBucket: "gen-lang-client-0175090783.firebasestorage.app",
  messagingSenderId: "446575417544",
  appId: "1:446575417544:web:e98353b6d9b32f0f586dfd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Support custom databaseId if declared
const db = getFirestore(app, "ai-studio-b2f38f89-9762-4156-b150-7ebdb68004fd");
const googleProvider = new GoogleAuthProvider();

export { 
  app, 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
};
