import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { FaPercent, FaBolt, FaDumbbell, FaFlask } from "react-icons/fa";

// FECHAS de la promo
const PROMO_START = new Date("2025-11-12T00:00:00");
const PROMO_END   = new Date("2025-11-19T23:59:59");

// --- Cuenta regresiva para el 12 de nov ---
function useCountdown(targetDate) {
  const [diff, setDiff] = useState(targetDate - new Date());
  useEffect(() => {
    if (diff <= 0) return;
    const timer = setInterval(() => setDiff(targetDate - new Date()), 1000);
    return () => clearInterval(timer);
  }, [diff, targetDate]);
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return { days, hours, mins, secs };
}

export default function HeroSlider() {
  const promoActive = new Date() >= PROMO_START && new Date() <= PROMO_END;
  const countdown = useCountdown(PROMO_START);

  // Slides institucionales
  const heroSlides = [
    {
      headline: "Más de 250 productos exclusivos",
      description: "Catálogo premium: whey, creatina, BCAA, glutamina, caseína y óxido nítrico.",
      icon: <FaDumbbell style={{ fontSize: 54, color: "#01a2f5" }} />,
      accent: "#01a2f5",
      image: "/assets/hero-whey.jpg",
      bg: "linear-gradient(120deg,#181A1C 90%,#232527 100%)"
    },
    {
      headline: "Marcas de élite y desempeño real",
      description: "Optimum Nutrition, Dymatize, BSN, Cellucor, Muscletech y más.",
      icon: <FaFlask style={{ fontSize: 54, color: "#01a2f5" }} />,
      accent: "#01a2f5",
      image: "/assets/hero-marcas.jpg",
      bg: "linear-gradient(120deg,#181A1C 90%,#232527 100%)"
    },
    {
      headline: "Potencia, Recuperación y Energía",
      description: "Pre entrenos, BCAA, creatina y fórmulas avanzadas para atletas exigentes.",
      icon: <FaBolt style={{ fontSize: 54, color: "#01a2f5" }} />,
      accent: "#01a2f5",
      image: "/assets/hero-potencia.jpg",
      bg: "linear-gradient(120deg,#181A1C 90%,#232527 100%)"
    }
  ];

  return (
    <div className="container p-0" style={{ maxWidth: "1100px", marginTop: "40px" }}>
      {/* Cuenta regresiva antes del inicio de promo */}
      {!promoActive && countdown && (
        <div className="mb-4 rounded-4 shadow-lg bg-danger bg-gradient text-white p-4 text-center fw-bold" style={{ fontSize: "1.25rem" }}>
          <FaPercent style={{ fontSize: 36, marginRight: 16 }} />
          ¡Ofertas de hasta el 20% solo del 12 al 19 de noviembre!
          <br />
          <span className="d-block mt-2 fs-5 fw-semibold">
            Comienza en: {countdown.days}d {countdown.hours}h {countdown.mins}m {countdown.secs}s
          </span>
        </div>
      )}
      {/* Banner de porcentaje activo SOLO durante el periodo PROMO */}
      {promoActive && (
        <div className="mb-4 rounded-4 shadow-lg bg-danger bg-gradient text-white p-4 text-center fw-bold animate-fade-in" style={{ fontSize: "1.29rem" }}>
          <FaPercent style={{ fontSize: 36, marginRight: 16 }} />
          ¡Ofertas FLASH hasta el 20% solo del 12 al 19 de noviembre!
        </div>
      )}
      <div className="rounded-4 shadow-lg position-relative overflow-hidden"
        style={{
          minHeight: "285px",
          boxShadow: "0 16px 54px rgba(26,21,60,0.17)",
          display: "flex",
          alignItems: "center"
        }}>
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          effect="fade"
          loop
          autoplay={{ delay: 4300, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="w-100"
          style={{ minHeight: "285px" }}
        >
          {heroSlides.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <div
                className="d-flex flex-column flex-md-row align-items-center justify-content-between w-100 h-100 px-4 py-5 animate-fade-in"
                style={{
                  minHeight: "270px",
                  backdropFilter: "blur(8px)",
                  background: `${slide.bg}, url(${slide.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "right center",
                  borderRadius: "24px",
                }}
              >
                <div className="d-flex flex-column h-100 justify-content-center" style={{ flex: 1 }}>
                  <div className="mb-2">{slide.icon}</div>
                  <h1 className="fw-bolder mb-3"
                    style={{
                      fontSize: "2.3rem",
                      color: slide.accent,
                      textShadow: "0px 2px 8px rgba(0,0,0,0.22)"
                    }}>
                    {slide.headline}
                  </h1>
                  <p className="fs-5 text-white mb-4" style={{ lineHeight: 1.35 }}>{slide.description}</p>
                  <a
                    href="/shop"
                    className="btn px-5 py-2 fw-bold bg-info text-white"
                    style={{
                      borderRadius: 25,
                      fontSize: "1.12rem",
                      boxShadow: "0 2px 16px rgba(0,0,0,0.12)"
                    }}
                  >
                    Ver catálogo
                  </a>
                </div>
                <div className="d-none d-md-block w-40 text-end" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
