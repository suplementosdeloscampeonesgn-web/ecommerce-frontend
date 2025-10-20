import { Link } from 'react-router-dom';
import { useCart } from "../context/CartContext";
import toast from 'react-hot-toast'; // <-- 1. Importa toast

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    // Esto que hiciste para detener la navegación es perfecto. ¡Bien hecho!
    e.stopPropagation();
    e.preventDefault();
    
    addItem(product, 1);
    // ✅ 2. Se reemplaza el alert por una notificación toast
    toast.success(`"${product.name}" fue añadido al carrito!`);
  };

  // ✅ 3. Lógica para obtener la URL de la imagen correctamente DESDE PRODUCCIÓN
  let imageUrl = "https://placehold.co/300x300/e2e8f0/333333?text=Producto";
  try {
    if (product.images) {
      const imagesArray = JSON.parse(product.images);
      if (imagesArray && imagesArray.length > 0) {
        // Se usa la variable de entorno para construir la URL completa de la imagen
        imageUrl = `${import.meta.env.VITE_API_URL}${imagesArray[0]}`;
      }
    }
  } catch (error) {
    console.error("Error al parsear la imagen del producto:", error);
  }

  return (
    <Link to={`/product/${product.id}`} className="text-decoration-none">
      <div className="bg-white border shadow rounded-4 p-4 d-flex flex-column align-items-center h-100 card-transition">
        <img
          src={imageUrl}
          alt={product.name}
          className="mb-3 rounded-3 shadow-sm bg-light"
          style={{ height: 140, width: "auto", objectFit: "cover" }}
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x300/e2e8f0/333333?text=Error"; }}
        />
        <div className="d-flex flex-column align-items-center flex-grow-1 text-center">
          <h3 className="fs-5 fw-bold text-primary mb-1">{product.name}</h3>
          <p className="text-warning fs-4 fw-black mt-auto mb-3">${Number(product.price).toFixed(2)}</p>
        </div>
        
        <button
          className="btn btn-primary w-100 fw-bold rounded-pill shadow-sm card-btn"
          onClick={handleAddToCart}
        >
          Agregar al Carrito
        </button>
      </div>
    </Link>
  );
}