import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, RootState, AppDispatch } from './src/store';
import { loadThemeFromStorage } from './src/store/themeSlice';
import { lightTheme, darkTheme } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationHandler from './src/components/NotificationHandler';
import ErrorBoundary from './src/components/ErrorBoundary';
import { SnackbarProvider } from './src/components/SnackbarProvider';
import apiService from './src/services/api';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  useEffect(() => {
    dispatch(loadThemeFromStorage());
  }, [dispatch]);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <SnackbarProvider>
        <AppNavigator />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SnackbarProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
}
