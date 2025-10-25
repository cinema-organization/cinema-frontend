// frontend/src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlice";

const store = configureStore({
  reducer: {
    auth: userReducer,
    // Ajoute: films: filmsReducer, etc.
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Persist au boot (check localStorage)
store.subscribe(() => {
  const token = localStorage.getItem('token');
  if (token && !store.getState().auth.isLoggedIn) {
    // Refresh user via API si token valide
    // Pour l'instant: mock ou dispatch(setUser({ role: 'user' })) après login
    console.log('Token trouvé, user à recharger');
  }
});

export default store ;