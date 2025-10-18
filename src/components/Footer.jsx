import React from "react";

export default function Footer() {
  return (
    <footer
      className="bg-gradient-custom text-white mt-5 pt-4 pb-3 shadow rounded-top"
      style={{
        borderTopLeftRadius: "2rem",
        borderTopRightRadius: "2rem",
      }}
    >
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 px-3">
        {/* Nombre de la marca */}
        <div className="fs-4 fw-bold">
          Suplementos de los Campeones <span className="text-warning ms-1">GN</span>
        </div>

        {/* Links */}
        <ul className="d-flex gap-4 fw-semibold fs-5 list-unstyled mb-0">
          <li>
            <a href="#aviso" className="link-light text-decoration-none" style={{ transition: "color 0.2s" }}>
              Aviso de privacidad
            </a>
          </li>
          <li>
            <a href="#contact" className="link-light text-decoration-none" style={{ transition: "color 0.2s" }}>
              Contacto
            </a>
          </li>
        </ul>

        {/* Social Icons */}
        <div className="d-flex gap-3">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-light transition">
            <svg style={{ width: "28px", height: "28px" }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.325 24h11.495v-9.294H9.691V11.01h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.716-1.797 1.764v2.313h3.587l-.467 3.695h-3.12V24h6.116c.729 0 1.324-.594 1.324-1.326V1.326C24 .592 23.405 0 22.675 0"></path>
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-light transition">
            <svg style={{ width: "28px", height: "28px" }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.322 3.608 1.297.974.974 1.234 2.241 1.296 3.607.058 1.267.07 1.647.07 4.851s-.012 3.584-.07 4.85c-.062 1.366-.322 2.633-1.296 3.608-.974.974-2.241 1.234-3.607 1.296-1.267.058-1.647.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.322-3.608-1.296-.974-.974-1.234-2.241-1.296-3.607C2.175 15.65 2.163 15.27 2.163 12s.012-3.584.07-4.85C2.295 5.784 2.555 4.518 3.53 3.543 4.504 2.568 5.771 2.308 7.137 2.246c1.267-.058 1.647-.07 4.85-.07zm0-1.663C8.755.5 8.335.511 7.017.566c-1.565.068-2.976.508-4.034 1.566C2.012 3.01 1.572 4.422 1.504 5.988.655 8.018.655 9.955.655 12c0 2.045 0 3.982.85 6.011.068 1.565.508 2.977 1.566 4.035 1.058 1.057 2.469 1.497 4.034 1.566 1.317.054 1.737.065 4.133.065s2.816-.011 4.133-.065c1.565-.069 2.976-.509 4.034-1.566 1.058-1.058 1.498-2.47 1.566-4.035.854-2.025.854-3.966.854-6.011 0-2.045 0-3.982-.854-6.011-.068-1.565-.508-2.977-1.566-4.035C19.975.508 18.563.069 17.003.001 15.686-.053 15.266-.065 12-.065z"></path>
            </svg>
          </a>
        </div>
      </div>

      <div className="mt-4 border-top pt-3 text-center small opacity-75">
        &copy; {new Date().getFullYear()} Suplementos de los Campeones GN. Todos los derechos reservados.
      </div>
    </footer>
  );
}
