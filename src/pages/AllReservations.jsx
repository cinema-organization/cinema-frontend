import React, { useState, useEffect } from "react"
import { getAllReservations, deleteReservation } from "../services/api"
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
      setReservations(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer définitivement cette réservation ?")) {
      try {
        await deleteReservation(id)
        loadReservations()
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

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

                    const badgeClass =
                      r.statut === "confirmée"
                        ? "badge badge-success"
                        : "badge badge-danger"

                    return (
                      <tr key={r._id}>
                        <td>{user.nom || "—"}</td>
                        <td>{film.titre || "—"}</td>
                        <td>{salle.nom || "—"}</td>
                        <td>
                          {seance.date
                            ? new Date(seance.date).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>{seance.heure || "—"}</td>
                        <td>{r.nombrePlaces}</td>

                        {/* ✅ Badge pour statut */}
                        <td>
                          <span className={badgeClass}>{r.statut}</span>
                        </td>

                        <td>
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="btn"
                            style={{
                              background: "var(--color-error)",
                              color: "white",
                              padding: "6px 14px",
                            }}
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
