import { useState, useEffect } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js"

import { getStats, getAllReservations } from "../services/api"
import "../styles/dashboard.css"
import AdminSidebar from "../components/AdminSidebar"

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalFilms: 0,
    totalSalles: 0,
    totalSeancesAvenir: 0,
    totalReservations: 0,
    totalUsers: 0,
  })

  const [reservations, setReservations] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])

  const [loading, setLoading] = useState(true)
  const [filterRange, setFilterRange] = useState("today") // today | week | month

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [reservations, filterRange])

  const loadDashboardData = async () => {
    try {
      const [statsRes, reservationsRes] = await Promise.all([
        getStats(),
        getAllReservations(),
      ])

      if (statsRes.success) {
        const data = statsRes.data
        setStats({
          totalFilms: data.totalFilms || 0,
          totalSalles: data.totalSalles || 0,
          totalSeancesAvenir: data.totalSeancesAvenir || 0,
          totalReservations: data.totalReservations || 0,
          totalUsers: data.totalUsers || 0,
        })
      }

      if (reservationsRes.success) {
        setReservations(reservationsRes.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Filtres des réservations (aujourd’hui / semaine / mois)
  const applyFilter = () => {
    const now = new Date()

    let filtered = reservations

    if (filterRange === "today") {
      filtered = reservations.filter((r) =>
        r.createdAt?.slice(0, 10) === now.toISOString().slice(0, 10)
      )
    }

    if (filterRange === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(now.getDate() - 7)

      filtered = reservations.filter((r) => new Date(r.createdAt) >= weekAgo)
    }

    if (filterRange === "month") {
      const monthAgo = new Date()
      monthAgo.setDate(now.getDate() - 30)

      filtered = reservations.filter((r) => new Date(r.createdAt) >= monthAgo)
    }

    setFilteredReservations(filtered)
  }

  // ✅ Génération des données pour Chart.js
  const chartData = (() => {
    const counts = {}

    filteredReservations.forEach((res) => {
      const day = res.createdAt.slice(0, 10)
      counts[day] = (counts[day] || 0) + 1
    })

    const labels = Object.keys(counts).sort()
    const values = Object.values(counts)

    return {
      labels,
      datasets: [
        {
          label: "Réservations",
          data: values,
          borderColor: "#dc2626",
          backgroundColor: "rgba(220,38,38,0.3)",
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#fbbf24",
          tension: 0.3,
        },
      ],
    }
  })()

  if (loading) return <p style={{ textAlign: "center" }}>Chargement...</p>

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <h1 className="admin-title">Dashboard</h1>

        {/* ✅ STATISTIQUES */}
        <div className="stats-grid">
          {[
            { label: "Total Films", value: stats.totalFilms, icon: "🎬" },
            { label: "Salles", value: stats.totalSalles, icon: "🏛️" },
            { label: "Séances à venir", value: stats.totalSeancesAvenir, icon: "🎞️" },
            { label: "Réservations", value: stats.totalReservations, icon: "🎫" },
            { label: "Utilisateurs", value: stats.totalUsers, icon: "👥" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-content">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ GRAPHIQUE */}
        <div className="card chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Réservations par jour</h2>

            {/* ✅ Filtres */}
            <div style={{ display: "flex", gap: 12 }}>
              {["today", "week", "month"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterRange(f)}
                  className={`filter-button ${
                    filterRange === f ? "filter-button-primary" : "filter-button-secondary"
                  }`}
                >
                  {f === "today" ? "Aujourd’hui" : f === "week" ? "7 jours" : "30 jours"}
                </button>
              ))}
            </div>
          </div>

          <Line data={chartData} height={100} />
        </div>

        {/* ✅ RÉSERVATIONS LISTE */}
        <div className="card table-card" style={{ marginTop: 32 }}>
          <h2>Réservations du jour</h2>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Film</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Places</th>
                  <th>Statut</th>
                </tr>
              </thead>

              <tbody>
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((res) => (
                    <tr key={res._id}>
                      <td>{res._id.slice(-5)}</td>
                      <td>{res.seance_id?.film_id?.titre}</td>
                      <td>{res.user_id?.nom}</td>
                      <td>{new Date(res.seance_id?.date).toLocaleDateString("fr-FR")}</td>
                      <td>{res.seance_id?.heure}</td>
                      <td>{res.nombrePlaces}</td>

                      <td>
                        <span
                          className={
                            res.statut === "confirmée"
                              ? "status-badge status-confirmee"
                              : "status-badge status-annulee"
                          }
                        >
                          {res.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "#888" }}>
                      Aucune réservation trouvée pour cette période.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
