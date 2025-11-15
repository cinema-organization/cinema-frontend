// frontend/src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlice";

const store = configureStore({
  reducer: {
    auth: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Restaure state au boot si token/user en localStorage
const token = localStorage.getItem('token');
const userItem = localStorage.getItem('user');
let user = null;
if (userItem) {
  try {
    user = JSON.parse(userItem);  // Safe parse with try/catch
  } catch (error) {
    console.error('Invalid user in localStorage:', error);
    localStorage.removeItem('user');  // Clear corrupted
  }
}
if (token && user) {
  store.dispatch({ type: 'auth/setUser', payload: user });  // Restore user
  console.log('State restored from localStorage');
}

export default store;