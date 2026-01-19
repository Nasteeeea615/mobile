import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { AppTheme, spacing, containerShadows } from '../theme';

const SupportScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme<AppTheme>();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string; description?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { subject?: string; description?: string } = {};

    if (!subject.trim()) {
      newErrors.subject = 'Тема обязательна';
    } else if (subject.length > 200) {
      newErrors.subject = 'Тема не должна превышать 200 символов';
    }

    if (!description.trim()) {
      newErrors.description = 'Описание обязательно';
    } else if (description.length < 10) {
      newErrors.description = 'Описание должно содержать минимум 10 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/support/tickets', {
        subject: subject.trim(),
        description: description.trim(),
      });

      Alert.alert(
        'Успешно',
        'Ваше обращение отправлено. Мы свяжемся с вами в ближайшее время.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSubject('');
              setDescription('');
              navigation.navigate('TicketHistory');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      Alert.alert(
        'Ошибка',
        error.message || 'Не удалось отправить обращение. Попробуйте позже.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = () => {
    navigation.navigate('TicketHistory');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.custom.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <CustomInput
            label="Тема обращения"
            value={subject}
            onChangeText={(text) => {
              setSubject(text);
              if (errors.subject) {
                setErrors({ ...errors, subject: undefined });
              }
            }}
            error={!!errors.subject}
            errorText={errors.subject}
            disabled={loading}
            style={styles.input}
          />

          <CustomInput
            label="Описание проблемы"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) {
                setErrors({ ...errors, description: undefined });
              }
            }}
            multiline
            numberOfLines={6}
            error={!!errors.description}
            errorText={errors.description}
            disabled={loading}
            style={[styles.input, styles.textArea]}
          />

          <CustomButton
            mode="contained"
            variant="primary"
            onPress={handleSubmit}
            disabled={loading}
            loading={loading}
            fullWidth
            style={styles.submitButton}
          >
            Отправить обращение
          </CustomButton>

          <CustomButton
            mode="outlined"
            variant="secondary"
            onPress={handleViewHistory}
            disabled={loading}
            fullWidth
            style={styles.historyButton}
          >
            История обращений
          </CustomButton>
        </View>

        <View style={[styles.info, { backgroundColor: theme.custom.surface }, containerShadows.card]}>
          <Text variant="bodySmall" style={[styles.infoText, { color: theme.custom.textSecondary }]}>
            Мы стараемся отвечать на все обращения в течение 24 часов.
            Вы получите уведомление, когда мы ответим на ваше обращение.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  form: {
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 120,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  historyButton: {
    marginTop: spacing.md,
  },
  info: {
    padding: spacing.md,
    borderRadius: 8,
  },
  infoText: {
    textAlign: 'center',
  },
});

export default SupportScreen;
