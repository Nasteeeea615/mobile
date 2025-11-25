import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface KeyboardDismissWrapperProps {
  children: React.ReactNode;
  enabled?: boolean;
  scrollEnabled?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

/**
 * KeyboardDismissWrapper - компонент для умного управления клавиатурой
 * 
 * Функции:
 * - Автоматически скрывает клавиатуру при тапе вне полей ввода
 * - Предотвращает перекрытие полей ввода клавиатурой (KeyboardAvoidingView)
 * - Обеспечивает правильную обработку тапов на интерактивных элементах
 * - Поддерживает iOS и Android
 */
const KeyboardDismissWrapper: React.FC<KeyboardDismissWrapperProps> = ({
  children,
  enabled = true,
  scrollEnabled = true,
  contentContainerStyle,
  style,
}) => {
  const handleDismiss = () => {
    if (enabled) {
      Keyboard.dismiss();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleDismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, style]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          scrollEnabled={scrollEnabled}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default KeyboardDismissWrapper;
