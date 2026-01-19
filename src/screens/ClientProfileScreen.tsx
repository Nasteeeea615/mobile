import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Divider, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout, setUser } from '../store/slices/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import apiService from '../services/api';
import { spacing } from '../theme/theme';

export default function ClientProfileScreen() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSwitchRoleModal, setShowSwitchRoleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExecutor, setIsExecutor] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector((state: any) => state.auth.user);

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
      console.error('Error checking executor registration:', error);
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
      console.error('Switch role error:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось переключить роль');
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
      console.error('Logout error:', error);
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
      console.error('Delete account error:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось удалить аккаунт');
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
      {/* User Info Card */}
      <CustomCard style={styles.userCard}>
        <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
          Личная информация
        </Text>
        
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text variant="labelMedium" style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}>
              Имя
            </Text>
            <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
              {user?.name || 'Не указано'}
            </Text>
          </View>

          <Divider style={[styles.divider, { backgroundColor: (theme as any).custom.divider }]} />

          <View style={styles.infoItem}>
            <Text variant="labelMedium" style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}>
              Номер телефона
            </Text>
            <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
              {user?.phoneNumber || user?.phone_number || 'Не указано'}
            </Text>
          </View>

          <Divider style={[styles.divider, { backgroundColor: (theme as any).custom.divider }]} />

          <View style={styles.infoItem}>
            <Text variant="labelMedium" style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}>
              Email
            </Text>
            <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
              {user?.email || 'Не указано'}
            </Text>
          </View>

          {(user?.city || user?.clientProfile) && (
            <>
              <Divider style={[styles.divider, { backgroundColor: (theme as any).custom.divider }]} />
              <View style={styles.infoItem}>
                <Text variant="labelMedium" style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}>
                  Адрес
                </Text>
                <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                  {user?.city || user?.clientProfile?.city}, {user?.street || user?.clientProfile?.street}, д. {user?.houseNumber || user?.house_number || user?.clientProfile?.houseNumber || user?.clientProfile?.house_number}
                </Text>
              </View>
            </>
          )}
        </View>
      </CustomCard>

      {/* Action Buttons */}
      <View style={styles.section}>
        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handleBecomeExecutor}
          style={styles.actionButton}
          icon="truck"
          loading={checkingRole}
        >
          Хочу стать исполнителем
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
  actionButton: {
    marginBottom: spacing.sm,
  },
});
