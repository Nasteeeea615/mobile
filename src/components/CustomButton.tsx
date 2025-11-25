import React, { useRef } from 'react';
import { StyleSheet, ViewStyle, TextStyle, Animated, Pressable } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { AppTheme, buttonSizes, buttonShadows } from '../theme';

interface CustomButtonProps {
  children: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  labelStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function CustomButton({
  children,
  onPress,
  mode = 'contained',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  contentStyle,
  labelStyle,
  fullWidth = false,
}: CustomButtonProps) {
  const theme = useTheme<AppTheme>();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const sizeStyle = buttonSizes[size];

  // Handle press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  // Get button colors based on variant and mode
  const getButtonColors = () => {
    if (mode === 'contained') {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: theme.custom.buttonPrimary,
            textColor: theme.custom.buttonPrimaryText,
          };
        case 'secondary':
          return {
            backgroundColor: theme.custom.buttonSecondary,
            textColor: theme.custom.buttonSecondaryText,
          };
        case 'danger':
          return {
            backgroundColor: theme.custom.buttonPrimary, // Black background
            textColor: theme.custom.buttonPrimaryText, // White text
          };
        default:
          return {
            backgroundColor: theme.custom.buttonPrimary,
            textColor: theme.custom.buttonPrimaryText,
          };
      }
    } else {
      // Outlined mode
      return {
        backgroundColor: 'transparent',
        textColor: variant === 'secondary' ? theme.custom.buttonSecondaryText : theme.custom.buttonPrimary,
        borderColor: variant === 'secondary' ? theme.custom.buttonSecondaryBorder : theme.custom.buttonPrimary,
      };
    }
  };

  // Get shadow based on variant
  const getShadow = () => {
    if (disabled) return {};
    
    switch (variant) {
      case 'primary':
        return buttonShadows.primary;
      case 'secondary':
        return buttonShadows.secondary;
      case 'danger':
        return buttonShadows.danger;
      default:
        return buttonShadows.primary;
    }
  };

  // Get ripple color based on variant
  const getRippleColor = () => {
    if (mode === 'contained') {
      // For contained buttons, use opposite color for ripple
      return variant === 'secondary' 
        ? 'rgba(0, 0, 0, 0.12)' // Black ripple on white button
        : 'rgba(255, 255, 255, 0.12)'; // White ripple on black button
    } else {
      // For outlined buttons, use button color for ripple
      return variant === 'secondary'
        ? 'rgba(0, 0, 0, 0.12)'
        : 'rgba(0, 0, 0, 0.12)';
    }
  };

  const buttonColors = getButtonColors();
  const shadow = getShadow();

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
      ]}
    >
      <Button
        mode={mode}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        loading={loading}
        icon={icon}
        buttonColor={buttonColors.backgroundColor}
        textColor={buttonColors.textColor}
        rippleColor={getRippleColor()}
        style={[
          styles.button,
          {
            minHeight: sizeStyle.height,
            minWidth: 44, // Ensure minimum touch target
          },
          shadow,
          mode === 'outlined' && {
            borderColor: buttonColors.borderColor,
            borderWidth: 1,
          },
          style,
        ]}
        contentStyle={[
          {
            height: sizeStyle.height,
            paddingHorizontal: sizeStyle.paddingHorizontal,
          },
          contentStyle,
        ]}
        labelStyle={[
          {
            fontSize: theme.typography.fontSizes.md,
            fontWeight: theme.typography.fontWeights.semibold,
          },
          labelStyle,
        ]}
      >
        {children}
      </Button>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  fullWidth: {
    width: '100%',
  },
});
