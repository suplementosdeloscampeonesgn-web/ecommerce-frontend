import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header 
      className="sticky-top z-3 bg-dark shadow-sm transition" 
      data-bs-theme="dark"
    >
      <nav
        className="container d-flex align-items-center justify-content-between flex-wrap"
        // Dejamos que la altura crezca si se envuelve en pantallas medianas
        style={{ minHeight: "80px", maxWidth: "1100px", padding: "0.5rem 0" }} 
      >
        {/* === LOGO (ITEM 1) === */}
        {/* 'me-auto' empuja todo lo demás a la derecha */}
        <Link
          to="/"
          className="fw-bold fs-3 text-light text-decoration-none me-auto" 
        >
          Suplementos de los Campeones <span className="text-info">GN</span>
        </Link>

        {/* === GRUPO DERECHA (ITEM 2) === */}
        {/* Este div agrupa los enlaces de navegación Y los botones de usuario */}
        <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end">
          
          {/* Navegación principal */}
          <ul className="d-none d-md-flex list-unstyled gap-4 fs-5 fw-semibold mb-0">
            <li>
              <Link to="/" className="nav-link px-0 link-light hover-info">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/shop" className="nav-link px-0 link-light hover-info">
                Tienda
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                className="nav-link px-0 d-flex align-items-center gap-1 link-light hover-info"
              >
                <svg
                  style={{ width: "24px", height: "24px" }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                </svg>
                Carrito
              </Link>
            </li>
          </ul>

          {/* Área de usuario/derecha */}
          <div className="d-flex align-items-center gap-2">
            {!user ? (
              <>
                <Link
                  to="/login"
                  // Añadida clase 'btn'
                  className="btn btn-info text-white rounded shadow fw-bold px-4 py-2" 
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  // Añadida clase 'btn'
                  className="btn btn-success text-white rounded shadow fw-bold px-3 py-2" 
                >
                  Crear cuenta
                </Link>
              </>
            ) : (
              <>
                <span className="text-secondary d-none d-md-block">
                  Hola, {user.email || user.name}
                </span>

                {/* Botón de Perfil */}
                <Link
                  to="/profile"
                  className="bg-secondary border rounded-circle p-2 d-flex align-items-center justify-content-center text-light"
                  style={{ width: 40, height: 40 }}
                  title="Perfil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                    <path d="M11 10a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z"/>
                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-7a7 7 0 0 0 0 14A7 7 0 0 0 8 1Z"/>
                  </svg>
                </Link>

                {user.is_admin && (
                  <Link
                    to="/admin"
                    className="btn btn-info text-dark rounded shadow fw-bold px-3 py-2" // 'btn'
                  >
                    Admin
                  </Link>
                )}
                
                <button
                  onClick={logout}
                  className="btn btn-danger text-white rounded shadow fw-bold border-0 px-3 py-2" // 'btn'
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}