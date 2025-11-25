import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import profileReducer from './slices/profileSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    order: orderReducer,
    profile: profileReducer,
    theme: themeReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['order/setScheduledDate'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.scheduledDate'],
        // Ignore these paths in the state
        ignoredPaths: ['order.currentOrder.scheduledDate'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
