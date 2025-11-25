import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch, Text, useTheme } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { toggleTheme } from '../store/themeSlice';
import { AppTheme } from '../theme';

interface ThemeToggleProps {
  showLabel?: boolean;
}

export default function ThemeToggle({ showLabel = true }: ThemeToggleProps) {
  const theme = useTheme<AppTheme>();
  const dispatch = useDispatch<AppDispatch>();
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text
          variant="bodyMedium"
          style={[styles.label, { color: theme.colors.onSurface }]}
        >
          {isDark ? '🌙 Темная тема' : '☀️ Светлая тема'}
        </Text>
      )}
      <Switch value={isDark} onValueChange={handleToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    flex: 1,
  },
});
