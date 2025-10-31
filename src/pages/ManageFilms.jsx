"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getFilms, createFilm, updateFilm, deleteFilm } from "../services/api"
import "../styles/dashboard.css"

function ManageFilms() {
  const [films, setFilms] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingFilm, setEditingFilm] = useState(null)
  const [formData, setFormData] = useState({
    titre: "",
    genre: "",
    duree: "",
    description: "",
    affiche: "",
  })

  useEffect(() => {
    loadFilms()
  }, [])

  // 🧩 Charger les films depuis l’API
  const loadFilms = async () => {
    try {
      const data = await getFilms()
      if (Array.isArray(data)) setFilms(data)
      else if (Array.isArray(data.data)) setFilms(data.data)
      else {
        console.error("Format de réponse inattendu:", data)
        setFilms([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des films:", error)
      setFilms([])
    }
  }

  // 🧾 Soumission du formulaire (ajout/modif)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingFilm) {
        await updateFilm(editingFilm._id || editingFilm.id, formData)
      } else {
        await createFilm(formData)
      }
      setShowModal(false)
      setEditingFilm(null)
      setFormData({
        titre: "",
        genre: "",
        duree: "",
        description: "",
        affiche: "",
      })
      loadFilms()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    }
  }

  // ✏️ Modifier un film
  const handleEdit = (film) => {
    setEditingFilm(film)
    setFormData({
      titre: film.titre || "",
      genre: film.genre || "",
      duree: film.duree || "",
      description: film.description || "",
      affiche: film.affiche || "",
    })
    setShowModal(true)
  }

  // 🗑️ Supprimer un film
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce film ?")) {
      try {
        await deleteFilm(id)
        loadFilms()
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  return (
    <div className="admin-container">
      {/* --- SIDEBAR --- */}
      <div className="admin-sidebar">
        <h2 className="admin-sidebar-title">🎬 CinéGo Admin</h2>
        <nav className="admin-nav">
          <Link to="/admin/dashboard" className="admin-nav-link">
            📊 Dashboard
          </Link>
          <Link to="/admin/films" className="admin-nav-link active">
            🎬 Gérer Films
          </Link>
          <Link to="/admin/salles" className="admin-nav-link">
            🏛️ Gérer Salles
          </Link>
          <Link to="/admin/seances" className="admin-nav-link">
            🎫 Gérer Séances
          </Link>
          <Link to="/admin/reservations" className="admin-nav-link">
            📋 Réservations
          </Link>
        </nav>
      </div>

      {/* --- CONTENU PRINCIPAL --- */}
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title"> Gestion des Films</h1>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Ajouter un film
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
            onChange={(e) => {
              const tri = e.target.value
              const sorted = [...films].sort((a, b) => {
                if (tri === "titre") return a.titre.localeCompare(b.titre)
                if (tri === "genre") return a.genre.localeCompare(b.genre)
                return 0
              })
              setFilms(sorted)
            }}
            className="form-input"
            style={{
              width: "180px",
              display: "inline-block",
              backgroundColor: "#121212",
            }}
          >
            <option value="">Aucun</option>
            <option value="titre">Titre</option>
            <option value="genre">Genre</option>
          </select>
        </div>

        {/* --- TABLE --- */}
        <div className="card table-card">
          {films.length === 0 ? (
            <p className="empty-message">Aucun film disponible.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Affiche</th>
                    <th>Titre</th>
                    <th>Genre</th>
                    <th>Durée</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {films.map((film) => (
                    <tr key={film._id || film.id}>
                      <td>
                        <img
                          src={film.affiche || "/placeholder.svg"}
                          alt={film.titre}
                          style={{
                            width: "50px",
                            height: "75px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      </td>
                      <td>{film.titre}</td>
                      <td>{film.genre}</td>
                      <td>{film.duree} min</td>
                      <td>{film.description?.slice(0, 50)}...</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleEdit(film)}
                            className="btn btn-secondary"
                            style={{ padding: "6px 14px" }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(film._id || film.id)}
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
                {editingFilm ? "Modifier le film" : "Ajouter un film"}
              </h2>
              <form onSubmit={handleSubmit}>
                {[
                  { key: "titre", label: "Titre" },
                  { key: "genre", label: "Genre" },
                  { key: "duree", label: "Durée (en minutes)" },
                  { key: "description", label: "Description" },
                  { key: "affiche", label: "URL de l'affiche" },
                ].map((field) => (
                  <div key={field.key} className="form-group">
                    <label className="form-label">{field.label}</label>
                    {field.key === "description" ? (
                      <textarea
                        className="form-input"
                        rows="3"
                        value={formData[field.key]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field.key]: e.target.value })
                        }
                        required
                      />
                    ) : field.key === "genre" ? (
                      <select
                        className="form-input"
                        value={formData.genre}
                        onChange={(e) =>
                          setFormData({ ...formData, genre: e.target.value })
                        }
                        required
                      >
                        <option value="">-- Sélectionner un genre --</option>
                        {[
                          "Action",
                          "Comédie",
                          "Drame",
                          "Horreur",
                          "Science-Fiction",
                          "Thriller",
                          "Romance",
                          "Animation",
                        ].map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.key === "duree" ? "number" : "text"}
                        className="form-input"
                        value={formData[field.key]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field.key]: e.target.value })
                        }
                        required
                      />
                    )}
                  </div>
                ))}

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingFilm ? "Mettre à jour" : "Ajouter"}
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

export default ManageFilms
