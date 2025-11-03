// src/pages/AvisoPrivacidad.jsx
import React from "react";

export default function AvisoPrivacidad() {
  return (
    <div className="container py-5 animate-fade-in">
      <h1 className="fw-bold mb-3 text-primary">Aviso de Privacidad</h1>
      <p className="fs-5 text-dark mb-4">
        Suplementos de los Campeones GN respeta y protege la privacidad de todos los usuarios. 
        Los datos proporcionados serán utilizados únicamente para procesar pedidos y brindar información relevante de nuestros productos y servicios.
      </p>
      <ul className="mb-4">
        <li>Solo solicitamos los datos necesarios para realizar compras y envíos.</li>
        <li>No compartimos datos con terceros salvo obligación legal o logística de entrega.</li>
        <li>Puedes solicitar la eliminación o corrección de tus datos escribiendo a <a href="mailto:contacto@suplementosgn.mx" className="text-primary">contacto@suplementosgn.mx</a>.</li>
        <li>Para conocer más sobre protección y uso de datos, contáctanos directamente.</li>
      </ul>
      <div className="mt-5 text-black-50 small">
        Este aviso puede actualizarse sin previo aviso. Última actualización: Noviembre 2025.
      </div>
    </div>
  );
}
