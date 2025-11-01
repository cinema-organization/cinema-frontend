import React, { useState, useEffect } from "react"
import { getAllReservations, deleteReservation } from "../services/api"
import "../styles/dashboard.css"
import AdminSidebar from "../components/AdminSidebar"

export default function ManageReservations() {
  const [reservations, setReservations] = useState([])
  const [filtered, setFiltered] = useState([])

  // ✅ Filtres
  const [filterDate, setFilterDate] = useState("")
  const [filterFilm, setFilterFilm] = useState("")
  const [filterUser, setFilterUser] = useState("")
  const [filterStatut, setFilterStatut] = useState("")

  // ✅ Pagination
  const [page, setPage] = useState(1)
  const itemsPerPage = 7

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      const data = await getAllReservations()
      const list = Array.isArray(data) ? data : data.data || []
      setReservations(list)
      setFiltered(list)
    } catch (error) {
      console.error("Erreur chargement réservations:", error)
    }
  }

  // ✅ Filtres
  const applyFilters = () => {
    let res = [...reservations]

    if (filterDate) {
      res = res.filter(r => r.createdAt?.slice(0, 10) === filterDate)
    }

    if (filterFilm) {
      res = res.filter(r =>
        r.seance_id?.film_id?.titre?.toLowerCase().includes(filterFilm.toLowerCase())
      )
    }

    if (filterUser) {
      res = res.filter(r =>
        r.user_id?.nom?.toLowerCase().includes(filterUser.toLowerCase())
      )
    }

    if (filterStatut) {
      res = res.filter(r => r.statut === filterStatut)
    }

    setFiltered(res)
    setPage(1)
  }

  const resetFilters = () => {
    setFilterDate("")
    setFilterFilm("")
    setFilterUser("")
    setFilterStatut("")
    setFiltered(reservations)
  }

  // ✅ Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const start = (page - 1) * itemsPerPage
  const currentData = filtered.slice(start, start + itemsPerPage)

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette réservation ?")) return
    try {
      await deleteReservation(id)
      loadReservations()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <h1 className="admin-title">Toutes les Réservations</h1>

        {/* ✅ BARRE DE FILTRES*/}
        <div className="filter-bar">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-input"
          />

          <input
            type="text"
            placeholder="Film..."
            value={filterFilm}
            onChange={(e) => setFilterFilm(e.target.value)}
            className="filter-input"
          />

          <input
            type="text"
            placeholder="Client..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="filter-input"
          />

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="filter-select"
          >
            <option value="">Statut...</option>
            <option value="confirmée">Confirmée</option>
            <option value="annulée">Annulée</option>
          </select>

          <button
            onClick={applyFilters}
            className="filter-button filter-button-primary"
          >
            Filtrer
          </button>

          <button
            onClick={resetFilters}
            className="filter-button filter-button-secondary"
          >
            Reset
          </button>
        </div>

        {/* ✅ TABLEAU */}
        <div className="card table-card">
          {currentData.length === 0 ? (
            <p className="empty-message">Aucune réservation.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Film</th>
                    <th>Salle</th>
                    <th>Date séance</th>
                    <th>Heure</th>
                    <th>Places</th>
                    <th>Statut</th>
                    <th>Réservé le</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((r) => {
                    const seance = r.seance_id || {}
                    return (
                      <tr key={r._id}>
                        <td>{r.user_id?.nom}</td>
                        <td>{seance.film_id?.titre}</td>
                        <td>{seance.salle_id?.nom}</td>
                        <td>{seance.date ? new Date(seance.date).toLocaleDateString() : "—"}</td>
                        <td>{seance.heure || "—"}</td>
                        <td>{r.nombrePlaces}</td>

                        <td>
                          <span className={`status-badge ${r.statut === "confirmée" ? "status-confirmee" : "status-annulee"}`}>
                            {r.statut}
                          </span>
                        </td>

                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>

                        <td>
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="delete-button"
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

        {/* ✅ PAGINATION - Utilise classes CSS */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="pagination-button pagination-button-prev"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ◀
            </button>

            <span className="pagination-info">
              Page {page} / {totalPages}
            </span>

            <button
              className="pagination-button pagination-button-next"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </div>
  )
}