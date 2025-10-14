import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthChange } from '../services/authService';
import { setUser } from '../store/authSlice';
import { AppDispatch } from '../store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthChange((user) => {
      dispatch(setUser(user));
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
};