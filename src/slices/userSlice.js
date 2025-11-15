import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../services/api";

// 🔹 Safe parse utilitaire (fix crash JSON.parse(null/undefined))
const safeParse = (item) => {
  if (!item) return null;
  try {
    return JSON.parse(item);
  } catch {
    return null;  // Fallback si corrompu
  }
};

// Initial state avec safe load from localStorage
const initialState = {
  user: safeParse(localStorage.getItem("user")),  // Fix: Safe parse
  isLoggedIn: !!safeParse(localStorage.getItem("user")),  // Fix: Safe + bool
  loading: false,
  error: null,
};

// 🔹 Login async
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await axios.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));  // Save user
      return response.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Erreur de connexion");
    }
  }
);

// 🔹 Register async
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ nom, email, password }, thunkAPI) => {
    try {
      const response = await axios.post("/auth/register", { nom, email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));  // Save user
      return response.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Erreur d'inscription");
    }
  }
);

const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");  // Clear user
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
      state.error = null;
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));  // Save on set
      }
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
        state.user = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isLoggedIn = false;
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

export const { logout, setUser, clearError } = userSlice.actions;
export default userSlice.reducer;