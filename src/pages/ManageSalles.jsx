import React, { useState, useEffect } from "react"
import { getSalles, createSalle, updateSalle, deleteSalle } from "../services/api"
import "../styles/dashboard.css"
import AdminSidebar from "../components/AdminSidebar"

export default function ManageSalles() {
  const [salles, setSalles] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingSalle, setEditingSalle] = useState(null)
  const [formData, setFormData] = useState({ nom: "", capacite: "" })

  useEffect(() => {
    loadSalles()
  }, [])

  const loadSalles = async () => {
    try {
      const data = await getSalles()
      setSalles(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des salles:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSalle) {
        await updateSalle(editingSalle._id, formData)
      } else {
        await createSalle(formData)
      }
      setShowModal(false)
      setEditingSalle(null)
      setFormData({ nom: "", capacite: "" })
      loadSalles()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la salle:", error)
    }
  }

  const handleEdit = (salle) => {
    setEditingSalle(salle)
    setFormData({ nom: salle.nom, capacite: salle.capacite })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette salle ?")) {
      try {
        await deleteSalle(id)
        loadSalles()
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
          <h1 className="admin-title">Gestion des Salles</h1>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Ajouter une Salle
          </button>
        </div>

        <div
          className="tri-section"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <label style={{ fontWeight: "600", color: "var(--color-text-secondary)" }}>
            Trier par :
          </label>
          <select
            onChange={(e) => {
              const tri = e.target.value
              const sorted = [...salles].sort((a, b) => {
                if (tri === "nom") return a.nom.localeCompare(b.nom)
                if (tri === "capacite") return a.capacite - b.capacite
                return 0
              })
              setSalles(sorted)
            }}
            className="form-input"
            style={{ width: "180px", backgroundColor: "#121212" }}
          >
            <option value="">Aucun</option>
            <option value="nom">Nom</option>
            <option value="capacite">Capacité</option>
          </select>
        </div>

        <div className="card table-card">
          {salles.length === 0 ? (
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
                  {salles.map((salle) => (
                    <tr key={salle._id}>
                      <td>{salle.nom}</td>
                      <td>{salle.capacite}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleEdit(salle)}
                            className="btn btn-secondary"
                            style={{ padding: "6px 14px" }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(salle._id)}
                            className="btn"
                            style={{
                              padding: "6px 14px",
                              background: "var(--color-error)",
                              color: "white",
                            }}
                          >
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

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ marginBottom: "24px" }}>
                {editingSalle ? "Modifier la salle" : "Ajouter une salle"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacité</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.capacite}
                    onChange={(e) =>
                      setFormData({ ...formData, capacite: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                  >
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
