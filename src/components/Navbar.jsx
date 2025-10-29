import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../slices/userSlice";
import "../styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.auth?.user || null); // fallback si undefined
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/films" className="navbar-logo">
          <span className="navbar-logo-text">🎬 CinéGo</span>
        </Link>

        {/* Toggle pour mobile */}
        <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>

        {/* Menu */}
        <ul className={`navbar-menu ${isOpen ? "open" : ""}`}>
          <li>
            <Link
              to="/films"
              className={`navbar-link ${isActive("/") ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              Accueil
            </Link>
          </li>

          {user ? (
            <>
              {isAdmin ? (
                <>
                  <li>
                    <Link
                      to="/admin/dashboard"
                      className={`navbar-link ${isActive("/admin/dashboard") ? "active" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/films"
                      className={`navbar-link ${isActive("/admin/films") ? "active" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      Gérer Films
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/salles"
                      className={`navbar-link ${isActive("/admin/salles") ? "active" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      Gérer Salles
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/seances"
                      className={`navbar-link ${isActive("/admin/seances") ? "active" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      Gérer Séances
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/mes-reservations"
                    className={`navbar-link ${isActive("/mes-reservations") ? "active" : ""}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Mes Réservations
                  </Link>
                </li>
              )}
            </>
          ) : (
            // Si pas connecté → Connexion / Inscription
            <>
              <li>
                <Link
                  to="/login"
                  className={`navbar-link ${isActive("/login") ? "active" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={`navbar-link ${isActive("/register") ? "active" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  Inscription
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Actions utilisateur */}
        {user && (
          <div className="navbar-actions">
            <div className="navbar-user">
              <div className="navbar-avatar">{user.nom.charAt(0)}</div>
              <span className="navbar-username">{user.nom}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
