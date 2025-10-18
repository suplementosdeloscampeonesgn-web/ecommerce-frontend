import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { FaDumbbell, FaFlask, FaBolt } from "react-icons/fa";

const heroSlides = [
  {
    headline: "Más de 250 productos exclusivos",
    description:
      "Catálogo premium: whey, creatina, BCAA, glutamina, caseína y óxido nítrico. Surtido constante con líneas profesionales y marcas líderes.",
    icon: <FaDumbbell style={{ fontSize: 54, color: "#FFD600" }} />,
    accent: "#FFD600",
    image: "/assets/hero-whey.jpg"
  },
  {
    headline: "Marcas de élite y desempeño real",
    description:
      "Optimum Nutrition, Dymatize, BSN, Cellucor, Muscletech, entre otras top de rendimiento original.",
    icon: <FaFlask style={{ fontSize: 54, color: "#01a2f5" }} />,
    accent: "#01a2f5",
    image: "/assets/hero-marcas.jpg"
  },
  {
    headline: "Potencia, Recuperación y Energía",
    description:
      "Pre entrenos, BCAA, creatina y fórmulas avanzadas para atletas exigentes. Resultados potentes y comprobados.",
    icon: <FaBolt style={{ fontSize: 54, color: "#fa2647" }} />,
    accent: "#fa2647",
    image: "/assets/hero-potencia.jpg"
  }
];

export default function HeroSlider() {
  return (
    <div className="container my-5 p-0" style={{ maxWidth: "1100px" }}>
      <div
        className="rounded-4 shadow-lg position-relative overflow-hidden"
        style={{
          minHeight: "285px",
          background: "linear-gradient(120deg,#181A1C 90%,#232527 100%)",
          boxShadow: "0 16px 54px rgba(26,21,60,0.17)",
          display: "flex",
          alignItems: "center"
        }}>
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          effect="fade"
          loop
          autoplay={{ delay: 4100, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="w-100"
          style={{ minHeight: "285px" }}
        >
          {heroSlides.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <div
                className="d-flex flex-column flex-md-row align-items-center justify-content-between w-100 h-100 px-4 py-5"
                style={{
                  minHeight: "270px",
                  backdropFilter: "blur(8px)",
                  background: `linear-gradient(115deg,rgba(24,26,28,.96) 65%,rgba(20,20,30,.88) 100%), url(${slide.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "right center",
                  borderRadius: "24px"
                }}
              >
                {/* Info principal */}
                <div className="d-flex flex-column h-100 justify-content-center" style={{ flex: 1 }}>
                  <div className="mb-2">{slide.icon}</div>
                  <h1 className="fw-bolder mb-3" style={{ fontSize: "2.3rem", color: slide.accent, textShadow: "0px 2px 8px rgba(0,0,0,0.22)" }}>
                    {slide.headline}
                  </h1>
                  <p className="fs-5 text-white mb-4" style={{ lineHeight: 1.35 }}>{slide.description}</p>
                  <a
                    href="/shop"
                    className="btn px-5 py-2 fw-bold"
                    style={{
                      background: slide.accent,
                      color: "#1a1b1c",
                      borderRadius: 25,
                      fontSize: "1.12rem",
                      boxShadow: "0 2px 16px rgba(0,0,0,0.12)"
                    }}
                  >
                    Ver catálogo
                  </a>
                </div>
                {/* Imagen/columna derecha para futuro contenido gráfico extra */}
                <div className="d-none d-md-block w-40 text-end" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}