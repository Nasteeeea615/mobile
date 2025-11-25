// User types
export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  role: 'client' | 'executor' | 'admin';
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  clientProfile?: ClientProfile;
  executorProfile?: ExecutorProfile;
}

export interface ClientProfile {
  city: string;
  street: string;
  houseNumber: string;
  savedPaymentMethods: PaymentMethod[];
}

export interface ExecutorProfile {
  vehicleNumber: string;
  vehicleCapacity: 3 | 5 | 10;
  isVerified: boolean;
  isWorking: boolean;
  rating: number;
  completedOrdersCount: number;
}

// Order types
export interface Order {
  id: string;
  clientId: string;
  executorId?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  vehicleCapacity: 3 | 5 | 10;
  address: {
    city: string;
    street: string;
    houseNumber: string;
  };
  scheduledDate: Date;
  scheduledTime: string;
  comment?: string;
  isUrgent: boolean;
  price: number;
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  client?: User;
  executor?: User;
  payment?: Payment;
}

export interface CreateOrderDTO {
  vehicleCapacity: 3 | 5 | 10;
  address: {
    city: string;
    street: string;
    houseNumber: string;
  };
  scheduledDate: Date;
  scheduledTime: string;
  comment?: string;
  isUrgent: boolean;
}

// Payment types
export interface Payment {
  id: string;
  orderId: string;
  clientId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: PaymentMethod;
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
  order?: Order;
}

export interface PaymentMethod {
  type: 'card' | 'saved_card';
  cardLast4?: string;
  cardToken?: string;
}

// Support types
export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  messages?: Message[];
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  content: string;
  createdAt: Date;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'order_accepted' | 'order_completed' | 'payment_success' | 'new_order' | 'ticket_reply';
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

// Auth types
export interface ClientRegistrationData {
  phoneNumber: string;
  name: string;
  city: string;
  street: string;
  houseNumber: string;
  agreedToTerms: boolean;
}

export interface ExecutorRegistrationData {
  phoneNumber: string;
  name: string;
  vehicleNumber: string;
  vehicleCapacity: 3 | 5 | 10;
  agreedToTerms: boolean;
}

export interface UpdateProfileDTO {
  name?: string;
  city?: string;
  street?: string;
  houseNumber?: string;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  status?: number;
}
