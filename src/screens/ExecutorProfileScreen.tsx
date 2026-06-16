import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { Text, Divider, IconButton, useTheme, SegmentedButtons } from 'react-native-paper';
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
import { AppTheme, spacing, containerShadows } from '../theme/theme';
import { USER_AGREEMENT, PRIVACY_POLICY, PERSONAL_DATA_CONSENT } from '../constants/documents';

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
  const theme = useTheme<AppTheme>();
  const { showError } = useSnackbarHelpers();
  const user = useSelector((state: any) => state.auth.user);
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  // Данные автомобиля могут быть в executorProfile или напрямую в user
  const executorProfile = user?.executorProfile ||
    user?.executor_profile || {
      vehicleNumber: user?.vehicle_number,
      vehicleCapacity: user?.vehicle_capacity,
      documents: user?.documents,
    };
  const executorDocuments = executorProfile?.documents || user?.documents;

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
      console.error('Ошибка проверки регистрации заказчика:', error);
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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={value => setActiveTab(value as 'personal' | 'vehicle')}
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
              <Text
                variant="labelMedium"
                style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}
              >
                Имя
              </Text>
              <Text
                variant="bodyLarge"
                style={[styles.infoValue, { color: theme.colors.onSurface }]}
              >
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
              <Text
                variant="bodyLarge"
                style={[styles.infoValue, { color: theme.colors.onSurface }]}
              >
                {user?.phoneNumber || user?.phone_number || 'Не указано'}
              </Text>
            </View>

            <Divider style={[styles.divider, { backgroundColor: (theme as any).custom.divider }]} />

            <View style={styles.infoItem}>
              <Text
                variant="labelMedium"
                style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}
              >
                Почта
              </Text>
              <Text
                variant="bodyLarge"
                style={[styles.infoValue, { color: theme.colors.onSurface }]}
              >
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

          {executorProfile?.vehicleNumber ||
          executorProfile?.vehicle_number ||
          user?.vehicle_number ? (
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Text
                  variant="labelMedium"
                  style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}
                >
                  Номер машины
                </Text>
                <Text
                  variant="bodyLarge"
                  style={[styles.infoValue, { color: theme.colors.onSurface }]}
                >
                  {executorProfile?.vehicleNumber ||
                    executorProfile?.vehicle_number ||
                    user?.vehicle_number ||
                    'Не указано'}
                </Text>
              </View>

              <Divider
                style={[styles.divider, { backgroundColor: (theme as any).custom.divider }]}
              />

              <View style={styles.infoItem}>
                <Text
                  variant="labelMedium"
                  style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}
                >
                  Объем машины
                </Text>
                <Text
                  variant="bodyLarge"
                  style={[styles.infoValue, { color: theme.colors.onSurface }]}
                >
                  {executorProfile?.vehicleCapacity ||
                    executorProfile?.vehicle_capacity ||
                    user?.vehicle_capacity ||
                    'Не указано'}{' '}
                  м³
                </Text>
              </View>

              {/* Documents Gallery */}
              {executorDocuments && (
                <>
                  <Divider
                    style={[styles.divider, { backgroundColor: (theme as any).custom.divider }]}
                  />
                  <View style={styles.documentsSection}>
                    <Text
                      variant="labelMedium"
                      style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}
                    >
                      Фото документов
                    </Text>

                    <View style={styles.documentsGallery}>
                      {/* Passport */}
                      {(executorDocuments?.passportPhoto || executorDocuments?.passport_photo) && (
                        <TouchableOpacity
                          style={styles.documentThumbnail}
                          onPress={() =>
                            openDocumentFullscreen(
                              executorDocuments?.passportPhoto ||
                                executorDocuments?.passport_photo ||
                                ''
                            )
                          }
                        >
                          <Image
                            source={{
                              uri:
                                executorDocuments?.passportPhoto ||
                                executorDocuments?.passport_photo ||
                                '',
                            }}
                            style={[
                              styles.thumbnailImage,
                              { backgroundColor: theme.custom.divider },
                            ]}
                            resizeMode="cover"
                          />
                          <Text
                            variant="bodySmall"
                            style={[styles.thumbnailLabel, { color: theme.custom.text }]}
                          >
                            Паспорт
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Driver License */}
                      {(executorDocuments?.driverLicensePhoto ||
                        executorDocuments?.driver_license_photo) && (
                        <TouchableOpacity
                          style={styles.documentThumbnail}
                          onPress={() =>
                            openDocumentFullscreen(
                              executorDocuments?.driverLicensePhoto ||
                                executorDocuments?.driver_license_photo ||
                                ''
                            )
                          }
                        >
                          <Image
                            source={{
                              uri:
                                executorDocuments?.driverLicensePhoto ||
                                executorDocuments?.driver_license_photo ||
                                '',
                            }}
                            style={[
                              styles.thumbnailImage,
                              { backgroundColor: theme.custom.divider },
                            ]}
                            resizeMode="cover"
                          />
                          <Text
                            variant="bodySmall"
                            style={[styles.thumbnailLabel, { color: theme.custom.text }]}
                          >
                            Водит. удост.
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Vehicle Registration */}
                      {(executorDocuments?.vehicleRegistrationPhoto ||
                        executorDocuments?.vehicle_registration_photo) && (
                        <TouchableOpacity
                          style={styles.documentThumbnail}
                          onPress={() =>
                            openDocumentFullscreen(
                              executorDocuments?.vehicleRegistrationPhoto ||
                                executorDocuments?.vehicle_registration_photo ||
                                ''
                            )
                          }
                        >
                          <Image
                            source={{
                              uri:
                                executorDocuments?.vehicleRegistrationPhoto ||
                                executorDocuments?.vehicle_registration_photo ||
                                '',
                            }}
                            style={[
                              styles.thumbnailImage,
                              { backgroundColor: theme.custom.divider },
                            ]}
                            resizeMode="cover"
                          />
                          <Text
                            variant="bodySmall"
                            style={[styles.thumbnailLabel, { color: theme.custom.text }]}
                          >
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
            <Text
              variant="bodyMedium"
              style={{
                color: (theme as any).custom.textSecondary,
                textAlign: 'center',
                paddingVertical: spacing.lg,
              }}
            >
              Данные автомобиля не найдены
            </Text>
          )}
        </CustomCard>
      )}

      {/* Action Buttons */}
      <View style={styles.section}>
        {isClient && (
          <Text
            variant="bodyMedium"
            style={[styles.roleHint, { color: theme.custom.textSecondary }]}
          >
            Доступен второй аккаунт: заказчик
          </Text>
        )}

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
          {isClient ? 'Перейти в аккаунт заказчика' : 'Зарегистрироваться как заказчик'}
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

      {/* Document Fullscreen Modal */}
      <Modal
        visible={!!selectedDocument}
        transparent={true}
        onRequestClose={closeDocumentFullscreen}
        animationType="fade"
      >
        <View style={[styles.fullscreenModal, { backgroundColor: theme.custom.overlay }]}>
          <TouchableOpacity style={styles.closeButton} onPress={closeDocumentFullscreen}>
            <View style={[styles.closeButtonCircle, { backgroundColor: theme.custom.surface }]}>
              <Text style={[styles.closeButtonText, { color: theme.custom.text }]}>✕</Text>
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
  topActions: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  themeButton: {
    marginRight: 0,
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
  },
  thumbnailLabel: {
    padding: spacing.xs,
    textAlign: 'center',
    fontSize: 10,
  },
  fullscreenModal: {
    flex: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
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
