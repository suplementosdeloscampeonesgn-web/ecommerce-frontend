import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const FILTERS = [
  { key: "proteínas", label: "Proteínas" },
  { key: "pre-entrenos", label: "Pre-entrenos" },
  { key: "vitaminas", label: "Vitaminas" },
  { key: "creatina", label: "Creatina" },
  { key: "ganadores de peso", label: "Ganadores de peso" },
];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(12);
  const [activeFilters, setActiveFilters] = useState([]);
  
  // --- PASO 1: Crea un estado para el término de búsqueda ---
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // 1. Obtenemos la URL de la API desde las variables de entorno
    const API_URL = import.meta.env.VITE_API_URL;

    setLoading(true);
    // 2. Usamos la URL completa para la petición
    axios.get(`${API_URL}/api/products`) // <-- LÍNEA CORREGIDA
      .then(res => {
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = (filterKey) => {
    setActiveFilters(prevFilters => 
      prevFilters.includes(filterKey)
        ? prevFilters.filter(k => k !== filterKey)
        : [...prevFilters, filterKey]
    );
  };
  
  // --- PASO 3: Modifica el filtrado para incluir la búsqueda por nombre ---
  const filteredProducts = products.filter(product => {
    // Primero, filtra por categoría (si hay filtros activos)
    const matchesCategory = activeFilters.length === 0 || 
      (product.category && activeFilters.includes(product.category.toLowerCase()));
    
    // Luego, filtra por el término de búsqueda (si existe)
    const matchesSearch = searchTerm.trim() === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    // El producto se muestra si cumple ambas condiciones
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="shop-bg-gradient min-vh-100 pt-5">
      <div className="container d-flex flex-column flex-lg-row gap-4 px-0">
        <aside className="col-12 col-lg-3 mb-4 mb-lg-0">
          <div className="bg-white p-4 rounded-4 shadow sticky-top-filtros">
            {/* --- PASO 2: Añade el campo de búsqueda (input) --- */}
            <h2 className="fw-black fs-4 text-primary mb-3">Buscar</h2>
            <div className="mb-4">
              <input 
                type="text"
                className="form-control"
                placeholder="Nombre del producto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <h2 className="fw-black fs-4 text-primary mb-3">Filtrar</h2>
            <div className="d-flex flex-column gap-2 fw-medium text-secondary">
              {FILTERS.map(({ key, label }) => (
                <label key={key} className="d-flex align-items-center pointer">
                  <input
                    type="checkbox"
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

        <section className="flex-grow-1">
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <h1 className="fs-2 fw-bold text-primary">
              Tienda <span className="text-warning">Suplementos</span>
            </h1>
            <span className="text-secondary small">{filteredProducts.length} productos</span>
          </div>
          {loading ? (
            <div className="text-primary fw-bold fs-4 py-5 text-center">Cargando productos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-muted py-5 text-center fw-semibold fs-5">No se encontraron productos.</div>
          ) : (
            <div className="row g-3 animate-fade-in">
              {filteredProducts.slice(0, visible).map(product => (
                <div className="col-12 col-sm-6 col-md-4" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
          {visible < filteredProducts.length && (
            <div className="d-flex justify-content-center mt-5">
              <button
                className="btn btn-primary btn-lg fw-bold rounded-pill shop-btn"
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