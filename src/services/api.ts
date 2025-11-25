import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { APIResponse, APIError } from '../types';
import { getAuthToken, saveAuthToken, deleteAuthToken } from '../utils/secureStorage';
import mockApi, { MOCK_MODE } from './mockApi';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Типы ошибок для лучшей обработки
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION_ERROR',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

// Callback для обработки ошибок (можно использовать для показа toast)
type ErrorCallback = (error: APIError) => void;

class ApiService {
  private client: AxiosInstance;
  private errorCallback?: ErrorCallback;
  private retryCount = 0;
  private maxRetries = 2;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Устанавливает callback для обработки ошибок
   */
  public setErrorCallback(callback: ErrorCallback) {
    this.errorCallback = callback;
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async config => {
        // Добавляем токен авторизации если доступен
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Логирование запросов в dev режиме
        if (__DEV__) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }

        return config;
      },
      error => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      response => {
        // Логирование ответов в dev режиме
        if (__DEV__) {
          console.log(`[API Response] ${response.config.url}`, response.data);
        }
        return response;
      },
      async (error: AxiosError<APIError>) => {
        const apiError = this.handleError(error);

        // Вызываем callback если установлен
        if (this.errorCallback) {
          this.errorCallback(apiError);
        }

        // Retry logic для сетевых ошибок
        if (
          apiError.code === ErrorType.NETWORK &&
          this.retryCount < this.maxRetries &&
          error.config
        ) {
          this.retryCount++;
          console.log(`[API] Retrying request (${this.retryCount}/${this.maxRetries})`);
          await this.delay(1000 * this.retryCount); // Exponential backoff
          return this.client.request(error.config);
        }

        this.retryCount = 0;
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Обрабатывает ошибки и преобразует их в APIError
   */
  private handleError(error: AxiosError<APIError>): APIError {
    if (error.response) {
      // Сервер ответил с ошибкой
      const status = error.response.status;
      const data = error.response.data;

      let code: string;
      let message: string;

      switch (status) {
        case 400:
          code = ErrorType.VALIDATION;
          message = data?.message || 'Неверные данные запроса';
          break;
        case 401:
          code = ErrorType.UNAUTHORIZED;
          message = data?.message || 'Необходима авторизация';
          // Можно добавить автоматический logout
          this.handleUnauthorized();
          break;
        case 403:
          code = ErrorType.FORBIDDEN;
          message = data?.message || 'Доступ запрещен';
          break;
        case 404:
          code = ErrorType.NOT_FOUND;
          message = data?.message || 'Ресурс не найден';
          break;
        case 500:
        case 502:
        case 503:
          code = ErrorType.SERVER;
          message = data?.message || 'Ошибка сервера. Попробуйте позже';
          break;
        default:
          code = data?.code || ErrorType.UNKNOWN;
          message = data?.message || 'Произошла ошибка';
      }

      return {
        code,
        message,
        details: data?.details,
        status,
      };
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      if (error.code === 'ECONNABORTED') {
        return {
          code: ErrorType.TIMEOUT,
          message: 'Превышено время ожидания. Проверьте подключение к интернету',
        };
      }
      return {
        code: ErrorType.NETWORK,
        message: 'Ошибка сети. Проверьте подключение к интернету',
      };
    } else {
      // Что-то другое произошло
      return {
        code: ErrorType.UNKNOWN,
        message: error.message || 'Произошла неизвестная ошибка',
      };
    }
  }

  /**
   * Обрабатывает ошибку 401 (неавторизован)
   */
  private async handleUnauthorized() {
    // Очищаем токен
    await this.clearToken();
    // Здесь можно добавить редирект на экран логина
    // navigationRef.current?.navigate('Login');
  }

  /**
   * Задержка для retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Получает токен из Secure Storage
   */
  private async getToken(): Promise<string | null> {
    try {
      return await getAuthToken();
    } catch (error) {
      console.error('[API] Error getting token:', error);
      return null;
    }
  }

  /**
   * Сохраняет токен в Secure Storage
   */
  public async setToken(token: string): Promise<void> {
    if (MOCK_MODE) {
      await mockApi.setToken(token);
      return;
    }
    try {
      await saveAuthToken(token);
    } catch (error) {
      console.error('[API] Error setting token:', error);
    }
  }

  /**
   * Удаляет токен из Secure Storage
   */
  public async clearToken(): Promise<void> {
    if (MOCK_MODE) {
      await mockApi.clearToken();
      return;
    }
    try {
      await deleteAuthToken();
    } catch (error) {
      console.error('[API] Error clearing token:', error);
    }
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<APIResponse<T>> {
    if (MOCK_MODE) {
      return mockApi.get<T>(url, params);
    }
    const response = await this.client.get<APIResponse<T>>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<APIResponse<T>> {
    if (MOCK_MODE) {
      return mockApi.post<T>(url, data);
    }
    const response = await this.client.post<APIResponse<T>>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<APIResponse<T>> {
    if (MOCK_MODE) {
      return mockApi.put<T>(url, data);
    }
    const response = await this.client.put<APIResponse<T>>(url, data);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<APIResponse<T>> {
    if (MOCK_MODE) {
      return mockApi.delete<T>(url);
    }
    const response = await this.client.delete<APIResponse<T>>(url, config);
    return response.data;
  }
}

export default new ApiService();
