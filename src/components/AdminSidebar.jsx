import React from "react";
import { NavLink } from "react-router-dom";
import { Film, LayoutDashboard, Calendar, Building, Ticket } from "lucide-react";
import "../styles/dashboard.css";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <h2 className="admin-sidebar-title">Admin Panel</h2>

      <nav className="admin-nav">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <LayoutDashboard size={20} />
          Tableau de bord
        </NavLink>

        <NavLink
          to="/admin/films"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <Film size={20} />
          Gestion des Films
        </NavLink>

        <NavLink
          to="/admin/salles"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <Building size={20} />
          Gestion des Salles
        </NavLink>

        <NavLink
          to="/admin/seances"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <Calendar size={20} />
          Gestion des Séances
        </NavLink>

        <NavLink
          to="/admin/reservations"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <Ticket size={20} />
          Réservations
        </NavLink>
      </nav>
    </aside>
  );
}
