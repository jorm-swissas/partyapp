import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState, LoginForm, RegisterForm } from '../types';

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isLoggedIn = false;
      state.user = null;
    },
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isLoggedIn = false;
      state.user = null;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Mock Login Function (später durch echte API ersetzen)
export const mockLogin = (loginData: LoginForm) => (dispatch: any) => {
  dispatch(authSlice.actions.loginStart());
  
  // Simuliere API Call
  setTimeout(() => {
    // Mock User Data
    const mockUser: User = {
      id: Date.now().toString(),
      username: loginData.email.split('@')[0],
      email: loginData.email,
      displayName: loginData.email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    
    // Einfache Mock-Validierung
    if (loginData.email && loginData.password) {
      dispatch(authSlice.actions.loginSuccess(mockUser));
    } else {
      dispatch(authSlice.actions.loginFailure('Email und Passwort sind erforderlich'));
    }
  }, 1000);
};

// Mock Register Function (später durch echte API ersetzen)
export const mockRegister = (registerData: RegisterForm) => (dispatch: any) => {
  dispatch(authSlice.actions.registerStart());
  
  // Simuliere API Call
  setTimeout(() => {
    // Validierung
    if (registerData.password !== registerData.confirmPassword) {
      dispatch(authSlice.actions.registerFailure('Passwörter stimmen nicht überein'));
      return;
    }
    
    if (!registerData.email || !registerData.password || !registerData.username) {
      dispatch(authSlice.actions.registerFailure('Alle Felder sind erforderlich'));
      return;
    }
    
    // Mock User Data
    const mockUser: User = {
      id: Date.now().toString(),
      username: registerData.username,
      email: registerData.email,
      displayName: registerData.displayName || registerData.username,
      createdAt: new Date().toISOString(),
    };
    
    dispatch(authSlice.actions.registerSuccess(mockUser));
  }, 1000);
};

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  registerStart, 
  registerSuccess, 
  registerFailure, 
  logout, 
  clearError 
} = authSlice.actions;

export default authSlice.reducer;