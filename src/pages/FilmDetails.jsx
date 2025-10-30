"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getFilmById, createReservation } from "../services/api" // ⚠️ on retire getSeancesByFilm
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/general.css"
import "../styles/home.css"

function FilmDetails() {
  const { id } = useParams()
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [film, setFilm] = useState(null)
  const [seances, setSeances] = useState([])
  const [selectedSeance, setSelectedSeance] = useState(null)
  const [nombrePlaces, setNumberOfTickets] = useState(1)
  const [loading, setLoading] = useState(true)
  const [reservationLoading, setReservationLoading] = useState(false)

  useEffect(() => {
    const loadFilmData = async () => {
      try {
        const data = await getFilmById(id) // ce endpoint contient film + seances
        if (data?.data?.film) {
          setFilm(data.data.film)
          setSeances(data.data.seances || []) // ✅ on récupère ici
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFilmData()
  }, [id])

  const handleReservation = async () => {

    if (!user) {
    alert("⚠️ Vous devez être connecté pour réserver un film !");
    navigate("/login");
    return;
  }

    if (!selectedSeance) {
      alert("Veuillez sélectionner une séance")
      return
    }

    // ✅ Empêcher les clics multiples
    if (reservationLoading) {
      return;
    }

    setReservationLoading(true);

  try {
    console.log("Réservation envoyée :", {
      seance_id: selectedSeance._id,
      nombrePlaces,
    });

    const response = await createReservation({
      seance_id: selectedSeance._id,
      nombrePlaces,
    });

      // ✅ Gestion CORRECTE des erreurs
      if (response.success === false) {
        alert("❌ " + response.message);
        return;
      }

    if (response.error) {
      alert("❌ " + response.error);
      return;
    }

          // ✅ Vérifier si c'est une vraie réussite
      if (response.success === true || response.data) {
        alert("✅ Réservation effectuée avec succès !");
        //recharger les données ou reset le formulaire
        setNumberOfTickets(1);
        setSelectedSeance(null);
      } else {
        alert("❌ Réponse inattendue du serveur");
      }
  }catch (error) {
      console.error("Erreur lors de la réservation:", error);
      
      // ✅ Gestion SPECIFIQUE des erreurs HTTP
      if (error.response) {
        // Erreur avec réponse du serveur
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        
        if (status === 400) {
          alert(`❌ ${message || "Séance complète ou réservation déjà existante !"}`);
        } else if (status === 404) {
          alert("❌ Séance non trouvée");
        } else if (status === 409) {
          alert("❌ Vous avez déjà une réservation pour cette séance");
        } else {
          alert(`❌ Erreur serveur (${status}): ${message || "Veuillez réessayer"}`);
        }
      } else if (error.request) {
        // Pas de réponse du serveur
        alert("❌ Impossible de contacter le serveur. Vérifiez votre connexion.");
      } else {
        // Erreur inconnue
        alert("❌ Erreur inattendue: " + error.message);
      }
    } finally {
      setReservationLoading(false);
    }
  }

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


  return (
    <div className="film-details-container">
      <div className="container">
        <div className="film-details-grid">
          <div>
            <img src={film.affiche || "/placeholder.svg"} alt={film.titre} className="film-poster" />
          </div>
          <div className="film-info-section">
            <h1>{film.titre}</h1>
            <div className="film-badges">
              <span className="badge badge-warning">{film.genre}</span>
              <span style={{ color: "var(--color-text-secondary)" }}>{film.duree} min</span>
            </div>
            <p className="film-description">{film.description}</p>
          </div>
        </div>

        <div className="card seances-card">
          <h2>Séances disponibles</h2>
          <div style={{ display: "grid", gap: "16px" }}>
            {Array.isArray(seances) && seances.length > 0 ? (
              seances.map((seance) => (
                <div
                  key={seance._id}
                  onClick={() => setSelectedSeance(seance)}
                  className={`seance-item ${selectedSeance?._id === seance._id ? "selected" : ""}`}
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
                  onChange={(e) => setNumberOfTickets(Number.parseInt(e.target.value))}
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
