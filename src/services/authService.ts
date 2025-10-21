// Real Firebase Auth Service
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Export the AuthUser interface
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  createdAt: string;
}

// Register a new user
export const registerUser = async (
  email: string,
  password: string,
  username: string,
  displayName: string
): Promise<AuthUser> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, {
      displayName: displayName
    });

    // Create user document in Firestore
    const userData: AuthUser = {
      id: user.uid,
      email: user.email!,
      username: username,
      displayName: displayName,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return userData;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Failed to register user');
  }
};

// Login existing user
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (userDoc.exists()) {
      return userDoc.data() as AuthUser;
    } else {
      // If user document doesn't exist, create it (migration case)
      const userData: AuthUser = {
        id: user.uid,
        email: user.email!,
        username: user.email!.split('@')[0],
        displayName: user.displayName || user.email!.split('@')[0],
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      return userData;
    }
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Failed to login');
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(error.message || 'Failed to logout');
  }
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      // User is signed in, get their data from Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          callback(userDoc.data() as AuthUser);
        } else {
          // Create user document if it doesn't exist
          const userData: AuthUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            username: firebaseUser.email!.split('@')[0],
            displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
          callback(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        callback(null);
      }
    } else {
      // User is signed out
      callback(null);
    }
  });
};