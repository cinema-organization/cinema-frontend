// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "../styles/footer.css";

export default function Footer() {
  const { user } = useSelector((state) => state.auth); // récupère l'utilisateur connecté
  const isAdmin = user?.role === "admin";

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Section CinémaX */}
          <div className="footer-section">
            <h3 className="footer-title">CinéGo</h3>
            <p className="footer-text">
              Votre destination pour réserver les meilleurs films en ligne.
            </p>
          </div>

          {/* Section Navigation */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Navigation</h4>
            <ul className="footer-list">
              <li>
                <Link to="/" className="footer-link">Accueil</Link>
              </li>

              {/* Liens selon rôle */}
              {!user && (
                <>
                  <li>
                    <Link to="/login" className="footer-link">Connexion</Link>
                  </li>
                  <li>
                    <Link to="/register" className="footer-link">Inscription</Link>
                  </li>
                </>
              )}

              {user && !isAdmin && (
                <li>
                  <Link to="/mes-reservations" className="footer-link">Mes Réservations</Link>
                </li>
              )}

              {isAdmin && (
                <>
                  <li>
                    <Link to="/admin/dashboard" className="footer-link">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/admin/films" className="footer-link">Gérer Films</Link>
                  </li>
                  <li>
                    <Link to="/admin/salles" className="footer-link">Gérer Salles</Link>
                  </li>
                  <li>
                    <Link to="/admin/seances" className="footer-link">Gérer Séances</Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Section Contact */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Contact</h4>
            <ul className="footer-list">
              <li className="footer-text">Email: contact@CinéGo.com</li>
              <li className="footer-text">Tél: +216 29 686 411</li>
              <li className="footer-text">Adresse: Djara, Gabes</li>
            </ul>
          </div>

          {/* Section Réseaux sociaux */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Suivez-nous</h4>
            <div className="footer-social-links">
              <a href="#" className="footer-social-link">Facebook</a>
              <a href="#" className="footer-social-link">Twitter</a>
              <a href="#" className="footer-social-link">Instagram</a>
            </div>
          </div>
        </div>

        {/* Bas du footer */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} CinéGo. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
