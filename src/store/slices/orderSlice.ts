import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '../../types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setOrders, setCurrentOrder, addOrder, updateOrder, setLoading } =
  orderSlice.actions;
export default orderSlice.reducer;
