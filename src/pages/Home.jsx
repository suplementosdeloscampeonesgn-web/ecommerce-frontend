import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import HeroSlider from "../components/HeroSlider";
import { LuDumbbell, LuFlame, LuHeartPulse, LuTag, LuShieldCheck, LuUsers, LuClock } from "react-icons/lu";

const infoCards = [
  {
    id: "proteinas",
    title: "¡Proteínas premium!",
    description: "El mejor surtido en whey, caseína y proteínas veganas de alto valor biológico.",
    link: "/categoria/proteinas",
    button: "Ver más",
    Icon: LuDumbbell
  },
  {
    id: "preentrenos",
    title: "Energía al máximo",
    description: "Pre-entrenos y estimulantes para enfoque, resistencia y rendimiento garantizado.",
    link: "/categoria/preentrenos",
    button: "Explorar",
    Icon: LuFlame
  },
  {
    id: "vitaminas",
    title: "Salud total",
    description: "Vitaminas, minerales y antioxidantes esenciales para el bienestar diario.",
    link: "/categoria/vitaminas",
    button: "Nuestra selección",
    Icon: LuHeartPulse
  }
];

// Beneficios avanzados (puedes agregar más según tu propuesta de valor)
const ExtraBenefits = () => (
  <div className="container mb-5">
    <div className="row g-4 justify-content-center">
      <div className="col-md-3">
        <div className="bg-light rounded-4 shadow-sm p-4 text-center h-100 d-flex flex-column align-items-center">
          <LuTag size={40} className="mb-2 text-primary" />
          <h4 className="fw-bold mb-2 text-primary">Precios de Distribuidor</h4>
          <div className="text-dark small">Stock directo y promos auténticas.</div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="bg-light rounded-4 shadow-sm p-4 text-center h-100 d-flex flex-column align-items-center">
          <LuShieldCheck size={40} className="mb-2 text-success" />
          <h4 className="fw-bold mb-2 text-success">Garantía y Calidad</h4>
          <div className="text-dark small">Certificados, lotes frescos y originales.</div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="bg-light rounded-4 shadow-sm p-4 text-center h-100 d-flex flex-column align-items-center">
          <LuClock size={40} className="mb-2 text-warning" />
          <h4 className="fw-bold mb-2 text-warning">Envíos Express</h4>
          <div className="text-dark small">Entrega local e inmediata en SLP.</div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="bg-light rounded-4 shadow-sm p-4 text-center h-100 d-flex flex-column align-items-center">
          <LuUsers size={40} className="mb-2 text-info" />
          <h4 className="fw-bold mb-2 text-info">Atención Preferente</h4>
          <div className="text-dark small">Asesoría personalizada por WhatsApp.</div>
        </div>
      </div>
    </div>
  </div>
);

function QuickInfoCard({ title, description, link, button, Icon }) {
  return (
    <div className="bg-dark rounded-4 shadow-lg d-flex flex-column align-items-center justify-content-between p-4 min-card-height w-100 hover-shadow-lg transition">
      <Icon style={{ width: 48, height: 48 }} className="text-warning mb-3" />
      <div className="fw-bold fs-4 text-warning mb-2 text-center">{title}</div>
      <div className="text-white-50 small mb-4 text-center">{description}</div>
      <Link to={link} className="btn btn-warning text-dark fw-bold rounded-pill px-4 py-2 shadow-sm hover-btn-scale transition">
        {button}
      </Link>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useCart();

  useEffect(() => {
    setLoading(true);
    const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;
    axios.get(API_URL)
      .then(res => setProducts(res.data.products || res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-bg-gradient min-vh-100 pt-5">
      {/* HeroSlider ultra pro */}
      <HeroSlider />

      {/* Mini cards de categorías */}
      <div className="container mb-5">
        <div className="row g-4">
          {infoCards.map(card => (
            <div className="col-12 col-md-4" key={card.id}>
              <QuickInfoCard {...card} />
            </div>
          ))}
        </div>
      </div>

      {/* Beneficios extra avanzados */}
      <ExtraBenefits />

      {/* Productos destacados */}
      <div className="container px-3">
        <h2 className="fs-2 fw-bold mb-4 text-primary">Productos destacados</h2>
        {loading ? (
          <div className="text-primary fw-bold py-5 text-center">Cargando productos...</div>
        ) : (
          <div className="row g-3 animate-fade-in">
            {products.slice(0, 8).map(product =>
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={product.id}>
                <ProductCard
                  product={product}
                  onAddToCart={() => dispatch({ type: "ADD_ITEM", payload: { product, quantity: 1 } })}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección ENCUÉNTRANOS con Google Maps, horarios y WhatsApp */}
      <section className="container my-5">
        <div className="bg-white rounded-3 shadow-lg p-5 d-flex flex-column flex-md-row align-items-center gap-4">
          <div className="flex-shrink-0" style={{ minWidth: "250px" }}>
            <h3 className="fw-bold mb-3 text-primary">Encuéntranos</h3>
            <div className="mb-3 text-dark">
              Av. Vicente Rivera 131 A, Col. Nuevo Paseo<br />
              78437, San Luis Potosí, SLP<br />
              <span className="fw-bold text-success">Tel:</span> <a href="tel:4441234567" className="text-success text-decoration-none">444 123 4567</a>
              <br />
              <span className="fw-bold text-primary">
                Horario: Lunes-Viernes 10:00 a 7:00pm y Sabados de 10:00 a 5:00pm
              </span>
            </div>
            <a
              href="https://www.google.com/maps/place/Av.+Vicente+Rivera+131+A,+Nuevo+Paseo,+78437+San+Luis+Potos%C3%AD,+SLP/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-info fw-bold mb-3"
            >
              Abrir en Google Maps
            </a>
            <a
              href="https://wa.me/524441234567?text=Hola%20Quiero%20cotizar%20suplementos"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success fw-bold"
            >
              Chatea por WhatsApp
            </a>
          </div>
          <div className="flex-grow-1 mt-4 mt-md-0" style={{ minWidth: "320px" }}>
            <div style={{ borderRadius: "18px", overflow: "hidden", boxShadow: "0 2px 32px #009dff22" }}>
              <iframe
                src="https://www.google.com/maps?q=Av.+Vicente+Rivera+131+A,+Nuevo+Paseo,+78437+San+Luis+Potos%C3%AD,+SLP&output=embed"
                width="100%"
                height="240"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación GN"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
