import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getStats, getAllReservations } from "../services/api";
import "../styles/dashboard.css";

function AdminDashboard() {
const [stats, setStats] = useState({
  totalFilms: 0,
  totalSalles: 0,
  totalSeancesAvenir: 0,
  totalReservations: 0,
  totalUsers: 0,
  totalRevenue: 0,
});


  const [reservations, setReservations] = useState([]); // ✅ Nouveau
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Charger stats + réservations
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, reservationsRes] = await Promise.all([
        getStats(),
        getAllReservations(),
      ]);

if (statsRes.success) {
  const data = statsRes.data;
  setStats({
    totalFilms: data.totalFilms || 0,
    totalSalles: data.totalSalles || 0,
    totalSeancesAvenir: data.totalSeancesAvenir || 0,
    totalReservations: data.totalReservations || 0,
    totalUsers: data.totalUsers || 0,
    totalRevenue: data.totalRevenue || 0,
  });
}


      if (reservationsRes.success) {
        setReservations(reservationsRes.data); // ✅ On stocke la vraie liste
      } else {
        console.error("Erreur chargement réservations:", reservationsRes.message);
      }
    } catch (err) {
      console.error("Erreur lors du chargement du dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Chargement...</p>;
  }

  return (
    <div className="admin-container">
      {/* 🌑 Sidebar */}
      <div className="admin-sidebar">
        <h2 className="admin-sidebar-title">Admin Panel</h2>
        <nav className="admin-nav">
          <Link
            to="/admin/dashboard"
            className={`admin-nav-link ${
              location.pathname === "/admin/dashboard" ? "active" : ""
            }`}
          >
            <span>📊</span> Dashboard
          </Link>
          <Link
            to="/admin/films"
            className={`admin-nav-link ${
              location.pathname === "/admin/films" ? "active" : ""
            }`}
          >
            <span>🎬</span> Gérer Films
          </Link>
          <Link
            to="/admin/salles"
            className={`admin-nav-link ${
              location.pathname === "/admin/salles" ? "active" : ""
            }`}
          >
            <span>🏛️</span> Gérer Salles
          </Link>
          <Link
            to="/admin/seances"
            className={`admin-nav-link ${
              location.pathname === "/admin/seances" ? "active" : ""
            }`}
          >
            <span>🎫</span> Gérer Séances
          </Link>
          <Link
            to="/admin/reservations"
            className={`admin-nav-link ${
              location.pathname === "/admin/reservations" ? "active" : ""
            }`}
          >
            <span>📋</span> Toutes Réservations
          </Link>
        </nav>
      </div>

      {/* 📊 Contenu principal */}
      <div className="admin-content">
        <h1 className="admin-title">Dashboard</h1>

        {/* Statistiques */}
<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-icon" style={{ background: "rgba(220,38,38,0.2)" }}>
      🎬
    </div>
    <div className="stat-content">
      <div className="stat-label">Total Films</div>
      <div className="stat-value">{stats.totalFilms}</div>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon" style={{ background: "rgba(234,179,8,0.2)" }}>
      🏛️
    </div>
    <div className="stat-content">
      <div className="stat-label">Salles</div>
      <div className="stat-value">{stats.totalSalles}</div>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon" style={{ background: "rgba(147,51,234,0.2)" }}>
      🎞️
    </div>
    <div className="stat-content">
      <div className="stat-label">Séances à venir</div>
      <div className="stat-value">{stats.totalSeancesAvenir}</div>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon" style={{ background: "rgba(251,191,36,0.2)" }}>
      🎫
    </div>
    <div className="stat-content">
      <div className="stat-label">Réservations</div>
      <div className="stat-value">{stats.totalReservations}</div>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon" style={{ background: "rgba(59,130,246,0.2)" }}>
      👥
    </div>
    <div className="stat-content">
      <div className="stat-label">Utilisateurs</div>
      <div className="stat-value">{stats.totalUsers}</div>
    </div>
  </div>
</div>

        {/* 🔽 Réservations récentes */}
        <div className="card" style={{ marginTop: "32px" }}>
          <h2 style={{ marginBottom: "24px" }}>Réservations récentes</h2>
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
                {reservations.length > 0 ? (
                  reservations.map((res) => (
                    <tr key={res._id}>
                      <td>{res._id.slice(-5)}</td>
                      <td>{res.seance_id?.film_id?.titre || "Inconnu"}</td>
                      <td>{res.user_id?.nom || "Inconnu"}</td>
                      <td>
                        {new Date(res.seance_id?.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td>{res.seance_id?.heure}</td>
                      <td>{res.nombrePlaces}</td>
                      <td>
                        <span
                          className={`badge ${
                            res.statut === "confirmée"
                              ? "badge-success"
                              : "badge-danger"
                          }`}
                        >
                          {res.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "#aaa" }}>
                      Aucune réservation trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
