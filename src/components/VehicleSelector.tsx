import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { AppTheme, spacing, borderRadius } from '../theme';

interface VehicleSelectorProps {
  selectedCapacity: 3 | 5 | 10 | null;
  onSelect: (capacity: 3 | 5 | 10) => void;
}

export default function VehicleSelector({ selectedCapacity, onSelect }: VehicleSelectorProps) {
  const theme = useTheme<AppTheme>();
  const capacities: Array<3 | 5 | 10> = [3, 5, 10];

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
        Объем машины
      </Text>
      <View style={styles.cardsContainer}>
        {capacities.map(capacity => {
          const isSelected = selectedCapacity === capacity;
          return (
            <Pressable
              key={capacity}
              onPress={() => onSelect(capacity)}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primaryContainer
                    : theme.colors.surface,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <Text
                variant="headlineMedium"
                style={[
                  styles.capacityText,
                  {
                    color: isSelected ? theme.colors.primary : theme.colors.onSurface,
                    fontWeight: theme.typography.fontWeights.bold,
                  },
                ]}
              >
                {capacity} м³
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.priceText, { color: theme.custom.textSecondary }]}
              >
                {capacity * 600} ₽
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capacityText: {
    textAlign: 'center',
  },
  priceText: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
