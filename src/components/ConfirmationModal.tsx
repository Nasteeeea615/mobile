import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Portal, Modal, Text, useTheme } from 'react-native-paper';
import { AppTheme, spacing, borderRadius, shadows } from '../theme';
import CustomButton from './CustomButton';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: 'default' | 'danger';
}

export default function ConfirmationModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  loading = false,
  variant = 'default',
}: ConfirmationModalProps) {
  const theme = useTheme<AppTheme>();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Enter animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 14,
          bounciness: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onCancel}
        contentContainerStyle={[
          styles.modal,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: borderRadius.lg,
          },
          shadows.large,
        ]}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text
            variant="titleLarge"
            style={[
              styles.title,
              {
                color: theme.colors.onSurface,
                fontWeight: theme.typography.fontWeights.bold,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            variant="bodyMedium"
            style={[
              styles.message,
              {
                color: theme.custom.textSecondary,
              },
            ]}
          >
            {message}
          </Text>
          <View style={styles.buttonContainer}>
            <CustomButton
              mode="contained"
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              disabled={loading}
              style={styles.confirmButton}
              fullWidth
            >
              {confirmText}
            </CustomButton>
            <CustomButton
              mode="outlined"
              variant="secondary"
              onPress={onCancel}
              disabled={loading}
              fullWidth
            >
              {cancelText}
            </CustomButton>
          </View>
        </Animated.View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    marginHorizontal: spacing.lg, // 24px - following 8px grid
  },
  content: {
    padding: spacing.lg, // 24px - following 8px grid
  },
  title: {
    marginBottom: spacing.sm, // 8px - following 8px grid
    textAlign: 'center',
  },
  message: {
    marginBottom: spacing.lg, // 24px - following 8px grid
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: spacing.sm, // 8px - following 8px grid
  },
  confirmButton: {
    marginBottom: 0,
  },
});
