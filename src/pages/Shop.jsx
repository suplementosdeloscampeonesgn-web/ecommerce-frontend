import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  // --- ESTADOS DEL COMPONENTE ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Para la lista de categorías de la API
  const [activeFilters, setActiveFilters] = useState([]); // Para guardar las categorías seleccionadas
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [visible, setVisible] = useState(12); // Para el botón "Ver más"

  // --- EFECTO PARA CARGAR DATOS DE LA API ---
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    setLoading(true);

    // Hacemos las dos peticiones (productos y categorías) al mismo tiempo
    Promise.all([
      axios.get(`${API_URL}/api/products`),
      axios.get(`${API_URL}/api/categories`)
    ])
    .then(([productsRes, categoriesRes]) => {
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []); // Guardamos las categorías en el estado
    })
    .catch(err => console.error("Error al cargar datos:", err))
    .finally(() => setLoading(false));
  }, []);

  // --- LÓGICA DE FILTRADO ---
  const handleFilterChange = (category) => {
    const lowerCaseCategory = category.toLowerCase();
    
    setActiveFilters(prevFilters =>
      prevFilters.includes(lowerCaseCategory)
        ? prevFilters.filter(c => c !== lowerCaseCategory) // Si ya está, la quita
        : [...prevFilters, lowerCaseCategory] // Si no está, la añade
    );
  };

  // Filtra los productos basándose en los filtros activos y el término de búsqueda
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeFilters.length === 0 || 
      (product.category && activeFilters.includes(product.category.toLowerCase()));
    
    const matchesSearch = searchTerm.trim() === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesCategory && matchesSearch;
  });

  // --- RENDERIZADO DEL COMPONENTE ---
  if (loading) {
    return <div className="text-center py-5 fw-bold fs-4">Cargando...</div>;
  }

  return (
    <div className="shop-bg-gradient min-vh-100 pt-5">
      <div className="container d-flex flex-column flex-lg-row gap-4 px-0">
        <aside className="col-12 col-lg-3 mb-4 mb-lg-0">
          <div className="bg-white p-4 rounded-4 shadow sticky-top-filtros">
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

            <h2 className="fw-black fs-4 text-primary mb-3">Filtrar por Categoría</h2>
            <div className="d-flex flex-column gap-2 fw-medium text-secondary">
              {categories.map((category) => (
                <label key={category} className="d-flex align-items-center pointer text-capitalize">
                  <input
                    type="checkbox"
                    className="form-check-input me-2 accent-warning"
                    checked={activeFilters.includes(category.toLowerCase())}
                    onChange={() => handleFilterChange(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-grow-1">
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <h1 className="fs-2 fw-bold text-primary">Tienda de Suplementos</h1>
            <span className="text-secondary small">{filteredProducts.length} productos</span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="row g-3 animate-fade-in">
              {filteredProducts.slice(0, visible).map(product => (
                <div className="col-12 col-sm-6 col-md-4" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted py-5 text-center fw-semibold fs-5">No se encontraron productos con esos filtros.</div>
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