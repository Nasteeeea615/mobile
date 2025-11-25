import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Spacing constants
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Light Theme Colors - Minimalist Black & White Palette
const lightColors = {
  // Base colors
  primary: '#000000',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  
  // Input fields
  inputBackground: '#FFFFFF',
  inputBorder: '#E0E0E0',
  inputBorderFocused: '#000000',
  inputLabel: '#666666',
  inputLabelFocused: '#000000',
  
  // Buttons
  buttonPrimary: '#000000',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#FFFFFF',
  buttonSecondaryText: '#000000',
  buttonSecondaryBorder: '#000000',
  
  // Text
  text: '#000000',
  textSecondary: '#666666',
  textDisabled: '#CCCCCC',
  
  // Navigation
  tabBarActive: '#000000',
  tabBarInactive: '#999999',
  tabBarBackground: '#FFFFFF',
  
  // Borders & Dividers
  border: '#E0E0E0',
  divider: '#F0F0F0',
  
  // Utility
  overlay: 'rgba(0, 0, 0, 0.5)',
  white: '#FFFFFF',
  black: '#000000',
};

// Dark Theme Colors - Minimalist Black & White Palette
const darkColors = {
  // Base colors
  primary: '#FFFFFF',
  background: '#000000',
  surface: '#1A1A1A',
  
  // Input fields
  inputBackground: '#1A1A1A',
  inputBorder: '#333333',
  inputBorderFocused: '#FFFFFF',
  inputLabel: '#999999',
  inputLabelFocused: '#FFFFFF',
  
  // Buttons
  buttonPrimary: '#FFFFFF',
  buttonPrimaryText: '#000000',
  buttonSecondary: '#1A1A1A',
  buttonSecondaryText: '#FFFFFF',
  buttonSecondaryBorder: '#FFFFFF',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#999999',
  textDisabled: '#555555',
  
  // Navigation
  tabBarActive: '#FFFFFF',
  tabBarInactive: '#666666',
  tabBarBackground: '#000000',
  
  // Borders & Dividers
  border: '#333333',
  divider: '#1A1A1A',
  
  // Utility
  overlay: 'rgba(0, 0, 0, 0.7)',
  white: '#FFFFFF',
  black: '#000000',
};

// Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    primaryContainer: lightColors.surface,
    secondary: lightColors.buttonSecondary,
    secondaryContainer: lightColors.surface,
    background: lightColors.background,
    surface: lightColors.surface,
    surfaceVariant: lightColors.surface,
    error: lightColors.black,
    errorContainer: lightColors.surface,
    onPrimary: lightColors.white,
    onSecondary: lightColors.black,
    onBackground: lightColors.text,
    onSurface: lightColors.text,
    onError: lightColors.white,
    outline: lightColors.border,
  },
  custom: lightColors,
  spacing,
  typography,
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    primaryContainer: darkColors.surface,
    secondary: darkColors.buttonSecondary,
    secondaryContainer: darkColors.surface,
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surface,
    error: darkColors.white,
    errorContainer: darkColors.surface,
    onPrimary: darkColors.black,
    onSecondary: darkColors.white,
    onBackground: darkColors.text,
    onSurface: darkColors.text,
    onError: darkColors.black,
    outline: darkColors.border,
  },
  custom: darkColors,
  spacing,
  typography,
};

export type AppTheme = typeof lightTheme;

// Button sizes (minimum 44x44px for touch targets)
export const buttonSizes = {
  small: {
    height: 44,
    paddingHorizontal: spacing.md,
  },
  medium: {
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  large: {
    height: 56,
    paddingHorizontal: spacing.xl,
  },
};

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

// Shadows
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Button Shadows - Visual differentiation through shadows
export const buttonShadows = {
  primary: {
    // Strong shadow for primary buttons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondary: {
    // Light shadow for secondary buttons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  danger: {
    // Shadow with reddish tint for danger actions
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
};

// Container Shadows
export const containerShadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};
