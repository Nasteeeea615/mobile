import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  isDark: boolean;
}

const initialState: ThemeState = {
  isDark: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      AsyncStorage.setItem('theme', state.isDark ? 'dark' : 'light').catch(console.error);
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload;
      AsyncStorage.setItem('theme', action.payload ? 'dark' : 'light').catch(console.error);
    },
    loadTheme: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, loadTheme } = themeSlice.actions;
export default themeSlice.reducer;

// Thunk to load theme from AsyncStorage
export const loadThemeFromStorage = () => async (dispatch: any) => {
  try {
    const savedTheme = await AsyncStorage.getItem('theme');
    if (savedTheme !== null) {
      dispatch(loadTheme(savedTheme === 'dark'));
    }
  } catch (error) {
    console.error('Failed to load theme from storage:', error);
  }
};
