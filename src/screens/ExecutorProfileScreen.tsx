import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import { Text, Divider, useTheme, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setUser } from '../store/slices/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import apiService from '../services/api';
import { spacing, containerShadows } from '../theme/theme';

export default function ExecutorProfileScreen() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSwitchRoleModal, setShowSwitchRoleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'vehicle'>('personal');
  const [isClient, setIsClient] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector((state: any) => state.auth.user);

  // Данные автомобиля могут быть в executorProfile или напрямую в user
  const executorProfile = user?.executorProfile || user?.executor_profile || {
    vehicleNumber: user?.vehicle_number,
    vehicleCapacity: user?.vehicle_capacity,
    documents: user?.documents,
  };

  // Debug: выводим данные профиля
  useEffect(() => {
    console.log('=== ExecutorProfile Debug ===');
    console.log('User:', JSON.stringify(user, null, 2));
    console.log('ExecutorProfile:', JSON.stringify(executorProfile, null, 2));
  }, [user, executorProfile]);

  // Проверка регистрации как заказчик
  useEffect(() => {
    checkClientRegistration();
  }, []);

  const checkClientRegistration = async () => {
    setCheckingRole(true);
    try {
      const response = await apiService.get('/check-role/client');
      if (response.success && response.data) {
        setIsClient((response.data as any).isRegistered);
      }
    } catch (error) {
      console.error('Error checking client registration:', error);
    } finally {
      setCheckingRole(false);
    }
  };

  const handleSwitchToClient = async () => {
    if (isClient) {
      // Уже зарегистрирован - показать диалог переключения
      setShowSwitchRoleModal(true);
    } else {
      // Не зарегистрирован - перейти на регистрацию
      navigation.navigate('Registration', {
        prefillData: {
          name: user?.name,
          phoneNumber: user?.phoneNumber || user?.phone_number,
          email: user?.email,
        },
      });
    }
  };

  const handleConfirmSwitchToClient = async () => {
    setLoading(true);
    try {
      const response = await apiService.post('/switch-role', {
        newRole: 'client',
      });

      if (response.success && response.data) {
        const data = response.data as any;
        // Обновить токен и пользователя
        await apiService.setToken(data.token);
        dispatch(setUser(data.user));
        
        setShowSwitchRoleModal(false);
        
        // Перейти на профиль заказчика
        navigation.reset({
          index: 0,
          routes: [{ name: 'ClientTabs' }],
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
      userType: 'executor',
    });
  };

  const openDocumentFullscreen = (documentUri: string) => {
    setSelectedDocument(documentUri);
  };

  const closeDocumentFullscreen = () => {
    setSelectedDocument(null);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'personal' | 'vehicle')}
          buttons={[
            {
              value: 'personal',
              label: 'Личные данные',
              icon: 'account',
            },
            {
              value: 'vehicle',
              label: 'Данные авто',
              icon: 'car',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Personal Data Tab */}
      {activeTab === 'personal' && (
        <CustomCard style={styles.dataCard}>
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
                Почта
              </Text>
              <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {user?.email || 'Не указано'}
              </Text>
            </View>
          </View>
        </CustomCard>
      )}

      {/* Vehicle Data Tab */}
      {activeTab === 'vehicle' && (
        <CustomCard style={styles.dataCard}>
          <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Данные автомобиля
          </Text>
          
          {(executorProfile?.vehicleNumber || executorProfile?.vehicle_number || user?.vehicle_number) ? (
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Text variant="labelMedium" style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}>
                  Номер машины
                </Text>
                <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                  {executorProfile?.vehicleNumber || executorProfile?.vehicle_number || user?.vehicle_number || 'Не указано'}
                </Text>
              </View>

              <Divider style={[styles.divider, { backgroundColor: (theme as any).custom.divider }]} />

              <View style={styles.infoItem}>
                <Text variant="labelMedium" style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}>
                  Объем машины
                </Text>
                <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                  {executorProfile?.vehicleCapacity || executorProfile?.vehicle_capacity || user?.vehicle_capacity || 'Не указано'} м³
                </Text>
              </View>

              {/* Documents Gallery */}
              {(executorProfile?.documents || user?.documents) && (
                <>
                  <Divider style={[styles.divider, { backgroundColor: (theme as any).custom.divider }]} />
                  <View style={styles.documentsSection}>
                    <Text variant="labelMedium" style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}>
                      Фото документов
                    </Text>
                    
                    <View style={styles.documentsGallery}>
                      {/* Passport */}
                      {((executorProfile?.documents || user?.documents)?.passportPhoto || (executorProfile?.documents || user?.documents)?.passport_photo) && (
                        <TouchableOpacity 
                          style={styles.documentThumbnail}
                          onPress={() => openDocumentFullscreen((executorProfile?.documents || user?.documents).passportPhoto || (executorProfile?.documents || user?.documents).passport_photo)}
                        >
                          <Image
                            source={{ uri: (executorProfile?.documents || user?.documents).passportPhoto || (executorProfile?.documents || user?.documents).passport_photo }}
                            style={styles.thumbnailImage}
                            resizeMode="cover"
                          />
                          <Text variant="bodySmall" style={styles.thumbnailLabel}>
                            Паспорт
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Driver License */}
                      {((executorProfile?.documents || user?.documents)?.driverLicensePhoto || (executorProfile?.documents || user?.documents)?.driver_license_photo) && (
                        <TouchableOpacity 
                          style={styles.documentThumbnail}
                          onPress={() => openDocumentFullscreen((executorProfile?.documents || user?.documents).driverLicensePhoto || (executorProfile?.documents || user?.documents).driver_license_photo)}
                        >
                          <Image
                            source={{ uri: (executorProfile?.documents || user?.documents).driverLicensePhoto || (executorProfile?.documents || user?.documents).driver_license_photo }}
                            style={styles.thumbnailImage}
                            resizeMode="cover"
                          />
                          <Text variant="bodySmall" style={styles.thumbnailLabel}>
                            Водит. удост.
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Vehicle Registration */}
                      {((executorProfile?.documents || user?.documents)?.vehicleRegistrationPhoto || (executorProfile?.documents || user?.documents)?.vehicle_registration_photo) && (
                        <TouchableOpacity 
                          style={styles.documentThumbnail}
                          onPress={() => openDocumentFullscreen((executorProfile?.documents || user?.documents).vehicleRegistrationPhoto || (executorProfile?.documents || user?.documents).vehicle_registration_photo)}
                        >
                          <Image
                            source={{ uri: (executorProfile?.documents || user?.documents).vehicleRegistrationPhoto || (executorProfile?.documents || user?.documents).vehicle_registration_photo }}
                            style={styles.thumbnailImage}
                            resizeMode="cover"
                          />
                          <Text variant="bodySmall" style={styles.thumbnailLabel}>
                            Рег. ТС
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>
          ) : (
            <Text variant="bodyMedium" style={{ color: (theme as any).custom.textSecondary, textAlign: 'center', paddingVertical: spacing.lg }}>
              Данные автомобиля не найдены
            </Text>
          )}
        </CustomCard>
      )}

      {/* Action Buttons */}
      <View style={styles.section}>
        <CustomButton
          mode="contained"
          variant="primary"
          onPress={() => navigation.navigate('ExecutorBalance')}
          style={styles.actionButton}
        >
          Баланс / Вывод средств
        </CustomButton>

        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handleSwitchToClient}
          style={styles.actionButton}
          loading={checkingRole}
        >
          Перейти в режим заказчика
        </CustomButton>

        <CustomButton
          mode="outlined"
          variant="secondary"
          onPress={handleEditProfile}
          style={styles.actionButton}
        >
          Редактировать аккаунт
        </CustomButton>

        <CustomButton
          mode="outlined"
          variant="secondary"
          onPress={() => setShowLogoutModal(true)}
          style={styles.actionButton}
        >
          Выйти из аккаунта
        </CustomButton>

        <CustomButton
          mode="outlined"
          variant="danger"
          onPress={() => setShowDeleteModal(true)}
          style={styles.actionButton}
        >
          Удалить аккаунт
        </CustomButton>
      </View>

      {/* Document Fullscreen Modal */}
      <Modal
        visible={!!selectedDocument}
        transparent={true}
        onRequestClose={closeDocumentFullscreen}
        animationType="fade"
      >
        <View style={styles.fullscreenModal}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={closeDocumentFullscreen}
          >
            <View style={styles.closeButtonCircle}>
              <Text style={styles.closeButtonText}>✕</Text>
            </View>
          </TouchableOpacity>
          {selectedDocument && (
            <Image
              source={{ uri: selectedDocument }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Switch Role Modal */}
      <ConfirmationModal
        visible={showSwitchRoleModal}
        title="Переключиться в режим заказчика?"
        message="Вы уже зарегистрированы как заказчик. Переключиться на аккаунт заказчика?"
        onConfirm={handleConfirmSwitchToClient}
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
  tabsContainer: {
    marginBottom: spacing.md,
  },
  segmentedButtons: {
    marginHorizontal: 0,
  },
  dataCard: {
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
  documentsSection: {
    marginTop: spacing.md,
  },
  documentsGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  documentThumbnail: {
    width: 100,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    ...containerShadows.card,
  },
  thumbnailImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F5F5F5',
  },
  thumbnailLabel: {
    padding: spacing.xs,
    textAlign: 'center',
    fontSize: 10,
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginBottom: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});
