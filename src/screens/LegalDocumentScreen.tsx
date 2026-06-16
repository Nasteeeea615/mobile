import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { AppTheme, spacing } from '../theme';
import { LegalDocument } from '../constants/documents';

export default function LegalDocumentScreen() {
  const route = useRoute<any>();
  const theme = useTheme<AppTheme>();
  const document: LegalDocument = route.params?.document;

  if (!document) {
    return (
      <View style={[styles.center, { backgroundColor: theme.custom.background }]}>
        <Text style={{ color: theme.custom.text }}>Документ не найден</Text>
      </View>
    );
  }

  const paragraphs = document.content.split('\n\n');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.custom.background }]}
      contentContainerStyle={styles.content}
    >
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        const isSection =
          /^\d+[\s.]/.test(trimmed) ||
          /^[А-ЯA-Z]/.test(trimmed.split('\n')[0]) && trimmed.split('\n')[0].length < 60;

        return (
          <Text
            key={index}
            variant={isSection && index === 0 ? 'titleLarge' : 'bodyMedium'}
            style={[
              styles.paragraph,
              { color: theme.custom.text },
              isSection && index === 0 && styles.mainTitle,
            ]}
          >
            {trimmed}
          </Text>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paragraph: {
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  mainTitle: {
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
});
