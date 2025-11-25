import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { useTheme, Portal, Modal, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { AppTheme, spacing, borderRadius, containerShadows } from '../theme/theme';

interface DocumentUploadFieldProps {
  label: string;
  value: string | null; // URI of uploaded image
  onUpload: (uri: string) => void;
  onRemove: () => void;
  required?: boolean;
  error?: boolean;
  errorText?: string;
  style?: ViewStyle;
}

const DocumentUploadField: React.FC<DocumentUploadFieldProps> = ({
  label,
  value,
  onUpload,
  onRemove,
  required = false,
  error = false,
  errorText,
  style,
}) => {
  const theme = useTheme<AppTheme>();
  const colors = theme.custom;
  const [showPicker, setShowPicker] = useState(false);

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Необходимо разрешение',
        'Необходимо разрешение на доступ к камере для загрузки фотографий документов.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Необходимо разрешение',
        'Необходимо разрешение на доступ к галерее для загрузки фотографий документов.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const validateAndProcessImage = async (uri: string): Promise<boolean> => {
    try {
      // Get file info
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileSize = blob.size;
      const fileType = blob.type;

      // Validate file format (JPEG, PNG only)
      if (!fileType.includes('jpeg') && !fileType.includes('jpg') && !fileType.includes('png')) {
        Alert.alert(
          'Неподдерживаемый формат',
          'Поддерживаются только JPEG и PNG форматы.'
        );
        return false;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (fileSize > maxSize) {
        Alert.alert(
          'Файл слишком большой',
          'Размер файла не должен превышать 5MB.'
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating image:', error);
      Alert.alert('Ошибка', 'Не удалось проверить файл. Попробуйте снова.');
      return false;
    }
  };

  const compressImage = async (uri: string): Promise<string> => {
    try {
      // Manipulate image to compress and resize
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1920 } }], // Resize to max width 1920px, height auto-calculated
        {
          compress: 0.7, // Compress to 70% quality
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      // If compression fails, return original URI
      return uri;
    }
  };

  const pickImageFromCamera = async () => {
    setShowPicker(false);
    
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        
        // Validate image
        const isValid = await validateAndProcessImage(uri);
        if (!isValid) return;

        // Compress image
        const compressedUri = await compressImage(uri);
        onUpload(compressedUri);
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фото. Попробуйте снова.');
    }
  };

  const pickImageFromGallery = async () => {
    setShowPicker(false);
    
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        
        // Validate image
        const isValid = await validateAndProcessImage(uri);
        if (!isValid) return;

        // Compress image
        const compressedUri = await compressImage(uri);
        onUpload(compressedUri);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать фото. Попробуйте снова.');
    }
  };

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Отмена', 'Сделать фото', 'Выбрать из галереи'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImageFromCamera();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          }
        }
      );
    } else {
      setShowPicker(true);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Upload Area */}
      {!value ? (
        <TouchableOpacity
          style={[
            styles.uploadArea,
            {
              backgroundColor: colors.inputBackground,
              borderColor: error ? '#FF0000' : colors.inputBorder,
            },
            containerShadows.card,
          ]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <IconButton
            icon="camera"
            size={48}
            iconColor={colors.textSecondary}
            style={styles.cameraIcon}
          />
          <Text style={[styles.uploadText, { color: colors.textSecondary }]}>
            Нажмите для загрузки
          </Text>
          <Text style={[styles.uploadHint, { color: colors.textDisabled }]}>
            Камера или галерея
          </Text>
        </TouchableOpacity>
      ) : (
        <View
          style={[
            styles.previewContainer,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
            },
            containerShadows.card,
          ]}
        >
          {/* Image Preview */}
          <Image source={{ uri: value }} style={styles.previewImage} />

          {/* Remove Button */}
          <IconButton
            icon="close"
            size={20}
            iconColor={colors.white}
            containerColor={colors.black}
            style={[styles.removeButton, containerShadows.elevated]}
            onPress={onRemove}
          />
        </View>
      )}

      {/* Error Message */}
      {error && errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
      )}

      {/* Picker Modal for Android */}
      <Portal>
        <Modal
          visible={showPicker}
          onDismiss={() => setShowPicker(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Выберите источник
          </Text>
          
          <TouchableOpacity
            style={[
              styles.modalOption,
              { borderBottomColor: colors.border },
            ]}
            onPress={pickImageFromCamera}
          >
            <IconButton
              icon="camera"
              size={24}
              iconColor={colors.text}
              style={styles.modalIcon}
            />
            <Text style={[styles.modalOptionText, { color: colors.text }]}>
              Сделать фото
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modalOption,
              { borderBottomColor: colors.border },
            ]}
            onPress={pickImageFromGallery}
          >
            <IconButton
              icon="image"
              size={24}
              iconColor={colors.text}
              style={styles.modalIcon}
            />
            <Text style={[styles.modalOptionText, { color: colors.text }]}>
              Выбрать из галереи
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => setShowPicker(false)}
          >
            <IconButton
              icon="close"
              size={24}
              iconColor={colors.textSecondary}
              style={styles.modalIcon}
            />
            <Text style={[styles.modalOptionText, { color: colors.textSecondary }]}>
              Отмена
            </Text>
          </TouchableOpacity>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  required: {
    color: '#FF0000',
  },
  uploadArea: {
    height: 200,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: spacing.md,
  },
  uploadHint: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  previewContainer: {
    height: 200,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: spacing.xs,
  },
  modalContent: {
    margin: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: spacing.md,
  },
  cameraIcon: {
    margin: 0,
  },
  modalIcon: {
    margin: 0,
  },
});

export default DocumentUploadField;
