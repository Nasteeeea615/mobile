import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, Switch, Avatar, Divider, useTheme, IconButton, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { toggleTheme } from '../store/slices/profileSlice';
import { logout, setUser } from '../store/slices/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import apiService from '../services/api';
import { spacing, containerShadows } from '../theme/theme';

export default function ExecutorProfileScreen() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector((state: any) => state.auth.user);
  const themeMode = useSelector((state: any) => state.profile.theme);

  const isDarkTheme = themeMode === 'dark';

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await apiService.post('/auth/logout');
      dispatch(logout());
      apiService.clearToken();
      setShowLogoutModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'PhoneInput' }],
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
      await apiService.delete('/profile');
      dispatch(logout());
      apiService.clearToken();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Ошибка удаления аккаунта');
    } finally {
      setLoading(false);
    }
  };

  const executorProfile = user?.executorProfile || user?.executor_profile;

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleEditProfile = () => {
    navigation.navigate('EditExecutorProfile');
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Ошибка', 'Необходимо разрешение на доступ к галерее');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadProfilePhoto(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const uploadProfilePhoto = async (uri: string) => {
    setLoading(true);
    try {
      const response = await apiService.post('/profile/photo', {
        photo: uri,
      });

      if (response.success && response.data) {
        const data = response.data as any;
        dispatch(setUser(data.user));
        Alert.alert('Успешно', 'Фото профиля обновлено');
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Не удалось загрузить фото');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* User Info Card */}
      <CustomCard style={styles.userCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.profilePhoto || user?.profile_photo ? (
              <Avatar.Image
                size={60}
                source={{ uri: user.profilePhoto || user.profile_photo }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text
                size={60}
                label={getInitials(user?.name || 'User')}
                style={[
                  styles.avatar,
                  { backgroundColor: isDarkTheme ? '#FFFFFF' : '#000000' }
                ]}
                labelStyle={{ color: isDarkTheme ? '#000000' : '#FFFFFF' }}
              />
            )}
            <TouchableOpacity 
              style={[styles.cameraIcon, { backgroundColor: theme.colors.primary }]}
              onPress={handlePickImage}
              disabled={loading}
            >
              <IconButton
                icon="camera"
                size={12}
                iconColor={isDarkTheme ? '#000000' : '#FFFFFF'}
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.nameContainer}>
            <Text 
              variant="headlineSmall" 
              style={[styles.name, { color: theme.colors.onSurface }]}
            >
              {user?.name || 'Исполнитель'}
            </Text>
            
            <Text 
              variant="bodyMedium" 
              style={[styles.phone, { color: (theme as any).custom.textSecondary }]}
            >
              {user?.phoneNumber || user?.phone_number}
            </Text>
          </View>
        </View>

        {/* Executor-specific information */}
        {executorProfile && (
          <View style={styles.executorInfoContainer}>
            <View style={styles.infoRow}>
              <Text 
                variant="bodyMedium" 
                style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}
              >
                🚛 {executorProfile.vehicleNumber || executorProfile.vehicle_number}
              </Text>
              <Text 
                variant="bodyMedium" 
                style={[styles.infoValue, { color: (theme as any).custom.textSecondary }]}
              >
                {executorProfile.vehicleCapacity || executorProfile.vehicle_capacity} м³
              </Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text 
                  variant="bodySmall" 
                  style={{ color: (theme as any).custom.textSecondary }}
                >
                  Рейтинг
                </Text>
                <Text 
                  variant="titleMedium" 
                  style={{ color: theme.colors.onSurface }}
                >
                  ⭐ {executorProfile.rating || 0}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text 
                  variant="bodySmall" 
                  style={{ color: (theme as any).custom.textSecondary }}
                >
                  Заказов
                </Text>
                <Text 
                  variant="titleMedium" 
                  style={{ color: theme.colors.onSurface }}
                >
                  {executorProfile.completedOrdersCount || executorProfile.completed_orders_count || 0}
                </Text>
              </View>
            </View>

            {!executorProfile.isVerified && !executorProfile.is_verified && (
              <View style={styles.verificationBanner}>
                <Text 
                  variant="bodySmall" 
                  style={[styles.verificationNote, { color: (theme as any).custom.textSecondary }]}
                >
                  ⚠️ Ваш аккаунт ожидает проверки администратором
                </Text>
              </View>
            )}
          </View>
        )}

        <CustomButton
          mode="outlined"
          variant="secondary"
          onPress={handleEditProfile}
          style={styles.editButton}
          icon="account-edit"
        >
          Редактировать профиль
        </CustomButton>
      </CustomCard>

      {/* Documents Section */}
      {executorProfile?.documents && (
        <View style={styles.section}>
          <Text 
            variant="titleMedium" 
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Документы
          </Text>
          
          <CustomCard style={styles.documentsCard}>
            <View style={styles.documentItem}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                📄 Паспорт
              </Text>
              {executorProfile.documents.passportPhoto || executorProfile.documents.passport_photo ? (
                <Chip 
                  icon="check" 
                  style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
                  textStyle={{ color: '#4CAF50' }}
                >
                  Загружен
                </Chip>
              ) : (
                <Chip 
                  icon="close" 
                  style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)' }}
                  textStyle={{ color: '#F44336' }}
                >
                  Не загружен
                </Chip>
              )}
            </View>

            <Divider style={{ backgroundColor: (theme as any).custom.divider, marginVertical: spacing.sm }} />

            <View style={styles.documentItem}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                🪪 Водительское удостоверение
              </Text>
              {executorProfile.documents.driverLicensePhoto || executorProfile.documents.driver_license_photo ? (
                <Chip 
                  icon="check" 
                  style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
                  textStyle={{ color: '#4CAF50' }}
                >
                  Загружен
                </Chip>
              ) : (
                <Chip 
                  icon="close" 
                  style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)' }}
                  textStyle={{ color: '#F44336' }}
                >
                  Не загружен
                </Chip>
              )}
            </View>

            <Divider style={{ backgroundColor: (theme as any).custom.divider, marginVertical: spacing.sm }} />

            <View style={styles.documentItem}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                🚗 Свидетельство о регистрации ТС
              </Text>
              {executorProfile.documents.vehicleRegistrationPhoto || executorProfile.documents.vehicle_registration_photo ? (
                <Chip 
                  icon="check" 
                  style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
                  textStyle={{ color: '#4CAF50' }}
                >
                  Загружен
                </Chip>
              ) : (
                <Chip 
                  icon="close" 
                  style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)' }}
                  textStyle={{ color: '#F44336' }}
                >
                  Не загружен
                </Chip>
              )}
            </View>
          </CustomCard>
        </View>
      )}

      {/* Settings Section */}
      <View style={styles.section}>
        <Text 
          variant="titleMedium" 
          style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
        >
          Настройки
        </Text>

        <CustomCard style={styles.settingsCard}>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('ClientTabs')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>🔄</Text>
              </View>
              <View>
                <Text 
                  variant="bodyLarge" 
                  style={{ color: theme.colors.onSurface }}
                >
                  Переключиться на заказчика
                </Text>
                <Text 
                  variant="bodySmall" 
                  style={{ color: (theme as any).custom.textSecondary }}
                >
                  Перейти в режим заказчика
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </CustomCard>
      </View>

      {/* Actions Section */}
      <View style={styles.section}>
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
          Удалить профиль
        </CustomButton>
      </View>

      <ConfirmationModal
        visible={showLogoutModal}
        title="Выход из аккаунта"
        message="Вы уверены, что хотите выйти?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Выйти"
        loading={loading}
      />

      <ConfirmationModal
        visible={showDeleteModal}
        title="Удаление аккаунта"
        message="Вы уверены, что хотите удалить аккаунт? Это действие необратимо."
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    ...containerShadows.card,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
  },
  documentsCard: {
    padding: spacing.md,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  name: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  phone: {
    marginBottom: 0,
  },
  executorInfoContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
  },
  verificationBanner: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  verificationNote: {
    textAlign: 'center',
  },
  editButton: {
    marginTop: spacing.sm,
    minWidth: 200,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  settingsCard: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    minHeight: 72,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconEmoji: {
    fontSize: 24,
  },
  chevron: {
    fontSize: 24,
    color: '#999999',
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});
