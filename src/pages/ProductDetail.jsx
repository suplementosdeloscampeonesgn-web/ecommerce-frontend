import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/ProductDetail.css'; 

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const fetchProduct = async () => {
      // ✅ CORRECCIÓN: Se construye la URL completa usando la variable de entorno
      const PRODUCT_URL = `${import.meta.env.VITE_API_URL}/api/products/${id}`;

      try {
        const response = await fetch(PRODUCT_URL);
        if (!response.ok) {
          throw new Error('El producto no fue encontrado.');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      alert(`${quantity} x ${product.name} ha(n) sido añadido(s) al carrito.`);
    }
  };

  if (loading) {
    return <div className="loading-state">Cargando producto...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/shop" className="btn btn-primary">Volver a la tienda</Link>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-5">Producto no disponible.</div>;
  }
  
  const imageUrl = product.image_url || "https://placehold.co/600x600/e2e8f0/333333?text=Producto";

  return (
    <div className="product-detail-container">
      <div className="product-image-section">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="product-main-image"
        />
      </div>
      <div className="product-info-section">
        <span className="product-category-badge">{product.category}</span>
        <h1 className="product-title">{product.name}</h1>
        <p className="product-description">{product.description}</p>
        
        <div className="price-tag">
          <span className="current-price">${Number(product.price).toFixed(2)}</span>
        </div>

        <div className="stock-info">
          {product.stock > 0 ? `Disponible: ${product.stock} unidades` : 'Agotado'}
        </div>

        <div className="actions-container">
          <div className="quantity-selector">
            <button onClick={handleDecrement} className="quantity-btn">-</button>
            <span className="quantity-display">{quantity}</span>
            <button onClick={handleIncrement} className="quantity-btn">+</button>
          </div>
          <button 
            onClick={handleAddToCart} 
            className="add-to-cart-btn" 
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
          </button>
        </div>
      </div>
    </div>
  );
}