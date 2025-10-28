import { Link } from 'react-router-dom';
import { useCart } from "../context/CartContext";
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addItem(product, 1);
    toast.success(`"${product.name}" fue añadido al carrito!`);
  };

  // Usa el campo image_url directo (Firebase o Cloudinary), fallback local si no hay
  const imageUrl =
    product.image_url && typeof product.image_url === "string"
      ? product.image_url
      : "/no-img.png";

  return (
    <Link to={`/product/${product.id}`} className="text-decoration-none">
      <div className="bg-white border shadow rounded-4 p-4 d-flex flex-column align-items-center h-100 card-transition">
        <img
          src={imageUrl}
          alt={product.name}
          className="mb-3 rounded-3 shadow-sm bg-light"
          style={{ height: 140, width: "auto", objectFit: "cover" }}
          onError={e => {
            e.target.onerror = null;
            e.target.src = "/no-img.png";
          }}
        />
        <div className="d-flex flex-column align-items-center flex-grow-1 text-center">
          <h3 className="fs-5 fw-bold text-primary mb-1">{product.name}</h3>
          <p className="text-warning fs-4 fw-black mt-auto mb-3">
            ${Number(product.price).toFixed(2)}
          </p>
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
