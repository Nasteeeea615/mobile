import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Chip, ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { Ticket } from '../types';
import { AppTheme, spacing, containerShadows } from '../theme';

const TicketHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme<AppTheme>();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get('/support/tickets');
      const data = response as any;
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTickets(true);
    }, [])
  );

  const handleRefresh = () => {
    fetchTickets(true);
  };

  const handleTicketPress = (ticket: Ticket) => {
    navigation.navigate('TicketDetails', { ticketId: ticket.id });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open':
        return '#2196F3';
      case 'in_progress':
        return '#FF9800';
      case 'closed':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'open':
        return 'Открыт';
      case 'in_progress':
        return 'В работе';
      case 'closed':
        return 'Закрыт';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTicket = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleTicketPress(item)}>
      <Card style={[styles.card, { backgroundColor: theme.custom.surface }, containerShadows.card]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={[styles.subject, { color: theme.custom.text }]} numberOfLines={1}>
              {item.subject}
            </Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.statusText}
            >
              {getStatusText(item.status)}
            </Chip>
          </View>

          <Text variant="bodyMedium" style={[styles.description, { color: theme.custom.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <Text variant="bodySmall" style={[styles.date, { color: theme.custom.textSecondary }]}>
              {formatDate(item.created_at as any)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="titleMedium" style={[styles.emptyTitle, { color: theme.custom.text }]}>
        Нет обращений
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.custom.textSecondary }]}>
        У вас пока нет обращений в службу поддержки
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.custom.background }]}>
        <ActivityIndicator size="large" color={theme.custom.primary} />
        <Text style={[styles.loadingText, { color: theme.custom.textSecondary }]}>
          Загрузка обращений...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.custom.primary}
          />
        }
        style={{ backgroundColor: theme.custom.background }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  subject: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  description: {
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default TicketHistoryScreen;
