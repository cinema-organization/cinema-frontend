"use client"

import { useEffect, useState } from "react"
import { getFilms } from "../services/api"
import "../styles/home.css"
import { Link } from "react-router-dom";


function Home() {
  const [films, setFilms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")

  const genres = ["Tous", "Action", "Comédie", "Drame", "Science-Fiction", "Horreur",'Thriller',"Animation",'Romance']

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const response = await getFilms()
        if (response.success) {
          setFilms(response.data)
        } else {
          setError("Impossible de charger les films")
        }
      } catch{
        setError("Erreur de connexion au serveur")
      } finally {
        setLoading(false)
      }
    }
    fetchFilms()
  }, [])

  const filteredMovies = films.filter((film) => {
    const matchesSearch = film.titre.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === "all" || film.genre === selectedGenre
    return matchesSearch && matchesGenre
  })

  if (loading) return <p className="loading">Chargement des films...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Découvrez les meilleurs films</h1>
          <p className="hero-subtitle">Réservez vos places pour les dernières sorties cinéma</p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="search-section">
        <div className="container">
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher un film..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="genre-filter">
            {genres.map((genre) => (
              <button
                key={genre}
                className={`genre-btn ${
                  selectedGenre === genre.toLowerCase() ||
                  (genre === "Tous" && selectedGenre === "all")
                    ? "active"
                    : ""
                }`}
                onClick={() => setSelectedGenre(genre === "Tous" ? "all" : genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="movies-section">
        <div className="container">
          <div className="movies-grid">
            {filteredMovies.map((film) => (
              <div key={film._id} className="movie-card-link">
                <div className="movie-image-wrapper">
                  <img
                    src={film.affiche || "/placeholder.svg"}
                    alt={film.titre}
                    className="movie-image"
                  />
                  <div className="movie-overlay">
                      <Link to={`/film/${film._id}`}>
                        <button className="btn btn-primary">Réserver</button>
                        </Link>
                        </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{film.titre}</h3>
                  <div className="movie-meta">
                    <span className="badge badge-warning">{film.genre}</span>
                    <span className="movie-duration">{film.duree} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMovies.length === 0 && (
            <div className="no-results">
              <p>Aucun film trouvé</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
