import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky-top z-3 bg-white-blur border-bottom shadow-sm transition">
      <nav className="container d-flex align-items-center justify-content-between" style={{ height: "80px", maxWidth: "1100px" }}>
        {/* SOLO TEXTO, SIN LOGO */}
        <Link to="/" className="fw-bold fs-3 text-primary text-decoration-none">
          Suplementos de los Campeones <span className="text-warning">GN</span>
        </Link>
        <ul className="d-none d-md-flex gap-4 fs-5 fw-semibold text-secondary mb-0">
          <li><Link to="/" className="nav-link px-0 link-secondary hover-primary">Inicio</Link></li>
          <li><Link to="/shop" className="nav-link px-0 link-secondary hover-primary">Tienda</Link></li>
          <li>
            <Link to="/cart" className="nav-link px-0 d-flex align-items-center gap-1 link-danger hover-pink">
              <svg style={{ width: "24px", height: "24px" }} fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>
              Carrito
            </Link>
          </li>
        </ul>
        
        {/* Botones condicionales de usuario, igual que antes */}
        <div className="d-flex align-items-center gap-2">
          {!user ? (
            <>
              <Link to="/login" className="px-4 py-2 text-white rounded bg-primary shadow fw-bold">
                Iniciar sesión
              </Link>
              <Link to="/register" className="px-3 py-2 bg-success text-white rounded shadow fw-bold">
                Crear cuenta
              </Link>
            </>
          ) : (
            <>
              <span className="text-secondary">Hola, {user.email || user.name}</span>
              {user.is_admin && (
                <Link to="/admin" className="px-3 py-2 bg-warning text-dark rounded shadow fw-bold">
                  Admin
                </Link>
              )}
              <button 
                onClick={logout} 
                className="px-3 py-2 bg-danger text-white rounded shadow fw-bold border-0"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
