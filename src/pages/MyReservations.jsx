// src/pages/MyReservations.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyReservations, cancelReservation } from "../services/api";
import "../styles/reservations.css";

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const res = await getMyReservations();
      if (res.success) {
        // res.data doit être un tableau d'objets réservation
        const list = Array.isArray(res.data) ? res.data : res.data.data || [];
        setReservations(list);
      } else {
        setError(res.message || "Erreur lors du chargement des réservations");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;
    setCancellingId(id);
    try {
      const res = await cancelReservation(id);
      if (res.success) {
        // Mettre à jour localement (si backend renvoie nouvelle réservation, on peut l'utiliser)
        // Ici on reload pour rester simple et fiable
        await loadReservations();
      } else {
        alert(res.message || "Impossible d'annuler la réservation");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'annulation");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <div className="spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center", color: "var(--color-text-secondary)" }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="reservations-container">
      <div className="container">
        <div className="reservations-header">
          <h1 className="reservations-title">Mes Réservations</h1>
        </div>

        {reservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <h2>Aucune réservation</h2>
            <p>Vous n'avez pas encore réservé de places</p>
            <Link to="/films" className="btn btn-primary">
              Découvrir les films
            </Link>
          </div>
        ) : (
          <div className="reservations-list">
            {reservations.map((r) => {
              // Les champs selon la réponse API : r._id, r.user_id, r.seance_id, r.nombrePlaces, r.statut
              const filmTitle = r.seance_id?.film_id?.titre || "—";
              const poster = r.seance_id?.film_id?.affiche || "/placeholder.svg";
              const seanceDate = r.seance_id?.date ? new Date(r.seance_id.date) : null;
              const seanceTime = r.seance_id?.heure || "";
              const salleName = r.seance_id?.salle_id?.nom || "";

              return (
                <div key={r._id} className="reservation-card">
                  <img src={poster} alt={filmTitle} className="reservation-poster" />
                  <div className="reservation-details">
                    <h3 className="reservation-title">{filmTitle}</h3>

                    {seanceDate && (
                      <div className="reservation-info">
                        <span>📅</span>
                        <span>{seanceDate.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                    )}

                    <div className="reservation-info">
                      <span>🕐</span>
                      <span>{seanceTime}</span>
                    </div>

                    <div className="reservation-info">
                      <span>🏛️Salle </span>
                      <span>{salleName}</span>
                    </div>

                    <div className="reservation-info">
                      <span>🎫</span>
                      <span>{r.nombrePlaces} place(s)</span>
                    </div>
                  </div>

                  <div className="reservation-actions">
                    <div className="reservation-status">
                      <span className={`badge ${r.statut === "confirmée" ? "badge-success" : "badge-danger"}`}>
                        {r.statut === "confirmée" ? "Confirmée" : "Annulée"}
                      </span>
                    </div>

                    {r.statut === "confirmée" && (
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancel(r._id)}
                        disabled={cancellingId === r._id}
                      >
                        {cancellingId === r._id ? "Annulation..." : "Annuler"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
