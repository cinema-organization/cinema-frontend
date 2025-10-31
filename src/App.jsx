import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import AdminDashboard from "./pages/AdminDashboard"
import MyReservations from "./pages/MyReservations"
import ManageFilms from "./pages/ManageFilms"
import FilmDetails from "./pages/FilmDetails"
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { updateSeancesStatus } from "./services/api";

function App() {
  useEffect(() => {
    // ✅ Mise à jour des statuts au chargement de l'app
    updateSeancesStatus().catch(error => {
      console.log("Mise à jour des séances:", error.message);
    });

    // ✅ Mise à jour toutes les minutes
    const interval = setInterval(() => {
      updateSeancesStatus().catch(error => {
        console.log("Mise à jour périodique des séances:", error.message);
      });
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);
  return (
    <Router>
      <div className="app">
         <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/films" replace />} /> 
            <Route path="/films" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/film/:id" element={<FilmDetails />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/films" element={<ManageFilms />} />
            <Route path="/mes-reservations" element={<MyReservations />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
