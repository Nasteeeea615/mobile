import { APIResponse } from '../types';

// Mock режим - включить/выключить
export const MOCK_MODE = true;

// Задержка для имитации сетевых запросов
const MOCK_DELAY = 800;

// Mock данные
let mockUsers: any[] = [];
let mockOrders: any[] = [];
let mockTickets: any[] = [];
let currentUser: any = null;
let currentToken: string | null = null;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockApiService {
  private token: string | null = null;

  async setToken(token: string): Promise<void> {
    this.token = token;
    currentToken = token;
  }

  async clearToken(): Promise<void> {
    this.token = null;
    currentToken = null;
    currentUser = null;
  }

  async get<T>(url: string, params?: any): Promise<APIResponse<T>> {
    await delay(MOCK_DELAY);
    console.log('[MOCK API] GET', url, params);

    // Auth endpoints
    if (url === '/auth/me') {
      return {
        success: true,
        data: { user: currentUser } as T,
      };
    }

    // Orders endpoints
    if (url === '/orders') {
      const userOrders = mockOrders.filter(o => o.client_id === currentUser?.id);
      return {
        success: true,
        data: { orders: userOrders } as T,
      };
    }

    if (url === '/orders/history') {
      const userOrders = mockOrders.filter(o => o.client_id === currentUser?.id);
      return {
        success: true,
        data: { orders: userOrders } as T,
      };
    }

    if (url === '/orders/my') {
      const userOrders = mockOrders.filter(o => o.client_id === currentUser?.id);
      return {
        success: true,
        data: { orders: userOrders } as T,
      };
    }

    if (url.startsWith('/orders/')) {
      const orderId = url.split('/')[2];
      const order = mockOrders.find(o => o.id === orderId);
      return {
        success: true,
        data: { order } as T,
      };
    }

    // Support tickets
    if (url === '/support/tickets') {
      const userTickets = mockTickets.filter(t => t.user_id === currentUser?.id);
      return {
        success: true,
        data: { tickets: userTickets } as T,
      };
    }

    if (url.startsWith('/support/tickets/')) {
      const ticketId = url.split('/')[3];
      const ticket = mockTickets.find(t => t.id === ticketId);
      return {
        success: true,
        data: { ticket, messages: [] } as T,
      };
    }

    // Payment methods
    if (url === '/payments/methods') {
      return {
        success: true,
        data: {
          methods: [
            {
              cardToken: 'mock_card_1',
              cardLast4: '4242',
              cardType: 'visa',
            },
          ],
        } as T,
      };
    }

    return { success: true, data: {} as T };
  }

  async post<T>(url: string, data?: any): Promise<APIResponse<T>> {
    await delay(MOCK_DELAY);
    console.log('[MOCK API] POST', url, data);

    // Auth - Send SMS
    if (url === '/auth/send-sms') {
      console.log('[MOCK] SMS код: 1234');
      return {
        success: true,
        data: { message: 'SMS отправлен' } as T,
      };
    }

    // Auth - Verify SMS
    if (url === '/auth/verify-sms') {
      const { phoneNumber, code } = data;

      // Проверяем код (в mock режиме принимаем 1234)
      if (code !== '1234') {
        throw {
          code: 'INVALID_CODE',
          message: 'Неверный код',
        };
      }

      // Проверяем существует ли пользователь
      const existingUser = mockUsers.find(u => u.phone_number === phoneNumber);

      if (existingUser) {
        // Существующий пользователь
        currentUser = existingUser;
        currentToken = `mock_token_${Date.now()}`;
        this.token = currentToken;

        return {
          success: true,
          data: {
            isNewUser: false,
            token: currentToken,
            user: existingUser,
          } as T,
        };
      } else {
        // Новый пользователь
        return {
          success: true,
          data: {
            isNewUser: true,
          } as T,
        };
      }
    }

    // Auth - Register Client
    if (url === '/auth/register-client') {
      const newUser = {
        id: `user_${Date.now()}`,
        phone_number: data.phone_number,
        name: data.name,
        role: 'client',
        city: data.city,
        street: data.street,
        house_number: data.house_number,
        created_at: new Date().toISOString(),
      };

      mockUsers.push(newUser);
      currentUser = newUser;
      currentToken = `mock_token_${Date.now()}`;
      this.token = currentToken;

      // Add some mock completed orders for testing
      const mockCompletedOrders = [
        {
          id: `order_${Date.now()}_1`,
          client_id: newUser.id,
          vehicle_capacity: 5,
          address: {
            city: data.city,
            street: data.street,
            houseNumber: data.house_number,
          },
          scheduled_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '10:00',
          status: 'completed',
          price: 3000,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `order_${Date.now()}_2`,
          client_id: newUser.id,
          vehicle_capacity: 3,
          address: {
            city: data.city,
            street: 'ул. Ленина',
            houseNumber: '25',
          },
          scheduled_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '14:00',
          status: 'completed',
          price: 1800,
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `order_${Date.now()}_3`,
          client_id: newUser.id,
          vehicle_capacity: 10,
          address: {
            city: data.city,
            street: 'пр. Победы',
            houseNumber: '100',
          },
          scheduled_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '09:00',
          status: 'cancelled',
          price: 6000,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      mockOrders.push(...mockCompletedOrders);

      return {
        success: true,
        data: {
          token: currentToken,
          user: newUser,
        } as T,
      };
    }

    // Auth - Register Executor
    if (url === '/auth/register-executor') {
      // Validate documents are provided
      if (!data.documents || !data.documents.passport_photo || 
          !data.documents.driver_license_photo || !data.documents.vehicle_registration_photo) {
        throw {
          code: 'VALIDATION_ERROR',
          message: 'Необходимо загрузить все документы',
        };
      }

      const newUser = {
        id: `executor_${Date.now()}`,
        phone_number: data.phone_number,
        name: data.name,
        role: 'executor',
        vehicle_capacity: data.vehicle_capacity,
        vehicle_number: data.vehicle_number,
        documents: {
          passport_photo: data.documents.passport_photo,
          driver_license_photo: data.documents.driver_license_photo,
          vehicle_registration_photo: data.documents.vehicle_registration_photo,
        },
        created_at: new Date().toISOString(),
      };

      mockUsers.push(newUser);
      currentUser = newUser;
      currentToken = `mock_token_${Date.now()}`;
      this.token = currentToken;

      return {
        success: true,
        data: {
          token: currentToken,
          user: newUser,
        } as T,
      };
    }

    // Create Order
    if (url === '/orders') {
      const newOrder = {
        id: `order_${Date.now()}`,
        client_id: currentUser?.id,
        vehicle_capacity: data.vehicle_capacity,
        city: data.city,
        street: data.street,
        house_number: data.house_number,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        comment: data.comment,
        is_urgent: data.is_urgent || false,
        status: 'pending',
        price: data.vehicle_capacity * 600,
        created_at: new Date().toISOString(),
      };

      mockOrders.push(newOrder);

      return {
        success: true,
        data: { order: newOrder } as T,
      };
    }

    // Accept Order (executor)
    if (url.match(/\/orders\/.*\/accept/)) {
      const orderId = url.split('/')[2];
      const order = mockOrders.find(o => o.id === orderId);
      if (order) {
        order.status = 'accepted';
        order.executor_id = currentUser?.id;
      }
      return {
        success: true,
        data: { order } as T,
      };
    }

    // Complete Order
    if (url.match(/\/orders\/.*\/complete/)) {
      const orderId = url.split('/')[2];
      const order = mockOrders.find(o => o.id === orderId);
      if (order) {
        order.status = 'completed';
      }
      return {
        success: true,
        data: { order } as T,
      };
    }

    // Pay Order
    if (url.match(/\/orders\/.*\/pay/)) {
      const orderId = url.split('/')[2];
      const order = mockOrders.find(o => o.id === orderId);
      if (order) {
        order.status = 'paid';
        order.payment_method = data.paymentMethod;
      }
      return {
        success: true,
        data: { order } as T,
      };
    }

    // Create Support Ticket
    if (url === '/support/tickets') {
      const newTicket = {
        id: `ticket_${Date.now()}`,
        user_id: currentUser?.id,
        subject: data.subject,
        description: data.description,
        status: 'open',
        created_at: new Date().toISOString(),
      };

      mockTickets.push(newTicket);

      return {
        success: true,
        data: { ticket: newTicket } as T,
      };
    }

    // Send message to ticket
    if (url.match(/\/support\/tickets\/.*\/messages/)) {
      return {
        success: true,
        data: { message: 'Сообщение отправлено' } as T,
      };
    }

    return { success: true, data: {} as T };
  }

  async put<T>(url: string, data?: any): Promise<APIResponse<T>> {
    await delay(MOCK_DELAY);
    console.log('[MOCK API] PUT', url, data);

    // Update profile
    if (url === '/profile') {
      if (currentUser) {
        Object.assign(currentUser, data);
      }
      return {
        success: true,
        data: { user: currentUser } as T,
      };
    }

    return { success: true, data: {} as T };
  }

  async delete<T>(url: string): Promise<APIResponse<T>> {
    await delay(MOCK_DELAY);
    console.log('[MOCK API] DELETE', url);
    return { success: true, data: {} as T };
  }
}

export default new MockApiService();
