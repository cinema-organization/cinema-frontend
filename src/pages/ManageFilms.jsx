"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getFilms, createFilm, updateFilm, deleteFilm } from "../services/api"
import "../styles/dashboard.css"
import AdminSidebar from "../components/AdminSidebar"

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

  // ✅ Charger les films depuis l’API
  const loadFilms = async () => {
    try {
      const data = await getFilms()
      if (Array.isArray(data)) setFilms(data)
      else if (Array.isArray(data.data)) setFilms(data.data)
      else setFilms([])
    } catch (error) {
      console.error("Erreur chargement films:", error)
      setFilms([])
    }
  }

  // ✅ Soumission formulaire
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
      console.error("Erreur sauvegarde film:", error)
    }
  }

  // ✅ Modifier un film
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

  // ✅ Supprimer un film
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce film ?")) return

    try {
      await deleteFilm(id)
      loadFilms()
    } catch (error) {
      console.error("Erreur suppression film:", error)
    }
  }

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        
        {/* HEADER */}
        <div className="admin-header">
          <h1 className="admin-title">Gestion des Films</h1>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Ajouter un film
          </button>
        </div>

        {/* ✅ TRI (PROPRE, UNIFORME) */}
        <div className="tri-section">
          <label>Trier par :</label>

          <select
            className="form-input"
            onChange={(e) => {
              const tri = e.target.value
              const sorted = [...films].sort((a, b) => {
                if (tri === "titre") return a.titre.localeCompare(b.titre)
                if (tri === "genre") return a.genre.localeCompare(b.genre)
                return 0
              })
              setFilms(sorted)
            }}
          >
            <option value="">Aucun</option>
            <option value="titre">Titre</option>
            <option value="genre">Genre</option>
          </select>
        </div>

        {/* ✅ TABLEAU */}
        <div className="card table-card">
          {films.length === 0 ? (
            <p className="empty-message">Aucun film trouvé.</p>
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
                          className="mini-affiche"
                        />
                      </td>

                      <td>{film.titre}</td>
                      <td>{film.genre}</td>
                      <td>{film.duree} min</td>
                      <td>{film.description?.slice(0, 50)}...</td>

                      <td>
                        <div className="table-actions-cell">
                          <button
                            onClick={() => handleEdit(film)}
                            className="btn btn-secondary"
                          >
                            Modifier
                          </button>

                          <button
                            onClick={() => handleDelete(film._id || film.id)}
                            className="delete-button"
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

        {/* ✅ MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

              <h2 className="modal-title">
                {editingFilm ? "Modifier le film" : "Ajouter un film"}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Champs du formulaire */}
                {[
                  { key: "titre", label: "Titre" },
                  { key: "genre", label: "Genre" },
                  { key: "duree", label: "Durée (minutes)" },
                  { key: "description", label: "Description" },
                  { key: "affiche", label: "URL de l'affiche" },
                ].map((field) => (
                  <div key={field.key} className="form-group">
                    <label className="form-label">{field.label}</label>

                    {field.key === "description" ? (
                      <textarea
                        className="form-input"
                        rows="3"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
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
                        <option value="">-- Choisir un genre --</option>
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
                          <option key={g} value={g}>{g}</option>
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
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>

                  <button type="submit" className="btn btn-primary">
                    {editingFilm ? "Sauvegarder" : "Ajouter"}
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
