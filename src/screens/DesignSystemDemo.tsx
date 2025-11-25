import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Divider, useTheme } from 'react-native-paper';
import {
  CustomButton,
  CustomInput,
  CustomCard,
  ThemeToggle,
  VehicleSelector,
  ConfirmationModal,
} from '../components';
import { AppTheme, spacing } from '../theme';

/**
 * Демонстрационный экран дизайн-системы
 * Показывает все компоненты и их варианты использования
 */
export default function DesignSystemDemo() {
  const theme = useTheme<AppTheme>();
  const [inputValue, setInputValue] = useState('');
  const [capacity, setCapacity] = useState<3 | 5 | 10 | null>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <Text
        variant="headlineLarge"
        style={[
          styles.header,
          {
            color: theme.colors.onBackground,
            fontWeight: theme.typography.fontWeights.bold,
          },
        ]}
      >
        Дизайн-система
      </Text>

      {/* Theme Toggle */}
      <CustomCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Переключатель темы
          </Text>
          <ThemeToggle />
        </View>
      </CustomCard>

      <Divider style={styles.divider} />

      {/* Buttons */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Кнопки
      </Text>

      <CustomCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.subsectionTitle}>
            Режимы
          </Text>
          <CustomButton onPress={() => {}} mode="contained" style={styles.button}>
            Contained
          </CustomButton>
          <CustomButton onPress={() => {}} mode="outlined" style={styles.button}>
            Outlined
          </CustomButton>
          <CustomButton onPress={() => {}} mode="text" style={styles.button}>
            Text
          </CustomButton>
          <CustomButton onPress={() => {}} mode="elevated" style={styles.button}>
            Elevated
          </CustomButton>
        </View>
      </CustomCard>

      <CustomCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.subsectionTitle}>
            Размеры
          </Text>
          <CustomButton onPress={() => {}} size="small" style={styles.button}>
            Small (44px)
          </CustomButton>
          <CustomButton onPress={() => {}} size="medium" style={styles.button}>
            Medium (48px)
          </CustomButton>
          <CustomButton onPress={() => {}} size="large" style={styles.button}>
            Large (56px)
          </CustomButton>
        </View>
      </CustomCard>

      <CustomCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.subsectionTitle}>
            Состояния
          </Text>
          <CustomButton onPress={() => {}} style={styles.button}>
            Normal
          </CustomButton>
          <CustomButton onPress={() => {}} loading style={styles.button}>
            Loading
          </CustomButton>
          <CustomButton onPress={() => {}} disabled style={styles.button}>
            Disabled
          </CustomButton>
          <CustomButton onPress={() => {}} icon="check" style={styles.button}>
            With Icon
          </CustomButton>
        </View>
      </CustomCard>

      <Divider style={styles.divider} />

      {/* Inputs */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Поля ввода
      </Text>

      <CustomCard style={styles.section}>
        <View style={styles.cardContent}>
          <CustomInput
            label="Обычное поле"
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Введите текст"
          />
          <CustomInput
            label="С ошибкой"
            value=""
            onChangeText={() => {}}
            error
            errorText="Это поле обязательно"
          />
          <CustomInput
            label="Отключенное"
            value="Нельзя редактировать"
            onChangeText={() => {}}
            disabled
          />
          <CustomInput
            label="Многострочное"
            value={inputValue}
            onChangeText={setInputValue}
            multiline
            numberOfLines={3}
          />
        </View>
      </CustomCard>

      <Divider style={styles.divider} />

      {/* Vehicle Selector */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Выбор машины
      </Text>

      <CustomCard style={styles.section}>
        <View style={styles.cardContent}>
          <VehicleSelector selectedCapacity={capacity} onSelect={setCapacity} />
        </View>
      </CustomCard>

      <Divider style={styles.divider} />

      {/* Cards */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Карточки
      </Text>

      <CustomCard elevation="small" style={styles.section}>
        <View style={styles.cardContent}>
          <Text variant="titleMedium">Small Elevation</Text>
          <Text variant="bodyMedium" style={{ color: theme.custom.textSecondary }}>
            Легкая тень для карточек
          </Text>
        </View>
      </CustomCard>

      <CustomCard elevation="medium" style={styles.section}>
        <View style={styles.cardContent}>
          <Text variant="titleMedium">Medium Elevation</Text>
          <Text variant="bodyMedium" style={{ color: theme.custom.textSecondary }}>
            Средняя тень (по умолчанию)
          </Text>
        </View>
      </CustomCard>

      <CustomCard elevation="large" style={styles.section}>
        <View style={styles.cardContent}>
          <Text variant="titleMedium">Large Elevation</Text>
          <Text variant="bodyMedium" style={{ color: theme.custom.textSecondary }}>
            Сильная тень для акцентов
          </Text>
        </View>
      </CustomCard>

      <Divider style={styles.divider} />

      {/* Modal */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Модальное окно
      </Text>

      <CustomCard style={styles.section}>
        <View style={styles.cardContent}>
          <CustomButton onPress={() => setShowModal(true)} fullWidth>
            Показать модальное окно
          </CustomButton>
        </View>
      </CustomCard>

      <ConfirmationModal
        visible={showModal}
        title="Подтверждение действия"
        message="Вы уверены, что хотите выполнить это действие?"
        onConfirm={() => setShowModal(false)}
        onCancel={() => setShowModal(false)}
        confirmText="Подтвердить"
        cancelText="Отмена"
      />

      <Divider style={styles.divider} />

      {/* Typography */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Типографика
      </Text>

      <CustomCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text variant="displayLarge">Display Large</Text>
          <Text variant="displayMedium">Display Medium</Text>
          <Text variant="displaySmall">Display Small</Text>
          <Text variant="headlineLarge">Headline Large</Text>
          <Text variant="headlineMedium">Headline Medium</Text>
          <Text variant="headlineSmall">Headline Small</Text>
          <Text variant="titleLarge">Title Large</Text>
          <Text variant="titleMedium">Title Medium</Text>
          <Text variant="titleSmall">Title Small</Text>
          <Text variant="bodyLarge">Body Large</Text>
          <Text variant="bodyMedium">Body Medium</Text>
          <Text variant="bodySmall">Body Small</Text>
          <Text variant="labelLarge">Label Large</Text>
          <Text variant="labelMedium">Label Medium</Text>
          <Text variant="labelSmall">Label Small</Text>
        </View>
      </CustomCard>

      <Divider style={styles.divider} />

      {/* Colors */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Цвета
      </Text>

      <CustomCard style={styles.section}>
        <View style={styles.cardContent}>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.primary }]} />
            <Text>Primary</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.secondary }]} />
            <Text>Secondary</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.custom.success }]} />
            <Text>Success</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.custom.warning }]} />
            <Text>Warning</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.custom.error }]} />
            <Text>Error</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.custom.info }]} />
            <Text>Info</Text>
          </View>
        </View>
      </CustomCard>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.md,
  },
  cardContent: {
    padding: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  subsectionTitle: {
    marginBottom: spacing.sm,
  },
  button: {
    marginBottom: spacing.sm,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  footer: {
    height: spacing.xl,
  },
});
