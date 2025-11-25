import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProfileState {
  theme: 'light' | 'dark';
}

const initialState: ProfileState = {
  theme: 'light',
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: state => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { setTheme, toggleTheme } = profileSlice.actions;
export default profileSlice.reducer;
