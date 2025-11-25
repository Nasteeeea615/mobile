import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Switch, Avatar, Divider, useTheme, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { RootState } from '../store';
import { toggleTheme } from '../store/slices/profileSlice';
import { logout, setUser } from '../store/slices/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import apiService from '../services/api';
import { spacing, containerShadows } from '../theme/theme';

export default function ClientProfileScreen() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
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

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
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
              {user?.name || 'Пользователь'}
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[styles.phone, { color: (theme as any).custom.textSecondary }]}
            >
              {user?.phoneNumber || user?.phone_number}
            </Text>
          </View>
        </View>

        {user?.clientProfile && (
          <View style={styles.addressContainer}>
            <Text 
              variant="bodyMedium" 
              style={[styles.address, { color: (theme as any).custom.textSecondary }]}
            >
              📍 {user.clientProfile.city}, {user.clientProfile.street},{' '}
              {user.clientProfile.houseNumber || user.clientProfile.house_number}
            </Text>
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
            onPress={() => navigation.navigate('ExecutorTabs')}
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
                  Переключиться на исполнителя
                </Text>
                <Text 
                  variant="bodySmall" 
                  style={{ color: (theme as any).custom.textSecondary }}
                >
                  Перейти в режим исполнителя
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <Divider style={{ backgroundColor: (theme as any).custom.divider }} />

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('BecomeExecutor')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>🚛</Text>
              </View>
              <View>
                <Text 
                  variant="bodyLarge" 
                  style={{ color: theme.colors.onSurface }}
                >
                  Хочу стать исполнителем
                </Text>
                <Text 
                  variant="bodySmall" 
                  style={{ color: (theme as any).custom.textSecondary }}
                >
                  Зарегистрироваться как исполнитель
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
  name: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  phone: {
    marginBottom: 0,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  address: {
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
