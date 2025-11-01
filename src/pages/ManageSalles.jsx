import React, { useState, useEffect } from "react"
import { 
  getSalles, 
  createSalle, 
  updateSalle, 
  deleteSalle, 
  getSeances 
} from "../services/api"

import "../styles/dashboard.css"
import AdminSidebar from "../components/AdminSidebar"

export default function ManageSalles() {

  const [salles, setSalles] = useState([])
  const [seances, setSeances] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [editingSalle, setEditingSalle] = useState(null)

  const [formData, setFormData] = useState({ nom: "", capacite: "" })
  const [tri, setTri] = useState("")

  // ✅ Pagination
  const [page, setPage] = useState(1)
  const itemsPerPage = 7

  useEffect(() => {
    loadSalles()
    loadSeances()
  }, [])

  const loadSalles = async () => {
    try {
      const res = await getSalles()
      setSalles(Array.isArray(res) ? res : res.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des salles:", error)
    }
  }

  const loadSeances = async () => {
    try {
      const res = await getSeances()
      setSeances(Array.isArray(res) ? res : res.data || [])
    } catch (error) {
      console.error("Erreur chargement séances:", error)
    }
  }

  const openAddModal = () => {
    setEditingSalle(null)
    setFormData({ nom: "", capacite: "" })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingSalle(null)
    setFormData({ nom: "", capacite: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSalle) {
        await updateSalle(editingSalle._id, formData)
      } else {
        await createSalle(formData)
      }
      closeModal()
      loadSalles()
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleEdit = (salle) => {
    setEditingSalle(salle)
    setFormData({ nom: salle.nom, capacite: salle.capacite })
    setShowModal(true)
  }

  // ✅ Empêcher suppression si salle utilisée
  const handleDelete = async (id) => {
    const liee = seances.some(s => s.salle_id?._id === id)
    if (liee) {
      alert("❌ Impossible : salle utilisée dans une séance.")
      return
    }

    if (!window.confirm("Supprimer cette salle ?")) return

    try {
      await deleteSalle(id)
      loadSalles()
    } catch (error) {
      console.error(error)
    }
  }

  // ✅ Tri
  const appliquerTri = (type) => {
    setTri(type)
    let sorted = [...salles]

    if (type === "nom") sorted.sort((a, b) => a.nom.localeCompare(b.nom))
    if (type === "capacite") sorted.sort((a, b) => a.capacite - b.capacite)

    setSalles(sorted)
  }

  // ✅ Pagination
  const totalPages = Math.ceil(salles.length / itemsPerPage)
  const start = (page - 1) * itemsPerPage
  const currentData = salles.slice(start, start + itemsPerPage)

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">

        <div className="admin-header">
          <h1 className="admin-title">Gestion des Salles</h1>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Ajouter une salle
          </button>
        </div>

        {/* ✅ Section TRI */}
        <div className="tri-section">
          <label>Trier par :</label>
          <select
            className="form-input"
            value={tri}
            onChange={(e) => appliquerTri(e.target.value)}
          >
            <option value="">Aucun</option>
            <option value="nom">Nom</option>
            <option value="capacite">Capacité</option>
          </select>
        </div>

        {/* ✅ Tableau */}
        <div className="card table-card">
          {currentData.length === 0 ? (
            <p className="empty-message">Aucune salle disponible.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Capacité</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((salle) => (
                    <tr key={salle._id}>
                      <td>{salle.nom}</td>
                      <td>{salle.capacite}</td>

                      <td>
                        <div className="table-actions-cell">
                          <button className="btn btn-secondary" onClick={() => handleEdit(salle)}>
                            Modifier
                          </button>

                          <button className="delete-button" onClick={() => handleDelete(salle._id)}>
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

        {/* ✅ Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="pagination-button"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ◀
            </button>

            <span className="pagination-info">
              Page {page} / {totalPages}
            </span>

            <button
              className="pagination-button"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              ▶
            </button>
          </div>
        )}

        {/* ✅ Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

              <h2 className="modal-title">
                {editingSalle ? "Modifier la salle" : "Ajouter une salle"}
              </h2>

              <form onSubmit={handleSubmit}>

                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Capacité</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={formData.capacite}
                    onChange={(e) => setFormData({ ...formData, capacite: e.target.value })}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Annuler
                  </button>

                  <button type="submit" className="btn btn-primary">
                    {editingSalle ? "Mettre à jour" : "Ajouter"}
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
