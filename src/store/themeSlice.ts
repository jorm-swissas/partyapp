import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeState, ThemeMode } from '../types';
import { lightTheme, darkTheme } from '../theme/colors';
import { Appearance } from 'react-native';

const getSystemTheme = (): boolean => {
  return Appearance.getColorScheme() === 'dark';
};

const getEffectiveTheme = (mode: ThemeMode): boolean => {
  switch (mode) {
    case 'light':
      return false;
    case 'dark':
      return true;
    case 'auto':
      return getSystemTheme();
    default:
      return getSystemTheme();
  }
};

const initialState: ThemeState = {
  mode: 'auto',
  isDark: getSystemTheme(),
  colors: getSystemTheme() ? darkTheme : lightTheme,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      state.isDark = getEffectiveTheme(action.payload);
      state.colors = state.isDark ? darkTheme : lightTheme;
    },
    updateSystemTheme: (state) => {
      if (state.mode === 'auto') {
        state.isDark = getSystemTheme();
        state.colors = state.isDark ? darkTheme : lightTheme;
      }
    },
  },
});

export const { setThemeMode, updateSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;