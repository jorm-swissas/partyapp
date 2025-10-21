import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtOdgCopoO3NNloRMmrkjtv0af4tkplig",
  authDomain: "rhyconnect-basel.firebaseapp.com",
  projectId: "rhyconnect-basel",
  storageBucket: "rhyconnect-basel.firebasestorage.app",
  messagingSenderId: "212684705619",
  appId: "1:212684705619:web:7a28bd2a29ddb4a7dd1ba6",
  measurementId: "G-3X776M9ZB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;