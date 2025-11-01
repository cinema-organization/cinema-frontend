"use client"

import { useState, useEffect } from "react"
import { getSeances, createSeance, updateSeance, deleteSeance } from "../services/api"
import "../styles/dashboard.css"
import AdminSidebar from "../components/AdminSidebar"

function ManageSeances() {
  const [seances, setSeances] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingSeance, setEditingSeance] = useState(null)
  const [formData, setFormData] = useState({
    film: "",
    salle: "",
    date: "",
    heure: "",
  })

  const [setTri] = useState("")

  useEffect(() => {
    loadSeances()
  }, [])

  // 🧩 Charger les séances depuis l’API
  const loadSeances = async () => {
    try {
      const data = await getSeances()
      if (Array.isArray(data)) setSeances(data)
      else if (Array.isArray(data.data)) setSeances(data.data)
      else {
        console.error("Format de réponse inattendu:", data)
        setSeances([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des séances:", error)
      setSeances([])
    }
  }

  // 🧾 Soumission du formulaire (ajout/modif)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSeance) {
        await updateSeance(editingSeance._id || editingSeance.id, formData)
      } else {
        await createSeance(formData)
      }
      setShowModal(false)
      setEditingSeance(null)
      setFormData({
        film: "",
        salle: "",
        date: "",
        heure: "",
      })
      loadSeances()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    }
  }

  // ✏️ Modifier une séance
  const handleEdit = (seance) => {
    setEditingSeance(seance)
    setFormData({
      film: seance.film_id?.titre || seance.film || "",
      salle: seance.salle_id?.nom || seance.salle || "",
      date: seance.date ? seance.date.split("T")[0] : "",
      heure: seance.heure || "",
    })
    setShowModal(true)
  }

  // 🗑️ Supprimer une séance
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) {
      try {
        await deleteSeance(id)
        loadSeances()
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  // 🧮 Tri
  const handleTri = (val) => {
    setTri(val)
    const sorted = [...seances].sort((a, b) => {
      if (val === "film") return (a.film_id?.titre || "").localeCompare(b.film_id?.titre || "")
      if (val === "salle") return (a.salle_id?.nom || "").localeCompare(b.salle_id?.nom || "")
      if (val === "statut") return (a.statut || "").localeCompare(b.statut || "")
      return 0
    })
    setSeances(sorted)
  }

  return (
    <div className="admin-container">
      {/* --- SIDEBAR --- */}
      <AdminSidebar />

      {/* --- CONTENU PRINCIPAL --- */}
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Gestion des Séances</h1>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Ajouter une séance
          </button>
        </div>

        {/* --- TRI --- */}
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
            onChange={(e) => handleTri(e.target.value)}
            className="form-input"
            style={{
              width: "180px",
              display: "inline-block",
              backgroundColor: "#121212",
            }}
          >
            <option value="">Aucun</option>
            <option value="film">Film</option>
            <option value="salle">Salle</option>
            <option value="statut">Statut</option>
          </select>
        </div>

        {/* --- TABLE --- */}
        <div className="card table-card">
          {seances.length === 0 ? (
            <p className="empty-message">Aucune séance disponible.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Film</th>
                    <th>Salle</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {seances.map((s) => (
                    <tr key={s._id}>
                      <td>{s.film_id?.titre || "—"}</td>
                      <td>{s.salle_id?.nom || "—"}</td>
                      <td>{new Date(s.date).toLocaleDateString()}</td>
                      <td>{s.heure}</td>
                      <td>
                        <span
                          style={{
                            color: s.statut === "terminée" ? "gray" : "limegreen",
                            fontWeight: "bold",
                          }}
                        >
                          {s.statut || "—"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleEdit(s)}
                            className="btn btn-secondary"
                            style={{ padding: "6px 14px" }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(s._id || s.id)}
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

        {/* --- MODAL --- */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ marginBottom: "24px" }}>
                {editingSeance ? "Modifier la séance" : "Ajouter une séance"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Film</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.film}
                    onChange={(e) => setFormData({ ...formData, film: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Salle</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.salle}
                    onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                    required
                  />
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
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                  >
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

export default ManageSeances
