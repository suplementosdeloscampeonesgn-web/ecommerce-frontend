// src/pages/Contacto.jsx
import React from "react";

export default function Contacto() {
  return (
    <div className="container py-5 animate-fade-in">
      <h1 className="fw-bold mb-3 text-primary">Contacto</h1>
      <p className="fs-5 mb-4 text-dark">
        ¿Necesitas ayuda, cotización o información sobre productos? Envíanos un mensaje y te contestamos en menos de 24 horas.
      </p>
      <form className="bg-light p-4 rounded shadow mb-5" style={{ maxWidth: "500px" }}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label fw-bold">Nombre completo</label>
          <input type="text" className="form-control" id="nombre" required autoComplete="name" />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-bold">Correo electrónico</label>
          <input type="email" className="form-control" id="email" required autoComplete="email" />
        </div>
        <div className="mb-3">
          <label htmlFor="mensaje" className="form-label fw-bold">Mensaje</label>
          <textarea className="form-control" id="mensaje" rows="4" required></textarea>
        </div>
        <button type="submit" className="btn btn-primary fw-bold w-100">Enviar mensaje</button>
      </form>
      <div className="text-black-50 mt-4">
        También puedes enviarnos correo directo a <a href="mailto:contacto@suplementosgn.mx" className="text-primary">contacto@suplementosgn.mx</a>
      </div>
    </div>
  );
}
