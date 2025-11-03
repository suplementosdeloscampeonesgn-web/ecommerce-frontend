import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard"; // Asegúrate que este use product.image_url

// Lista estática de filtros (igual que antes)
const FILTERS = [
  { key: "accesorios", label: "Accesorios" },
  { key: "aminoácidos", label: "Aminoácidos" },
  { key: "carbohidratos", label: "Carbohidratos" },
  { key: "creatina", label: "Creatina" },
  { key: "diuréticos", label: "Diuréticos" },
  { key: "ganadores de peso", label: "Ganadores de peso" },
  { key: "pre-entrenos", label: "Pre-Entrenos" },
  { key: "precursores", label: "Precursores" },
  { key: "proteínas", label: "Proteínas" },
  { key: "quemadores", label: "Quemadores" },
  { key: "salud y bienestar", label: "Salud y Bienestar" },
  { key: "vitaminas", label: "Vitaminas" },
];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(12);
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    setLoading(true);
    
    axios.get(`${API_URL}/api/products`)
      .then(res => {
        // --- CAMBIO PARA EL BUG DE DATOS ---
        // Esto ahora revisa si 'res.data.items' existe, o 'res.data' es un array
        // O si 'res.data.products' existe. Cubre todas tus bases.
        const productData = res.data?.items || (Array.isArray(res.data) ? res.data : res.data?.products) || [];
        setProducts(productData);
        if (productData.length === 0 && Array.isArray(res.data)) {
           console.log("API devolvió un array vacío.");
        } else if (productData.length === 0) {
           console.warn("No se encontró 'items' o 'products' en la respuesta de la API:", res.data);
        }
      })
      .catch((err) => {
        setProducts([]);
        console.error("Error al pedir los productos:", err);
      })
      .finally(() => setLoading(false));

  }, []); // El array vacío asegura que esto se ejecute solo una vez al montar

  const handleFilterChange = (filterKey) => {
    setActiveFilters(prevFilters =>
      prevFilters.includes(filterKey)
        ? prevFilters.filter(k => k !== filterKey)
        : [...prevFilters, filterKey]
    );
  };

  const filteredProducts = products.filter(product => {
    // Filtrado por categoría
    const matchesCategory = activeFilters.length === 0 ||
      (product.category && activeFilters.includes(product.category.toLowerCase()));
    
    // Filtrado por búsqueda
    const matchesSearch = searchTerm.trim() === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesCategory && matchesSearch;
  });

  // (El JSX para renderizar filtros y productos estaba bien)
  return (
    // --- CAMBIO DE DISEÑO ---
    // 1. Clase 'shop-bg-gradient' eliminada. Ahora usará el fondo <body> de index.css
    <div className="min-vh-100 pt-5">
      <div className="container d-flex flex-column flex-lg-row gap-4 px-0">
        
        {/* === SIDEBAR / FILTROS === */}
        <aside className="col-12 col-lg-3 mb-4 mb-lg-0">
          {/* --- CAMBIO DE DISEÑO ---
            1. 'bg-white' -> 'bg-dark'
          */}
          <div className="bg-dark p-4 rounded-4 shadow sticky-top-filtros">
            {/* --- CAMBIO DE DISEÑO ---
              1. 'text-primary' -> 'text-info' (tu azul acento)
            */}
            <h2 className="fw-black fs-4 text-info mb-3">Buscar</h2>
            <div className="mb-4">
              <input 
                type="text"
                // --- CAMBIO DE DISEÑO ---
                // 1. Añadidas clases para que el input sea oscuro
                className="form-control bg-dark text-light border-secondary"
                placeholder="Nombre del producto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* --- CAMBIO DE DISEÑO ---
              1. 'text-primary' -> 'text-info'
            */}
            <h2 className="fw-black fs-4 text-info mb-3">Filtrar por Categoría</h2>
            {/* --- CAMBIO DE DISEÑO ---
              1. 'text-secondary' -> 'text-light' (para que se lea en fondo oscuro)
            */}
            <div className="d-flex flex-column gap-2 fw-medium text-light">
              {FILTERS.map(({ key, label }) => (
                <label key={key} className="d-flex align-items-center pointer">
                  <input
                    type="checkbox"
                    // 'accent-warning' se ve bien, lo dejamos
                    className="form-check-input me-2 accent-warning" 
                    checked={activeFilters.includes(key)}
                    onChange={() => handleFilterChange(key)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* === SECCIÓN DE PRODUCTOS === */}
        <section className="flex-grow-1">
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            {/* --- CAMBIO DE DISEÑO ---
              1. 'text-primary' -> 'text-info'
            */}
            <h1 className="fs-2 fw-bold text-info">Tienda de Suplementos</h1>
            {/* --- CAMBIO DE DISEÑO ---
              1. 'text-secondary' -> 'text-white-50' (gris claro)
            */}
            <span className="text-white-50 small">{filteredProducts.length} productos</span>
          </div>

          {loading ? (
             // --- CAMBIO DE DISEÑO ---
            <div className="text-info-emphasis fw-bold fs-4 py-5 text-center">Cargando productos...</div>
          ) : filteredProducts.length === 0 ? (
             // --- CAMBIO DE DISEÑO ---
            <div className="text-white-50 py-5 text-center fw-semibold fs-5">No se encontraron productos con esos filtros.</div>
          ) : (
            <div className="row g-3 animate-fade-in">
              {filteredProducts.slice(0, visible).map(product => (
                <div className="col-12 col-sm-6 col-md-4" key={product.id}>
                  {/* Asegúrate que ProductCard use product.image_url */}
                  <ProductCard product={product} /> 
                </div>
              ))}
            </div>
          )}

          {visible < filteredProducts.length && (
            <div className="d-flex justify-content-center mt-5">
              <button
                // --- CAMBIO DE DISEÑO ---
                // 1. Clases en conflicto ('btn-primary', 'shop-btn') eliminadas
                // 2. Reemplazadas por 'btn-info' (tu azul) y 'rounded-pill'
                className="btn btn-info btn-lg fw-bold rounded-pill text-white"
                onClick={() => setVisible(v => v + 8)}
              >
                Ver más productos
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}