import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User, AuthState, LoginForm, RegisterForm } from '../types';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  onAuthChange,
  getCurrentUser,
  AuthUser 
} from '../services/authService';

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
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      if (action.payload) {
        state.user = action.payload;
        state.isLoggedIn = true;
      } else {
        state.user = null;
        state.isLoggedIn = false;
      }
    },
  },
  extraReducers: (builder) => {
    // Firebase Login
    builder
      .addCase(firebaseLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(firebaseLogin.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(firebaseLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isLoggedIn = false;
        state.user = null;
      })
      // Firebase Register
      .addCase(firebaseRegister.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(firebaseRegister.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(firebaseRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isLoggedIn = false;
        state.user = null;
      })
      // Firebase Logout
      .addCase(firebaseLogout.fulfilled, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.isLoading = false;
        state.error = null;
      })
      // Initialize Auth
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isLoggedIn = true;
        }
      });
  },
});

// Firebase Auth Async Thunks
export const firebaseLogin = createAsyncThunk(
  'auth/firebaseLogin',
  async (loginData: LoginForm, { rejectWithValue }) => {
    try {
      const user = await loginUser(loginData.email, loginData.password);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const firebaseRegister = createAsyncThunk(
  'auth/firebaseRegister',
  async (registerData: RegisterForm, { rejectWithValue }) => {
    try {
      // Validierung
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Passwörter stimmen nicht überein');
      }
      
      if (!registerData.email || !registerData.password || !registerData.username) {
        throw new Error('Alle Felder sind erforderlich');
      }

      const user = await registerUser(
        registerData.email,
        registerData.password,
        registerData.username,
        registerData.displayName || registerData.username
      );
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const firebaseLogout = createAsyncThunk(
  'auth/firebaseLogout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Initialize auth state from Firebase
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async () => {
    const user = getCurrentUser();
    return user;
  }
);

export const { 
  logout, 
  clearError,
  setUser 
} = authSlice.actions;

export default authSlice.reducer;