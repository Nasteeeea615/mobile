import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Divider, IconButton, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout, setUser } from '../store/slices/authSlice';
import { toggleTheme } from '../store/themeSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import { useSnackbarHelpers } from '../components/SnackbarProvider';
import apiService from '../services/api';
import { AppTheme, spacing } from '../theme/theme';
import { USER_AGREEMENT, PRIVACY_POLICY, PERSONAL_DATA_CONSENT } from '../constants/documents';

export default function ClientProfileScreen() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSwitchRoleModal, setShowSwitchRoleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExecutor, setIsExecutor] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const theme = useTheme<AppTheme>();
  const { showError } = useSnackbarHelpers();
  const user = useSelector((state: any) => state.auth.user);
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  // Проверка регистрации как исполнитель
  useEffect(() => {
    checkExecutorRegistration();
  }, []);

  const checkExecutorRegistration = async () => {
    setCheckingRole(true);
    try {
      const response = await apiService.get('/check-role/executor');
      if (response.success && response.data) {
        setIsExecutor((response.data as any).isRegistered);
      }
    } catch (error) {
      console.error('Ошибка проверки регистрации исполнителя:', error);
    } finally {
      setCheckingRole(false);
    }
  };

  const handleBecomeExecutor = async () => {
    if (isExecutor) {
      // Уже зарегистрирован - показать диалог переключения
      setShowSwitchRoleModal(true);
    } else {
      // Не зарегистрирован - перейти на регистрацию
      navigation.navigate('ExecutorRegistration', {
        prefillData: {
          name: user?.name,
          phoneNumber: user?.phoneNumber || user?.phone_number,
          email: user?.email,
        },
      });
    }
  };

  const handleSwitchToExecutor = async () => {
    setLoading(true);
    try {
      const response = await apiService.post('/switch-role', {
        newRole: 'executor',
      });

      if (response.success && response.data) {
        const data = response.data as any;
        // Обновить токен и пользователя
        await apiService.setToken(data.token);
        dispatch(setUser(data.user));

        setShowSwitchRoleModal(false);

        // Перейти на профиль исполнителя
        navigation.reset({
          index: 0,
          routes: [{ name: 'ExecutorTabs' }],
        });
      }
    } catch (error: any) {
      console.error('Ошибка переключения роли:', error);
      showError(error.message || 'Не удалось переключить роль');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await apiService.post('/auth/logout');
      dispatch(logout());
      await apiService.clearToken();
      setShowLogoutModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'EmailInput' }],
      });
    } catch (error) {
      console.error('Ошибка выхода из аккаунта:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await apiService.delete('/account');
      dispatch(logout());
      await apiService.clearToken();
      setShowDeleteModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'EmailInput' }],
      });
    } catch (error: any) {
      console.error('Ошибка удаления аккаунта:', error);
      showError(error.message || 'Не удалось удалить аккаунт');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', {
      userType: 'client',
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.topActions}>
        <IconButton
          onPress={() => dispatch(toggleTheme())}
          icon={isDark ? 'weather-sunny' : 'weather-night'}
          mode="outlined"
          size={20}
          accessibilityLabel={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
          style={styles.themeButton}
        />
      </View>

      {/* User Info Card */}
      <CustomCard style={styles.userCard}>
        <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
          Личная информация
        </Text>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text
              variant="labelMedium"
              style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}
            >
              Имя
            </Text>
            <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
              {user?.name || 'Не указано'}
            </Text>
          </View>

          <Divider style={[styles.divider, { backgroundColor: (theme as any).custom.divider }]} />

          <View style={styles.infoItem}>
            <Text
              variant="labelMedium"
              style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}
            >
              Номер телефона
            </Text>
            <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
              {user?.phoneNumber || user?.phone_number || 'Не указано'}
            </Text>
          </View>

          <Divider style={[styles.divider, { backgroundColor: (theme as any).custom.divider }]} />

          <View style={styles.infoItem}>
            <Text
              variant="labelMedium"
              style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}
            >
              Email
            </Text>
            <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
              {user?.email || 'Не указано'}
            </Text>
          </View>

          {(user?.city || user?.clientProfile) && (
            <>
              <Divider
                style={[styles.divider, { backgroundColor: (theme as any).custom.divider }]}
              />
              <View style={styles.infoItem}>
                <Text
                  variant="labelMedium"
                  style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}
                >
                  Адрес
                </Text>
                <Text
                  variant="bodyLarge"
                  style={[styles.infoValue, { color: theme.colors.onSurface }]}
                >
                  {user?.city || user?.clientProfile?.city},{' '}
                  {user?.street || user?.clientProfile?.street}, д.{' '}
                  {user?.houseNumber ||
                    user?.house_number ||
                    user?.clientProfile?.houseNumber ||
                    user?.clientProfile?.house_number}
                </Text>
              </View>
            </>
          )}
        </View>
      </CustomCard>

      {/* Action Buttons */}
      <View style={styles.section}>
        {isExecutor && (
          <Text
            variant="bodyMedium"
            style={[styles.roleHint, { color: theme.custom.textSecondary }]}
          >
            Доступен второй аккаунт: исполнитель
          </Text>
        )}

        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handleBecomeExecutor}
          style={styles.actionButton}
          icon={isExecutor ? 'swap-horizontal' : 'truck'}
          loading={checkingRole}
        >
          {isExecutor ? 'Перейти в аккаунт исполнителя' : 'Стать исполнителем'}
        </CustomButton>

        <CustomButton
          mode="outlined"
          variant="secondary"
          onPress={handleEditProfile}
          style={styles.actionButton}
          icon="account-edit"
        >
          Редактировать аккаунт
        </CustomButton>

        <CustomButton
          mode="outlined"
          variant="secondary"
          onPress={() => setShowLogoutModal(true)}
          style={styles.actionButton}
          icon="logout"
        >
          Выйти из аккаунта
        </CustomButton>

        <CustomButton
          mode="outlined"
          variant="danger"
          onPress={() => setShowDeleteModal(true)}
          style={styles.actionButton}
          icon="delete"
        >
          Удалить аккаунт
        </CustomButton>
      </View>

      {/* О сервисе */}
      <View style={styles.section}>
        <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.custom.textSecondary }]}>
          О сервисе
        </Text>
        <CustomButton
          mode="text"
          variant="secondary"
          onPress={() => navigation.navigate('LegalDocument' as never, { document: USER_AGREEMENT } as never)}
          style={styles.docButton}
          icon="file-document-outline"
        >
          Пользовательское соглашение
        </CustomButton>
        <CustomButton
          mode="text"
          variant="secondary"
          onPress={() => navigation.navigate('LegalDocument' as never, { document: PRIVACY_POLICY } as never)}
          style={styles.docButton}
          icon="shield-lock-outline"
        >
          Политика конфиденциальности
        </CustomButton>
        <CustomButton
          mode="text"
          variant="secondary"
          onPress={() => navigation.navigate('LegalDocument' as never, { document: PERSONAL_DATA_CONSENT } as never)}
          style={styles.docButton}
          icon="clipboard-check-outline"
        >
          Согласие на обработку ПД
        </CustomButton>
      </View>

      {/* Switch Role Modal */}
      <ConfirmationModal
        visible={showSwitchRoleModal}
        title="Переключиться на исполнителя?"
        message="Вы уже зарегистрированы как исполнитель. Переключиться на аккаунт исполнителя?"
        onConfirm={handleSwitchToExecutor}
        onCancel={() => setShowSwitchRoleModal(false)}
        confirmText="Да"
        cancelText="Нет"
        loading={loading}
      />

      {/* Logout Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        title="Выход из аккаунта"
        message="Вы уверены, что хотите выйти?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Выйти"
        loading={loading}
      />

      {/* Delete Account Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Удаление аккаунта"
        message="Это удалит все ваши данные навсегда! Вы уверены?"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Удалить"
        loading={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  topActions: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  themeButton: {
    marginRight: 0,
  },
  userCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  infoSection: {
    gap: 0,
  },
  infoItem: {
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: spacing.xs,
  },
  section: {
    marginBottom: spacing.md,
  },
  roleHint: {
    marginBottom: spacing.sm,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  docButton: {
    marginBottom: 0,
    alignSelf: 'flex-start',
  },
});
