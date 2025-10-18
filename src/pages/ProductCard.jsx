import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  
  // Lógica clave: Usa la URL de la imagen del producto enviada por la API.
  // Si no existe, muestra una imagen predeterminada.
  const imageUrl = product.image_url || "https://placehold.co/400x400/e2e8f0/333333?text=Producto";

  const handleAddToCart = () => {
    addItem(product, 1);
    // Puedes reemplazar 'alert' con una notificación más elegante si lo deseas
    alert(`"${product.name}" fue añadido al carrito.`);
  };

  return (
    <div className="card h-100 shadow-sm border-0 rounded-4 transition-transform">
      <Link to={`/product/${product.id}`} className="text-decoration-none">
        <img 
          src={imageUrl} 
          className="card-img-top rounded-top-4" 
          alt={product.name} 
          style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
        />
      </Link>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-bold text-primary">{product.name}</h5>
        <p className="card-text small text-secondary flex-grow-1">
          {product.description ? product.description.substring(0, 60) + '...' : 'Sin descripción.'}
        </p>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <p className="fs-5 fw-black text-primary mb-0">${Number(product.price).toFixed(2)}</p>
          <button onClick={handleAddToCart} className="btn btn-warning fw-bold rounded-pill px-3">
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}