// src/services/api.js
import axios from "axios";

// Configuration de l'API
const api = axios.create({
  baseURL: "http://localhost:5000/api",  // Ton backend Express
});

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper pour les réponses (gestion success/error)
const handleResponse = (response) => {
  if (response.data.success !== false) {
    return { success: true, data: response.data.data || response.data, message: response.data.message || "Succès" };
  }
  throw new Error(response.data.message || "Erreur API");
};

// Auth
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Une erreur est survenue lors de la connexion" };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Une erreur est survenue lors de l'inscription" };
  }
};

// Films
export const getFilms = async () => {
  try {
    const response = await api.get("/films");
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.message || "Erreur lors du chargement des films" };
  }
};

export const getFilmById = async (id) => {
  try {
    const response = await api.get(`/films/${id}`);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.message || "Film introuvable" };
  }
};

export const createFilm = async (filmData) => {
  try {
    const response = await api.post("/films", filmData);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Erreur lors de la création du film" };
  }
};

export const updateFilm = async (id, filmData) => {
  try {
    const response = await api.put(`/films/${id}`, filmData);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Erreur lors de la mise à jour du film" };
  }
};

export const deleteFilm = async (id) => {
  try {
    const response = await api.delete(`/films/${id}`);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Erreur lors de la suppression du film" };
  }
};

// Salles
export const getSalles = async () => {
  try {
    const response = await api.get("/salles");
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.message || "Erreur lors du chargement des salles" };
  }
};

export const createSalle = async (salleData) => {
  try {
    const response = await api.post("/salles", salleData);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Erreur lors de la création de la salle" };
  }
};

export const updateSalle = async (id, salleData) => {
  try {
    const response = await api.put(`/salles/${id}`, salleData);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Erreur lors de la mise à jour de la salle" };
  }
};

export const deleteSalle = async (id) => {
  try {
    const response = await api.delete(`/salles/${id}`);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Erreur lors de la suppression de la salle" };
  }
};

// Séances
export const getSeances = async () => {
  try {
    const response = await api.get("/seances");
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.message || "Erreur lors du chargement des séances" };
  }
};

export const getSeancesByFilm = async (filmId) => {
  try {
    const response = await api.get(`/seances?film_id=${filmId}`);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.message || "Erreur lors du chargement des séances du film" };
  }
};

export const createSeance = async (seanceData) => {
  try {
    const response = await api.post("/seances", seanceData);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Erreur lors de la création de la séance" };
  }
};

export const updateSeance = async (id, seanceData) => {
  try {
    const response = await api.put(`/seances/${id}`, seanceData);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Erreur lors de la mise à jour de la séance" };
  }
};

export const deleteSeance = async (id) => {
  try {
    const response = await api.delete(`/seances/${id}`);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Erreur lors de la suppression de la séance" };
  }
};

// Réservations
export const getMyReservations = async () => {
  try {
    const response = await api.get("/reservations/mes-reservations");
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.message || "Erreur lors du chargement de vos réservations" };
  }
};

export const getAllReservations = async () => {
  try {
    const response = await api.get("/reservations");
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.message || "Erreur lors du chargement des réservations" };
  }
};

export const createReservation = async (reservationData) => {
  try {
    const response = await api.post("/reservations", reservationData);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Erreur lors de la création de la réservation" };
  }
};

export const cancelReservation = async (id) => {
  try {
    const response = await api.put(`/reservations/${id}/annuler`);
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Erreur lors de l'annulation de la réservation" };
  }
};

export const updateReservationStatus = async (id, statut) => {
  try {
    const response = await api.put(`/reservations/${id}/status`, { statut });
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Erreur lors de la mise à jour du statut" };
  }
};

// Stats (ajoute si backend a /stats, sinon mock ou supprime)
export const getStats = async () => {
  try {
    const response = await api.get("/stats");
    return handleResponse(response);
  } catch (error) {
    return { success: false, message: error.message || "Erreur lors du chargement des stats" };
  }
};

export default api;  // Export instance pour utilisation directe