// frontend/src/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../services/api";

// 🔹 Login async
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await axios.post("/auth/login", { email, password });  // Fix: /auth/login (cohérent backend)
      // Backend renvoie { token, user: { nom, email, role } }
      localStorage.setItem("token", response.data.token);
      return response.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Erreur de connexion");
    }
  }
);

// 🔹 Register async (ajoute si besoin)
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ nom, email, password }, thunkAPI) => {
    try {
      const response = await axios.post("/auth/register", { nom, email, password });
      localStorage.setItem("token", response.data.token);
      return response.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Erreur d'inscription");
    }
  }
);

const userSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,  // { nom, email, role }
    isLoggedIn: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.error = null;
      localStorage.removeItem("token");
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;  // Utilisé ici
        state.isLoggedIn = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isLoggedIn = false;  // Force false sur erreur
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
