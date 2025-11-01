import React, { useState, useEffect } from "react"
import {
  getSeances,
  createSeance,
  updateSeance,
  deleteSeance,
  getFilms,
  getSalles
} from "../services/api"

import "../styles/dashboard.css"
import AdminSidebar from "../components/AdminSidebar"

export default function ManageSeances() {
  const [seances, setSeances] = useState([])
  const [filtered, setFiltered] = useState([])

  const [films, setFilms] = useState([])
  const [salles, setSalles] = useState([])

  // ✅ Filtres
  const [filterDate, setFilterDate] = useState("")
  const [filterFilm, setFilterFilm] = useState("")
  const [filterSalle, setFilterSalle] = useState("")
  const [filterStatut, setFilterStatut] = useState("")

  // ✅ Pagination
  const [page, setPage] = useState(1)
  const itemsPerPage = 7

  // ✅ Modal
  const [showModal, setShowModal] = useState(false)
  const [editingSeance, setEditingSeance] = useState(null)
  const [formData, setFormData] = useState({
    film_id: "",
    salle_id: "",
    date: "",
    heure: "",
  })

  // ✅ Charger données
  useEffect(() => {
    loadSeances()
    loadFilms()
    loadSalles()
  }, [])

  const loadSeances = async () => {
    const data = await getSeances()
    const list = Array.isArray(data) ? data : data.data || []
    setSeances(list)
    setFiltered(list)
  }

  const loadFilms = async () => {
    const data = await getFilms()
    setFilms(Array.isArray(data) ? data : data.data || [])
  }

  const loadSalles = async () => {
    const data = await getSalles()
    setSalles(Array.isArray(data) ? data : data.data || [])
  }

  // ✅ FILTRES
  const applyFilters = () => {
    let res = [...seances]

    if (filterDate) {
      res = res.filter(s => s.date?.slice(0, 10) === filterDate)
    }

    if (filterFilm) {
      res = res.filter(s =>
        s.film_id?.titre?.toLowerCase().includes(filterFilm.toLowerCase())
      )
    }

    if (filterSalle) {
      res = res.filter(s =>
        s.salle_id?.nom?.toLowerCase().includes(filterSalle.toLowerCase())
      )
    }

    if (filterStatut) {
      res = res.filter(s => s.statut === filterStatut)
    }

    setFiltered(res)
    setPage(1)
  }

  const resetFilters = () => {
    setFilterDate("")
    setFilterFilm("")
    setFilterSalle("")
    setFilterStatut("")
    setFiltered(seances)
  }

  // ✅ Modal submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSeance) {
        await updateSeance(editingSeance._id, formData)
      } else {
        await createSeance(formData)
      }
      setShowModal(false)
      setEditingSeance(null)
      setFormData({ film_id: "", salle_id: "", date: "", heure: "" })
      loadSeances()
    } catch (error) {
      console.error("Erreur sauvegarde séance:", error)
    }
  }

  const handleEdit = (s) => {
    setEditingSeance(s)
    setFormData({
      film_id: s.film_id?._id,
      salle_id: s.salle_id?._id,
      date: s.date?.split("T")[0],
      heure: s.heure,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette séance ?")) return
    await deleteSeance(id)
    loadSeances()
  }

  // ✅ Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const start = (page - 1) * itemsPerPage
  const currentData = filtered.slice(start, start + itemsPerPage)

  return (
    <div className="admin-container">

      <AdminSidebar />

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Gestion des Séances</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Ajouter une séance
          </button>
        </div>

        {/* ✅ FILTRES */}
        <div className="filter-bar">

          <input
            type="date"
            className="filter-input"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />

          <input
            type="text"
            className="filter-input"
            placeholder="Film..."
            value={filterFilm}
            onChange={e => setFilterFilm(e.target.value)}
          />

          <input
            type="text"
            className="filter-input"
            placeholder="Salle..."
            value={filterSalle}
            onChange={e => setFilterSalle(e.target.value)}
          />

          <select
            className="filter-select"
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value)}
          >
            <option value="">Statut...</option>
            <option value="à venir">À venir</option>
            <option value="terminée">Terminée</option>
          </select>

          <button className="filter-button filter-button-primary" onClick={applyFilters}>
            Filtrer
          </button>

          <button className="filter-button filter-button-secondary" onClick={resetFilters}>
            Reset
          </button>
        </div>

        {/* ✅ TABLEAU */}
        <div className="card table-card">
          {currentData.length === 0 ? (
            <p className="empty-message">Aucune séance.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Affiche</th>
                    <th>Film</th>
                    <th>Salle</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((s) => (
                    <tr key={s._id}>

                      {/* ✅ Affiche du film */}
                      <td>
                        <img
                          src={s.film_id?.affiche || "/placeholder.svg"}
                          alt={s.film_id?.titre}
                          className="mini-affiche"
                        />
                      </td>

                      <td>{s.film_id?.titre}</td>
                      <td>{s.salle_id?.nom}</td>
                      <td>{new Date(s.date).toLocaleDateString()}</td>
                      <td>{s.heure}</td>

                      <td>
                        <span
                          className={
                            s.statut === "à venir"
                              ? "status-badge status-confirmee"
                              : "status-badge status-annulee"
                          }
                        >
                          {s.statut}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions-cell">
                          <button className="btn btn-secondary" onClick={() => handleEdit(s)}>
                            Modifier
                          </button>

                          <button className="btn delete-button" onClick={() => handleDelete(s._id)}>
                            Supprimer
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ✅ PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="pagination-button"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              ◀
            </button>

            <span className="pagination-info">Page {page} / {totalPages}</span>

            <button
              className="pagination-button"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              ▶
            </button>
          </div>
        )}

        {/* ✅ MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">
                {editingSeance ? "Modifier la séance" : "Ajouter une séance"}
              </h2>

              <form onSubmit={handleSubmit}>

                {/* ✅ Dropdown films */}
                <div className="form-group">
                  <label className="form-label">Film</label>
                  <select
                    className="form-input"
                    value={formData.film_id}
                    onChange={(e) => setFormData({ ...formData, film_id: e.target.value })}
                    required
                  >
                    <option value="">-- Choisir un film --</option>
                    {films.map((f) => (
                      <option key={f._id} value={f._id}>{f.titre}</option>
                    ))}
                  </select>
                </div>

                {/* ✅ Dropdown salles */}
                <div className="form-group">
                  <label className="form-label">Salle</label>
                  <select
                    className="form-input"
                    value={formData.salle_id}
                    onChange={(e) => setFormData({ ...formData, salle_id: e.target.value })}
                    required
                  >
                    <option value="">-- Choisir une salle --</option>
                    {salles.map((s) => (
                      <option key={s._id} value={s._id}>{s.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Heure</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.heure}
                    onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>

                  <button type="submit" className="btn btn-primary">
                    {editingSeance ? "Mettre à jour" : "Ajouter"}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
