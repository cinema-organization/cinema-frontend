import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../slices/userSlice";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (!loading && !error && user) {
      const { role } = user;
      if (role === "admin") navigate("/admin/dashboard");
      else navigate("/films");
    }
  }, [loading, error, user, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="cinemax-title">
            Ciné<span>Go</span>
          </h1>
          <h2 className="auth-title">Connexion</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group password-field">
            <label className="form-label">Mot de passe</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <span 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🐵" : "🙈"}
              </span>
            </div>
          </div>

          {error && <p className="error">{error}</p>}
          {loading && <p className="loading">🔄 Connexion en cours...</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Pas encore inscrit ?{" "}
              <Link to="/register" className="auth-footer-link">
                Créer un compte
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}