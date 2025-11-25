import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { AppTheme, shadows, borderRadius } from '../theme';

interface CustomCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  elevation?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function CustomCard({
  children,
  onPress,
  elevation = 'medium',
  style,
}: CustomCardProps) {
  const theme = useTheme<AppTheme>();

  const elevationStyle = shadows[elevation];

  return (
    <Card
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: borderRadius.md, // 8px border radius
        },
        elevationStyle,
        style,
      ]}
    >
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
