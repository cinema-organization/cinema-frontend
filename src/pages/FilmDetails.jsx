//pages/FilmDetails.jsx
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { getFilmById, createReservation } from "../services/api"
import "../styles/general.css"
import "../styles/home.css"

function FilmDetails() {
  const { id } = useParams()
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [film, setFilm] = useState(null)
  const [seances, setSeances] = useState([])
  const [selectedSeance, setSelectedSeance] = useState(null)
  const [nombrePlaces, setNombrePlaces] = useState(1)
  const [loading, setLoading] = useState(true)
  const [reservationLoading, setReservationLoading] = useState(false)

  // 🔹 Charger les données du film et ses séances
  useEffect(() => {
    const loadFilmData = async () => {
      try {
        const data = await getFilmById(id)
        if (data?.success && data.data?.film) {
          setFilm(data.data.film)

          const seancesLoaded = data.data.seances || []
          const seancesAvecStatut = seancesLoaded.map((s) => {
            const statut = calculerStatutAffichage(s)
            return {
              ...s,
              statut: statut
            }
          })
          setSeances(seancesAvecStatut)
        } else {
          console.warn("No film data:", data)
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFilmData()
  }, [id])

  // 🔹 Mise à jour automatique du statut des séances toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setSeances((prev) =>
        prev.map((s) => ({ ...s, statut: calculerStatutAffichage(s) }))
      )
    }, 60000) // toutes les 60 secondes

    return () => clearInterval(interval)
  }, [])

  // 🔹 Calcul du statut (à venir / terminée / invisible)
  function calculerStatutAffichage(seance) {
    if (!seance?.date || !seance?.heure) return "à venir"

    const [heures, minutes] = String(seance.heure).split(":").map(Number)
    const dateSeance = new Date(seance.date)
    dateSeance.setHours(heures ?? 0, minutes ?? 0, 0, 0)

    const maintenant = new Date()

    // Fix: Use local date for comparison (avoid UTC/local mismatch)
    const memeJour =
      dateSeance.toLocaleDateString('en-CA') === maintenant.toLocaleDateString('en-CA')  // YYYY-MM-DD local

    let statut

    if (dateSeance > maintenant) {
      statut = "à venir"
    } else if (memeJour) {
      statut = "terminée"
    } else {
      statut = "invisible"
    }

    return statut
  }

  // 🔹 Filtrage : garde les séances à venir et celles terminées du jour
  // 📅 On récupère la date du jour au format YYYY-MM-DD local
  const now = new Date();
  const today = now.toLocaleDateString('en-CA');  // Fix: Local YYYY-MM-DD

  const seancesFiltrees = seances.filter((seance) => {
    const dateSeance = new Date(seance.date);
    const dateStr = dateSeance.toLocaleDateString('en-CA');  // Fix: Local comparison

    // ✅ Garder les séances "à venir"
    if (seance.statut === "à venir") {
      return true;
    }

    // ✅ Garder les séances "terminées" du jour même
    if (seance.statut === "terminée" && dateStr === today) {
      return true;
    }

    // ❌ Sinon (terminée d'un autre jour) → on la masque
    return false;
  });

  // 🔹 Si la séance sélectionnée devient invisible → la désélectionner
  useEffect(() => {
    if (selectedSeance) {
      const stillVisible = seancesFiltrees.some(
        (s) => s._id === selectedSeance._id
      )
      if (!stillVisible) setSelectedSeance(null)
    }
  }, [seancesFiltrees, selectedSeance])

  // 🔹 Gestion de la réservation
  const handleReservation = async () => {
    if (!user) {
      alert("⚠️ Vous devez être connecté pour réserver un film !")
      navigate("/login")
      return
    }

    if (!selectedSeance) {
      alert("Veuillez sélectionner une séance")
      return
    }

    if (reservationLoading) return
    setReservationLoading(true)

    try {
      const response = await createReservation({
        seance_id: selectedSeance._id,
        nombrePlaces,
      })

      console.log("Reservation response:", response)  // Debug full response

      if (response.success === false) {
        alert("❌ " + response.message)
        return
      }

      if (response.error) {
        alert("❌ " + response.error)
        return
      }

      if (response.success === true || response.data) {
        alert("✅ Réservation effectuée avec succès !")
        setNombrePlaces(1)
        setSelectedSeance(null)
      } else {
        alert("❌ Réponse inattendue du serveur")
      }
    } catch (error) {
      console.error("Erreur lors de la réservation:", error)
      if (error.response) {
        const status = error.response.status
        const message =
          error.response.data?.message || error.response.data?.error
        if (status === 400)
          alert(
            `❌ ${
              message ||
              "Séance complète ou réservation déjà existante !"
            }`
          )
        else if (status === 404) alert("❌ Séance non trouvée")
        else if (status === 409)
          alert("❌ Vous avez déjà une réservation pour cette séance")
        else
          alert(
            `❌ Erreur serveur (${status}): ${
              message || "Veuillez réessayer"
            }`
          )
      } else if (error.request) {
        alert("❌ Impossible de contacter le serveur. Vérifiez votre connexion.")
      } else {
        alert("❌ Erreur inattendue: " + error.message)
      }
    } finally {
      setReservationLoading(false)
    }
  }

  // 🔹 Chargement ou erreur
  if (loading) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto" }}></div>
      </div>
    )
  }

  if (!film) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>Film non trouvé</h2>
      </div>
    )
  }

  // 🔹 Rendu principal
  return (
    <div className="film-details-container">
      <div className="container">
        <div className="film-details-grid">
          <div>
            <img
              src={film.affiche || "/placeholder.svg"}
              alt={film.titre}
              className="film-poster"
            />
          </div>
          <div className="film-info-section">
            <h1>{film.titre}</h1>
            <div className="film-badges">
              <span className="badge badge-warning">{film.genre}</span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                {film.duree} min
              </span>
            </div>
            <p className="film-description">{film.description}</p>
          </div>
        </div>

        <div className="card seances-card">
          <h2>Séances disponibles</h2>
          <div style={{ display: "grid", gap: "16px" }}>
            {Array.isArray(seancesFiltrees) && seancesFiltrees.length > 0 ? (
              seancesFiltrees.map((seance) => (
                <div
                  key={seance._id}
                  onClick={() => setSelectedSeance(seance)}
                  className={`seance-item ${
                    selectedSeance?._id === seance._id ? "selected" : ""
                  }`}
                >
                  <div className="seance-header">
                    <div>
                      <div className="seance-date">
                        {new Date(seance.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="seance-time">
                        {seance.heure} — Salle {seance.salle_id?.nom}
                      </div>
                    </div>
                    <div className="seance-availability">
                      <div className="seance-label">Statut</div>
                      <div className="seance-seats">{seance.statut}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Aucune séance disponible pour ce film.</p>
            )}
          </div>
        </div>

        {selectedSeance && (
          <div className="reservation-panel">
            <h3>Réservation</h3>
            <div className="reservation-form">
              <div className="form-group">
                <label className="form-label">Nombre de places</label>
                <input
                  type="number"
                  min="1"
                  value={nombrePlaces}
                  onChange={(e) =>
                    setNombrePlaces(Number.parseInt(e.target.value) || 1)
                  }
                  className="form-input"
                  disabled={reservationLoading}
                />
              </div>
              <button
                onClick={handleReservation}
                className="btn btn-primary"
                style={{ width: "100%", padding: "16px" }}
                disabled={reservationLoading}
              >
                Confirmer la réservation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FilmDetails