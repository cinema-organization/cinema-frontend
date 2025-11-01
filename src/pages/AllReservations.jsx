import React, { useState, useEffect } from "react"
import { getAllReservations, cancelReservation } from "../services/api"
import "../styles/dashboard.css"
import AdminSidebar from "../components/AdminSidebar"

export default function ManageReservations() {
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      const data = await getAllReservations()
      // le backend renvoie probablement { data: [...] } ou directement un tableau
      setReservations(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error)
    }
  }

const handleDelete = async (id, statut, dateSeance) => {
  // Vérifie avant d'envoyer la requête
  const maintenant = new Date();
  const seanceDate = new Date(dateSeance);

  if (statut !== "confirmée") {
    alert("Cette réservation est déjà annulée.");
    return;
  }

  if (seanceDate <= maintenant) {
    alert("Impossible d'annuler une réservation pour une séance passée.");
    return;
  }

  if (!window.confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

  try {
    await cancelReservation(id);
    loadReservations();
    alert("Réservation annulée avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'annulation :", error);
    alert(error.response?.data?.message || "Erreur lors de l'annulation");
  }
};


  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Toutes les Réservations</h1>
        </div>

        <div className="card table-card">
          {reservations.length === 0 ? (
            <p className="empty-message">Aucune réservation trouvée.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Film</th>
                    <th>Salle</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Places</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => {
                    const seance = r.seance_id || {}
                    const film = seance.film_id || {}
                    const salle = seance.salle_id || {}
                    const user = r.user_id || {}

                    return (
                      <tr key={r._id}>
                        <td>{user.nom || "—"}</td>
                        <td>{film.titre || "—"}</td>
                        <td>{salle.nom || "—"}</td>
                        <td>{seance.date ? new Date(seance.date).toLocaleDateString() : "—"}</td>
                        <td>{seance.heure || "—"}</td>
                        <td>{r.nombrePlaces}</td>
                        <td>{r.statut}</td>
                        <td>
                          <button
                                    onClick={() => handleDelete(r._id, r.statut, r.seance_id?.date)}
                                    className="btn"
                                    style={{
                                        background: r.statut !== "confirmée" ? "grey" : "var(--color-error)",
                                        color: "white",
                                        padding: "6px 14px",
                                        cursor: r.statut !== "confirmée" ? "not-allowed" : "pointer"
                                    }}
                                    disabled={r.statut !== "confirmée"}
                                    >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
