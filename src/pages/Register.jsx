import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../slices/userSlice";
import "../styles/auth.css";

export default function Register() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState("");
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isLoggedIn } = useSelector((state) => state.auth);

  const checkStrength = (pwd) => {
    if (pwd.length < 6) return "Faible";
    if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[@$!%*?&]/.test(pwd)) return "Forte";
    return "Moyenne";
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setLocalError(""); // Reset local error quand l'utilisateur tape
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (password !== confirmPassword) {
      setLocalError("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitted(true);
    dispatch(registerUser({ nom, email, password }));
  };

  useEffect(() => {
    if (submitted && !loading && !error && isLoggedIn) {
      navigate("/films");
    } else if (submitted && !loading && error) {
      setSubmitted(false);
    }
  }, [loading, error, isLoggedIn, submitted, navigate]);

  const strength = checkStrength(password);
  const strengthClass = strength === "Forte" ? "strong" : strength === "Moyenne" ? "medium" : "weak";

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="cinemax-title">
            Cinéma<span>X</span>
          </h1>
          <h2 className="auth-title">Inscription</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Nom complet</label>
            <input
              type="text"
              className="form-input"
              placeholder="Votre nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              disabled={loading}
            />
          </div>

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
                onChange={handlePasswordChange}
                required
                minLength="6"
                disabled={loading}
              />
              <span 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </span>
            </div>
            {password && (
              <p className={`strength ${strengthClass}`}>
                Force du mot de passe : {strength}
              </p>
            )}
          </div>

          <div className="form-group password-field">
            <label className="form-label">Confirmer le mot de passe</label>
            <div className="password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              <span 
                className="toggle-password" 
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "🐵" : "🙈"}
              </span>
            </div>
          </div>

          {(error || localError) && <p className="error">{error || localError}</p>}
          {loading && <p className="loading">🔄 Inscription en cours...</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </button>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Déjà un compte ?{" "}
              <Link to="/login" className="auth-footer-link">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}