import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, ViewStyle, TextStyle, Animated } from 'react-native';
import { TextInput, useTheme, HelperText } from 'react-native-paper';
import { AppTheme } from '../theme';

interface CustomInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  mode?: 'flat' | 'outlined';
  disabled?: boolean;
  error?: boolean;
  errorText?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: TextStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: any;
  // Keyboard management props
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'search' | 'send' | 'go' | 'default';
  blurOnSubmit?: boolean;
  onBlur?: () => void;
}

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  mode = 'outlined',
  disabled = false,
  error = false,
  errorText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  maxLength,
  left,
  right,
  style,
  contentStyle,
  autoCapitalize = 'sentences',
  autoComplete,
  onSubmitEditing,
  returnKeyType = 'done',
  blurOnSubmit = true,
  onBlur: onBlurProp,
}: CustomInputProps) {
  const theme = useTheme<AppTheme>();
  const [isFocused, setIsFocused] = useState(false);
  const borderAnimation = useRef(new Animated.Value(0)).current;

  // Animate border on focus/blur
  useEffect(() => {
    Animated.timing(borderAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  // Determine background color based on theme
  const backgroundColor = theme.dark 
    ? theme.custom.inputBackground // '#1A1A1A' for dark theme
    : theme.custom.inputBackground; // '#FFFFFF' for light theme

  // Determine border color based on focus state
  const borderColor = isFocused
    ? theme.custom.inputBorderFocused // Black in light, white in dark
    : error
    ? theme.colors.error
    : theme.custom.inputBorder; // Gray border when not focused

  // Determine label color based on focus state
  const labelColor = isFocused
    ? theme.custom.inputLabelFocused
    : theme.custom.inputLabel;

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlurProp) {
      onBlurProp();
    }
  };

  return (
    <>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        mode={mode}
        disabled={disabled}
        error={error}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        left={left}
        right={right}
        autoCapitalize={autoCapitalize}
        autoComplete="off"
        textContentType="none"
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        blurOnSubmit={blurOnSubmit}
        style={[
          styles.input,
          {
            backgroundColor: backgroundColor,
            minHeight: 60,
          },
          style,
        ]}
        contentStyle={[
          {
            fontSize: theme.typography.fontSizes.md,
            paddingTop: 8,
            backgroundColor: backgroundColor,
          },
          contentStyle,
        ]}
        outlineStyle={[
          styles.outline,
          {
            borderColor: borderColor,
            borderWidth: isFocused ? 2 : 1,
            backgroundColor: backgroundColor,
          },
        ]}
        underlineStyle={{
          backgroundColor: backgroundColor,
        }}
        theme={{
          colors: {
            ...theme.colors,
            onSurfaceVariant: labelColor,
            primary: theme.custom.inputLabelFocused,
            background: backgroundColor,
            surface: backgroundColor,
            surfaceVariant: backgroundColor,
          },
          animation: {
            scale: 1.0,
          },
        }}
      />
      {error && errorText && (
        <HelperText type="error" visible={error} style={styles.helperText}>
          {errorText}
        </HelperText>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 4,
  },
  outline: {
    borderRadius: 8,
  },
  helperText: {
    marginTop: -4,
    marginBottom: 8,
  },
});
