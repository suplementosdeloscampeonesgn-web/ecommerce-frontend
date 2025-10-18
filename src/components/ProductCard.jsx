import { Link } from 'react-router-dom';
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  // CAMBIO 1: Se añade 'e' (evento) como parámetro.
  const handleAddToCart = (e) => {
    // CAMBIO 2: ¡MUY IMPORTANTE! Detiene la propagación del clic.
    // Esto evita que el <Link> se active cuando solo quieres agregar al carrito.
    e.stopPropagation();
    e.preventDefault();
    
    addItem(product, 1);
    alert(`${product.name} ha sido añadido al carrito!`); // Notificación simple
  };

  // CAMBIO 3: Lógica para obtener la URL de la imagen correctamente desde el backend.
  let imageUrl = "https://placehold.co/300x300/e2e8f0/333333?text=Producto";
  try {
    // El backend guarda 'images' como un string JSON, ej: '["/static/images/uuid.jpg"]'
    if (product.images) {
      const imagesArray = JSON.parse(product.images);
      if (imagesArray && imagesArray.length > 0) {
        // Prependemos la URL del backend a la ruta relativa de la imagen
        imageUrl = `http://localhost:8000${imagesArray[0]}`;
      }
    }
  } catch (error) {
    console.error("Error al parsear la imagen del producto:", error);
  }

  return (
    // CAMBIO 4: Toda la tarjeta está envuelta en un componente Link.
    // Apunta a la ruta de detalles del producto que definiste en App.jsx.
    <Link to={`/product/${product.id}`} className="text-decoration-none">
      <div className="bg-white border shadow rounded-4 p-4 d-flex flex-column align-items-center h-100 card-transition">
        <img
          src={imageUrl}
          alt={product.name}
          className="mb-3 rounded-3 shadow-sm bg-light"
          style={{ height: 140, width: "auto", objectFit: "cover" }}
          // Añadimos un fallback por si la imagen del backend falla
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x300/e2e8f0/333333?text=Error"; }}
        />
        <div className="d-flex flex-column align-items-center flex-grow-1 text-center">
          <h3 className="fs-5 fw-bold text-primary mb-1">{product.name}</h3>
          <p className="text-warning fs-4 fw-black mt-auto mb-3">${Number(product.price).toFixed(2)}</p>
        </div>
        
        <button
          className="btn btn-primary w-100 fw-bold rounded-pill shadow-sm card-btn"
          onClick={handleAddToCart} // La función ahora previene la navegación
        >
          Agregar al Carrito
        </button>
      </div>
    </Link>
  );
}