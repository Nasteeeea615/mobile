import { APIResponse } from '../types';

// Mock режим - включить/выключить
export const MOCK_MODE = true; // Полный мок-режим для тестирования UI
export const MOCK_AUTH = true; // Мок для SMS и номера телефона

// Задержка для имитации сетевых запросов
const MOCK_DELAY = 800;

// Mock данные
let mockUsers: any[] = [];
let mockOrders: any[] = [];
let mockTickets: any[] = [];
let mockExecutorBalances: Record<string, number> = {}; // Балансы исполнителей
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
      // Для клиента - его заказы
      if (currentUser?.role === 'client') {
        const userOrders = mockOrders.filter(o => o.client_id === currentUser?.id);
        return {
          success: true,
          data: { orders: userOrders } as T,
        };
      }
      // Для исполнителя - доступные заказы (pending)
      if (currentUser?.role === 'executor') {
        const availableOrders = mockOrders.filter(o => 
          o.status === 'pending' && !o.executor_id
        );
        return {
          success: true,
          data: { orders: availableOrders } as T,
        };
      }
    }

    if (url === '/orders/history') {
      // Для клиента - завершенные заказы
      if (currentUser?.role === 'client') {
        const userOrders = mockOrders.filter(o => 
          o.client_id === currentUser?.id && 
          (o.status === 'completed' || o.status === 'cancelled')
        );
        return {
          success: true,
          data: { orders: userOrders } as T,
        };
      }
      // Для исполнителя - завершенные заказы
      if (currentUser?.role === 'executor') {
        const executorOrders = mockOrders.filter(o => 
          o.executor_id === currentUser?.id && 
          (o.status === 'completed' || o.status === 'cancelled')
        );
        return {
          success: true,
          data: { orders: executorOrders } as T,
        };
      }
    }

    if (url === '/orders/my') {
      // Для клиента - все его заказы
      if (currentUser?.role === 'client') {
        const userOrders = mockOrders.filter(o => o.client_id === currentUser?.id);
        return {
          success: true,
          data: { orders: userOrders } as T,
        };
      }
      // Для исполнителя - его текущие заказы (accepted, in_progress)
      if (currentUser?.role === 'executor') {
        const myOrders = mockOrders.filter(o => 
          o.executor_id === currentUser?.id && 
          (o.status === 'accepted' || o.status === 'in_progress')
        );
        return {
          success: true,
          data: { orders: myOrders } as T,
        };
      }
    }

    // Executor orders endpoints
    if (url === '/executor/orders') {
      // Доступные заказы для исполнителя
      const availableOrders = mockOrders.filter(o => 
        o.status === 'pending' && !o.executor_id
      );
      return {
        success: true,
        data: { orders: availableOrders } as T,
      };
    }

    if (url === '/executor/orders/my') {
      // Текущие заказы исполнителя
      const myOrders = mockOrders.filter(o => 
        o.executor_id === currentUser?.id && 
        (o.status === 'accepted' || o.status === 'in_progress')
      );
      return {
        success: true,
        data: { orders: myOrders } as T,
      };
    }

    if (url === '/executor/orders/history') {
      // История заказов исполнителя
      const historyOrders = mockOrders.filter(o => 
        o.executor_id === currentUser?.id && 
        (o.status === 'completed' || o.status === 'cancelled')
      );
      return {
        success: true,
        data: { orders: historyOrders } as T,
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
              id: 'card_1',
              cardToken: 'mock_card_1',
              cardLast4: '4242',
              cardType: 'visa',
              cardHolder: 'IVAN IVANOV',
              isDefault: true,
            },
            {
              id: 'card_2',
              cardToken: 'mock_card_2',
              cardLast4: '5555',
              cardType: 'mastercard',
              cardHolder: 'IVAN IVANOV',
              isDefault: false,
            },
          ],
        } as T,
      };
    }

    // Check role registration
    if (url.startsWith('/check-role/')) {
      const role = url.split('/')[2];
      // В моке считаем, что пользователь зарегистрирован в обеих ролях
      return {
        success: true,
        data: {
          isRegistered: currentUser?.role === 'both' || currentUser?.role === role,
        } as T,
      };
    }

    // Executor balance
    if (url === '/executor/balance') {
      const executorId = currentUser?.id;
      if (!executorId) {
        throw { code: 'UNAUTHORIZED', message: 'Требуется авторизация' };
      }
      
      // Инициализируем баланс если его нет
      if (!(executorId in mockExecutorBalances)) {
        mockExecutorBalances[executorId] = 500; // Начальный баланс 500 рублей
      }
      
      return {
        success: true,
        data: {
          balance: mockExecutorBalances[executorId],
        } as T,
      };
    }

    // Executor active order
    if (url === '/executor/orders/active') {
      // Проверяем есть ли активный заказ у исполнителя
      const activeOrder = mockOrders.find(o => 
        o.executor_id === currentUser?.id && 
        (o.status === 'accepted' || o.status === 'in_progress')
      );
      
      return {
        success: true,
        data: {
          order: activeOrder || null,
        } as T,
      };
    }

    return { success: true, data: {} as T };
  }

  async post<T>(url: string, data?: any): Promise<APIResponse<T>> {
    await delay(MOCK_DELAY);
    console.log('[MOCK API] POST', url, data);

    // Auth - Login
    if (url === '/auth/login') {
      const { email, password } = data;

      // Проверяем существует ли пользователь
      const existingUser = mockUsers.find(u => u.email === email);

      if (!existingUser) {
        throw {
          code: 'USER_NOT_FOUND',
          message: 'Пользователь не найден',
        };
      }

      // В mock режиме принимаем любой пароль длиной >= 6
      if (!password || password.length < 6) {
        throw {
          code: 'INVALID_PASSWORD',
          message: 'Неверный пароль',
        };
      }

      // Успешный вход
      currentUser = existingUser;
      currentToken = `mock_token_${Date.now()}`;
      this.token = currentToken;

      return {
        success: true,
        data: {
          token: currentToken,
          user: existingUser,
        } as T,
      };
    }

    // Auth - Register Client
    if (url === '/auth/register-client') {
      const newUser = {
        id: `user_${Date.now()}`,
        email: data.email,
        name: data.name,
        phone_number: data.phone_number,
        phoneNumber: data.phone_number,
        role: 'client',
        city: data.city,
        street: data.street,
        house_number: data.house_number,
        houseNumber: data.house_number,
        created_at: new Date().toISOString(),
      };

      mockUsers.push(newUser);
      currentUser = newUser;
      currentToken = `mock_token_${Date.now()}`;
      this.token = currentToken;

      // Add rich mock orders for testing all statuses and UI states
      const mockTestOrders = [
        // Текущий активный заказ (в процессе)
        {
          id: `order_${Date.now()}_active`,
          client_id: newUser.id,
          executor_id: 'executor_mock_1',
          executor_name: 'Иван Петров',
          executor_phone: '+79001234567',
          vehicle_capacity: 5,
          vehicle_number: 'А123БВ777',
          address: {
            city: data.city,
            street: data.street,
            houseNumber: data.house_number,
          },
          scheduled_date: new Date().toISOString(),
          scheduled_time: '15:00',
          status: 'in_progress',
          price: 3500,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          accepted_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          comment: 'Срочный заказ, нужно приехать как можно быстрее',
        },
        // Заказ ожидает оплаты
        {
          id: `order_${Date.now()}_payment`,
          client_id: newUser.id,
          executor_id: 'executor_mock_2',
          executor_name: 'Сергей Иванов',
          executor_phone: '+79009876543',
          vehicle_capacity: 3,
          vehicle_number: 'В456ГД199',
          address: {
            city: data.city,
            street: 'ул. Пушкина',
            houseNumber: '15',
          },
          scheduled_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '12:00',
          status: 'awaiting_payment',
          price: 2400,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
          comment: 'Обычный заказ',
        },
        // Новый заказ (ожидает исполнителя)
        {
          id: `order_${Date.now()}_pending`,
          client_id: newUser.id,
          vehicle_capacity: 7,
          address: {
            city: data.city,
            street: 'ул. Гагарина',
            houseNumber: '42',
          },
          scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '10:00',
          status: 'pending',
          price: 4200,
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          comment: 'Заказ на послезавтра',
          is_urgent: false,
        },
        // Принятый заказ (исполнитель назначен)
        {
          id: `order_${Date.now()}_accepted`,
          client_id: newUser.id,
          executor_id: 'executor_mock_3',
          executor_name: 'Алексей Смирнов',
          executor_phone: '+79005551234',
          vehicle_capacity: 10,
          vehicle_number: 'Е789ЖЗ777',
          address: {
            city: data.city,
            street: 'пр. Ленина',
            houseNumber: '88',
          },
          scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '14:00',
          status: 'accepted',
          price: 6000,
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          accepted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          comment: 'Большой объем работы',
        },
        // Завершенные заказы (для истории)
        {
          id: `order_${Date.now()}_completed_1`,
          client_id: newUser.id,
          executor_id: 'executor_mock_1',
          executor_name: 'Иван Петров',
          vehicle_capacity: 5,
          vehicle_number: 'А123БВ777',
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
          payment_status: 'paid',
        },
        {
          id: `order_${Date.now()}_completed_2`,
          client_id: newUser.id,
          executor_id: 'executor_mock_2',
          executor_name: 'Сергей Иванов',
          vehicle_capacity: 3,
          vehicle_number: 'В456ГД199',
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
          payment_status: 'paid',
        },
        {
          id: `order_${Date.now()}_completed_3`,
          client_id: newUser.id,
          executor_id: 'executor_mock_3',
          executor_name: 'Алексей Смирнов',
          vehicle_capacity: 7,
          vehicle_number: 'Е789ЖЗ777',
          address: {
            city: data.city,
            street: 'ул. Чехова',
            houseNumber: '12',
          },
          scheduled_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '11:00',
          status: 'completed',
          price: 4200,
          created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          payment_status: 'paid',
        },
        // Отмененный заказ
        {
          id: `order_${Date.now()}_cancelled`,
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
          cancelled_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
          cancellation_reason: 'Клиент отменил заказ',
        },
      ];

      mockOrders.push(...mockTestOrders);

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
        email: data.email,
        name: data.name,
        phone_number: data.phone_number,
        phoneNumber: data.phone_number,
        role: 'executor',
        vehicle_capacity: data.vehicle_capacity,
        vehicleCapacity: data.vehicle_capacity,
        vehicle_number: data.vehicle_number,
        vehicleNumber: data.vehicle_number,
        documents: {
          passport_photo: data.documents.passport_photo,
          driver_license_photo: data.documents.driver_license_photo,
          vehicle_registration_photo: data.documents.vehicle_registration_photo,
          passportPhoto: data.documents.passport_photo,
          driverLicensePhoto: data.documents.driver_license_photo,
          vehicleRegistrationPhoto: data.documents.vehicle_registration_photo,
        },
        created_at: new Date().toISOString(),
      };

      mockUsers.push(newUser);
      currentUser = newUser;
      currentToken = `mock_token_${Date.now()}`;
      this.token = currentToken;

      // Add mock orders for executor to work with
      const executorMockOrders = [
        // Доступные заказы (для принятия)
        {
          id: `order_available_${Date.now()}_1`,
          client_id: 'client_mock_1',
          client_name: 'Мария Иванова',
          client_phone: '+79001112233',
          vehicle_capacity: 5,
          address: {
            city: 'Москва',
            street: 'ул. Тверская',
            houseNumber: '10',
          },
          scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '10:00',
          status: 'pending',
          price: 3500,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          comment: 'Нужна откачка септика',
        },
        {
          id: `order_available_${Date.now()}_2`,
          client_id: 'client_mock_2',
          client_name: 'Петр Сидоров',
          client_phone: '+79002223344',
          vehicle_capacity: 3,
          address: {
            city: 'Москва',
            street: 'пр. Мира',
            houseNumber: '55',
          },
          scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '14:00',
          status: 'pending',
          price: 2400,
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          is_urgent: true,
        },
        {
          id: `order_available_${Date.now()}_3`,
          client_id: 'client_mock_3',
          client_name: 'Анна Петрова',
          client_phone: '+79003334455',
          vehicle_capacity: 10,
          address: {
            city: 'Москва',
            street: 'ул. Ленина',
            houseNumber: '88',
          },
          scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '09:00',
          status: 'pending',
          price: 6000,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          comment: 'Большой объем',
        },
        // Принятые заказы (текущие)
        {
          id: `order_my_${Date.now()}_1`,
          client_id: 'client_mock_4',
          client_name: 'Дмитрий Козлов',
          client_phone: '+79004445566',
          executor_id: newUser.id,
          vehicle_capacity: 7,
          address: {
            city: 'Москва',
            street: 'ул. Пушкина',
            houseNumber: '22',
          },
          scheduled_date: new Date().toISOString(),
          scheduled_time: '15:00',
          status: 'accepted',
          price: 4200,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          accepted_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          comment: 'Заказ на сегодня',
        },
        {
          id: `order_my_${Date.now()}_2`,
          client_id: 'client_mock_5',
          client_name: 'Елена Смирнова',
          client_phone: '+79005556677',
          executor_id: newUser.id,
          vehicle_capacity: 5,
          address: {
            city: 'Москва',
            street: 'ул. Гагарина',
            houseNumber: '15',
          },
          scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '11:00',
          status: 'in_progress',
          price: 3500,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          accepted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          started_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        // Завершенные заказы (история)
        {
          id: `order_history_${Date.now()}_1`,
          client_id: 'client_mock_6',
          client_name: 'Игорь Волков',
          executor_id: newUser.id,
          vehicle_capacity: 5,
          address: {
            city: 'Москва',
            street: 'ул. Чехова',
            houseNumber: '33',
          },
          scheduled_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '10:00',
          status: 'completed',
          price: 3500,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          payment_status: 'paid',
        },
        {
          id: `order_history_${Date.now()}_2`,
          client_id: 'client_mock_7',
          client_name: 'Ольга Новикова',
          executor_id: newUser.id,
          vehicle_capacity: 3,
          address: {
            city: 'Москва',
            street: 'пр. Победы',
            houseNumber: '77',
          },
          scheduled_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '14:00',
          status: 'completed',
          price: 2400,
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
          payment_status: 'paid',
        },
        {
          id: `order_history_${Date.now()}_3`,
          client_id: 'client_mock_8',
          client_name: 'Владимир Соколов',
          executor_id: newUser.id,
          vehicle_capacity: 10,
          address: {
            city: 'Москва',
            street: 'ул. Маяковского',
            houseNumber: '12',
          },
          scheduled_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_time: '09:00',
          status: 'completed',
          price: 6000,
          created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          payment_status: 'paid',
        },
      ];

      mockOrders.push(...executorMockOrders);

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
        address: {
          city: data.city,
          street: data.street,
          houseNumber: data.house_number,
        },
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        comment: data.comment,
        is_urgent: data.is_urgent || false,
        status: 'pending',
        price: data.vehicle_capacity * 600,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      mockOrders.push(newOrder);

      return {
        success: true,
        data: { order: newOrder } as T,
      };
    }

    // Accept Order (executor)
    if (url.match(/\/executor\/orders\/.*\/accept/)) {
      const orderId = url.split('/')[3];
      const order = mockOrders.find(o => o.id === orderId);
      if (order) {
        order.status = 'accepted';
        order.executor_id = currentUser?.id;
        order.executor_name = currentUser?.name;
        order.accepted_at = new Date().toISOString();
      }
      return {
        success: true,
        data: { order } as T,
      };
    }

    // Complete Order (executor)
    if (url.match(/\/executor\/orders\/.*\/complete/)) {
      const orderId = url.split('/')[3];
      const order = mockOrders.find(o => o.id === orderId);
      if (order) {
        order.status = 'awaiting_payment';
        order.completed_at = new Date().toISOString();
      }
      return {
        success: true,
        data: { order } as T,
      };
    }

    // Start work (executor)
    if (url === '/executor/start-work') {
      const executorId = currentUser?.id;
      if (!executorId) {
        throw { code: 'UNAUTHORIZED', message: 'Требуется авторизация' };
      }
      
      // Проверяем баланс
      if (!(executorId in mockExecutorBalances)) {
        mockExecutorBalances[executorId] = 500;
      }
      
      if (mockExecutorBalances[executorId] < 200) {
        throw { 
          code: 'INSUFFICIENT_BALANCE', 
          message: 'Недостаточно средств на балансе. Минимум 200 ₽' 
        };
      }
      
      console.log('[MOCK] Executor started work:', executorId);
      
      return {
        success: true,
        data: {
          message: 'Работа начата',
        } as T,
      };
    }

    // Stop work (executor)
    if (url === '/executor/stop-work') {
      const executorId = currentUser?.id;
      if (!executorId) {
        throw { code: 'UNAUTHORIZED', message: 'Требуется авторизация' };
      }
      
      console.log('[MOCK] Executor stopped work:', executorId);
      
      return {
        success: true,
        data: {
          message: 'Работа завершена',
        } as T,
      };
    }

    // Pay Order
    if (url.match(/\/orders\/.*\/pay/)) {
      const orderId = url.split('/')[2];
      const order = mockOrders.find(o => o.id === orderId);
      if (order) {
        order.status = 'paid';
        order.payment_status = 'paid';
        order.payment_method = data.paymentMethod || 'card';
        order.paid_at = new Date().toISOString();
        
        console.log('[MOCK] Order paid:', {
          orderId: order.id,
          amount: order.price,
          method: order.payment_method,
        });
      }
      return {
        success: true,
        data: { 
          order,
          payment: {
            id: `payment_${Date.now()}`,
            orderId: order?.id,
            amount: order?.price,
            method: data.paymentMethod || 'card',
            status: 'success',
            paidAt: new Date().toISOString(),
          }
        } as T,
      };
    }

    // Add payment method
    if (url === '/payments/methods') {
      return {
        success: true,
        data: {
          method: {
            id: `card_${Date.now()}`,
            cardToken: `mock_card_${Date.now()}`,
            cardLast4: data.cardNumber?.slice(-4) || '0000',
            cardType: data.cardType || 'visa',
            cardHolder: data.cardHolder || 'CARD HOLDER',
            isDefault: false,
          }
        } as T,
      };
    }

    // Switch role
    if (url === '/switch-role') {
      const newRole = data.newRole;
      if (currentUser) {
        currentUser.role = newRole;
        currentToken = `mock_token_${Date.now()}_${newRole}`;
        this.token = currentToken;
        
        console.log('[MOCK] Role switched to:', newRole);
      }
      
      return {
        success: true,
        data: {
          token: currentToken,
          user: currentUser,
        } as T,
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

    // Executor deposit
    if (url === '/executor/deposit') {
      const executorId = currentUser?.id;
      if (!executorId) {
        throw { code: 'UNAUTHORIZED', message: 'Требуется авторизация' };
      }
      
      const amount = data.amount;
      if (!amount || amount < 100) {
        throw { code: 'VALIDATION_ERROR', message: 'Минимальная сумма пополнения 100 ₽' };
      }
      
      // Инициализируем баланс если его нет
      if (!(executorId in mockExecutorBalances)) {
        mockExecutorBalances[executorId] = 0;
      }
      
      // В реальности баланс пополнится после оплаты через ЮКассу
      // Здесь мы просто создаем платежную ссылку
      const paymentUrl = `https://yookassa.ru/checkout/payments/${Date.now()}`;
      
      console.log('[MOCK] Deposit payment created:', {
        executorId,
        amount,
        paymentUrl,
      });
      
      return {
        success: true,
        data: {
          paymentUrl,
          message: `Создана ссылка на оплату ${amount} ₽`,
        } as T,
      };
    }

    // Executor withdraw
    if (url === '/executor/withdraw') {
      const executorId = currentUser?.id;
      if (!executorId) {
        throw { code: 'UNAUTHORIZED', message: 'Требуется авторизация' };
      }
      
      const amount = data.amount;
      
      if (!amount || amount < 100) {
        throw { code: 'VALIDATION_ERROR', message: 'Минимальная сумма вывода 100 ₽' };
      }
      
      // Инициализируем баланс если его нет
      if (!(executorId in mockExecutorBalances)) {
        mockExecutorBalances[executorId] = 0;
      }
      
      if (mockExecutorBalances[executorId] < amount) {
        throw { code: 'INSUFFICIENT_FUNDS', message: 'Недостаточно средств на балансе' };
      }
      
      mockExecutorBalances[executorId] -= amount;
      
      console.log('[MOCK] Withdraw:', {
        executorId,
        amount,
        newBalance: mockExecutorBalances[executorId],
      });
      
      return {
        success: true,
        data: {
          balance: mockExecutorBalances[executorId],
          message: `Заявка на вывод ${amount} ₽ создана`,
        } as T,
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
    
    // Delete account
    if (url === '/account') {
      if (currentUser) {
        // Удаляем пользователя из списка
        const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
          mockUsers.splice(userIndex, 1);
        }
        
        // Удаляем или помечаем заказы пользователя
        mockOrders = mockOrders.filter(o => 
          o.client_id !== currentUser.id && o.executor_id !== currentUser.id
        );
        
        console.log('[MOCK] Account deleted:', currentUser.id);
        
        // Очищаем текущего пользователя
        currentUser = null;
        currentToken = null;
        this.token = null;
      }
      
      return { 
        success: true, 
        data: { message: 'Account deleted successfully' } as T 
      };
    }
    
    return { success: true, data: {} as T };
  }
}

export default new MockApiService();
