import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  IconButton,
  ActivityIndicator,
  Chip,
  Card,
  useTheme,
} from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import api from '../services/api';
import { Message, Ticket } from '../types';
import CustomInput from '../components/CustomInput';
import { AppTheme, spacing, containerShadows } from '../theme';

type TicketDetailsRouteProp = RouteProp<
  { TicketDetails: { ticketId: string } },
  'TicketDetails'
>;

const TicketDetailsScreen: React.FC = () => {
  const route = useRoute<TicketDetailsRouteProp>();
  const { ticketId } = route.params;
  const theme = useTheme<AppTheme>();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchTicketDetails();
    fetchMessages();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      // For now, we'll fetch from the tickets list
      // In a real app, you might have a separate endpoint for ticket details
      const response = await api.get('/support/tickets');
      const data = response as any;
      const foundTicket = data.tickets?.find((t: Ticket) => t.id === ticketId);
      if (foundTicket) {
        setTicket(foundTicket);
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/support/tickets/${ticketId}/messages`);
      const data = response as any;
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить сообщения');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    setSending(true);
    try {
      const response = await api.post(`/support/tickets/${ticketId}/messages`, {
        content: newMessage.trim(),
      });

      const data = response as any;
      if (data.message) {
        setMessages([...messages, data.message]);
        setNewMessage('');
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
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

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isAdmin = item.sender_role === 'admin';
    const showDate =
      index === 0 ||
      formatDate(item.created_at) !==
        formatDate(messages[index - 1].created_at);

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isAdmin ? styles.adminMessage : styles.userMessage,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isAdmin ? styles.adminBubble : styles.userBubble,
            ]}
          >
            {isAdmin && (
              <Text style={styles.senderName}>Служба поддержки</Text>
            )}
            <Text style={styles.messageText}>{item.content}</Text>
            <Text style={styles.messageTime}>
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    if (!ticket) return null;

    return (
      <Card style={[styles.headerCard, { backgroundColor: theme.custom.surface }, containerShadows.card]}>
        <Card.Content>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text variant="titleMedium" style={[styles.ticketSubject, { color: theme.custom.text }]}>
                {ticket.subject}
              </Text>
              <Text variant="bodySmall" style={[styles.ticketDescription, { color: theme.custom.textSecondary }]}>
                {ticket.description}
              </Text>
            </View>
            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(ticket.status) },
              ]}
              textStyle={styles.statusText}
            >
              {getStatusText(ticket.status)}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.custom.background }]}>
        <ActivityIndicator size="large" color={theme.custom.primary} />
        <Text style={[styles.loadingText, { color: theme.custom.textSecondary }]}>
          Загрузка сообщений...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.custom.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.custom.textSecondary }]}>
              Нет сообщений
            </Text>
          </View>
        }
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
        style={{ backgroundColor: theme.custom.background }}
      />

      {ticket?.status !== 'closed' && (
        <View style={[styles.inputContainer, { backgroundColor: theme.custom.surface, borderTopColor: theme.custom.border }]}>
          <CustomInput
            label=""
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Введите сообщение..."
            multiline
            disabled={sending}
            style={styles.input}
          />
          <IconButton
            icon="send"
            size={24}
            iconColor={theme.custom.primary}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            style={styles.sendButton}
          />
        </View>
      )}

      {ticket?.status === 'closed' && (
        <View style={[styles.closedBanner, { backgroundColor: theme.custom.surface, borderTopColor: theme.custom.border }]}>
          <Text style={[styles.closedText, { color: theme.custom.textSecondary }]}>
            Это обращение закрыто. Создайте новое обращение, если у вас возникли
            вопросы.
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
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
  headerCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  ticketSubject: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  ticketDescription: {},
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dateText: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    fontSize: 12,
    color: '#666',
  },
  messageContainer: {
    marginVertical: spacing.xs,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  adminMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#2196F3',
  },
  adminBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: 14,
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  sendButton: {
    margin: 0,
  },
  closedBanner: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  closedText: {
    textAlign: 'center',
  },
});

export default TicketDetailsScreen;
