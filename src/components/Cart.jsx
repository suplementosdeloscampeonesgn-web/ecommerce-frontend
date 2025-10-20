import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom"; // Importamos Link para los botones

export default function Cart() {
  // Obtenemos del contexto no solo el carrito, sino también las funciones para modificarlo
  const { cart, removeItem, clearCart } = useCart();

  // Función para construir la URL de la imagen
  const getImageUrl = (item) => {
    try {
      if (item.images) {
        const imagesArray = JSON.parse(item.images);
        if (imagesArray && imagesArray.length > 0) {
          return `${import.meta.env.VITE_API_URL}${imagesArray[0]}`;
        }
      }
    } catch (e) { console.error("Error parsing image URL in cart", e); }
    return "https://placehold.co/80"; // Fallback
  };

  return (
    <section className="bg-light min-vh-70 pt-5">
      <div className="container" style={{ maxWidth: "850px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="display-6 fw-bold text-primary">Carrito de Compras</h2>
          {/* Solo mostramos el botón de vaciar si hay items */}
          {cart.items.length > 0 && (
            <button onClick={clearCart} className="btn btn-outline-danger">
              Vaciar Carrito
            </button>
          )}
        </div>

        {cart.items.length === 0 ? (
          <div className="p-5 bg-white rounded-4 shadow text-muted text-center fw-medium">
            <p className="fs-4 mb-3">Tu carrito está vacío</p>
            <Link to="/shop" className="btn btn-primary btn-lg">
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="bg-white p-3 p-md-4 rounded-4 shadow-sm">
            {/* Cabeceras de la tabla (visibles en pantallas grandes) */}
            <div className="row d-none d-md-flex text-muted fw-bold mb-2">
              <div className="col-md-6">Producto</div>
              <div className="col-md-2 text-center">Cantidad</div>
              <div className="col-md-2 text-center">Subtotal</div>
              <div className="col-md-2 text-end">Acción</div>
            </div>

            {cart.items.map((item, index) => (
              <div key={item.id}>
                <div className="row align-items-center py-3">
                  {/* --- Columna de Imagen y Nombre --- */}
                  <div className="col-12 col-md-6 d-flex align-items-center mb-3 mb-md-0">
                    <img
                      src={getImageUrl(item)}
                      alt={item.name}
                      className="rounded me-3"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                    <div>
                      <h5 className="mb-0 fs-6 fw-bold text-dark">{item.name}</h5>
                      <p className="mb-0 text-muted small">${Number(item.price).toFixed(2)} c/u</p>
                    </div>
                  </div>
                  
                  {/* --- Columna de Cantidad --- */}
                  <div className="col-4 col-md-2 text-center">
                    <span className="fw-semibold">{item.quantity} uds.</span>
                  </div>
                  
                  {/* --- Columna de Subtotal --- */}
                  <div className="col-4 col-md-2 text-center fw-bold text-dark">
                    ${(item.quantity * item.price).toFixed(2)}
                  </div>
                  
                  {/* --- Columna de Acciones --- */}
                  <div className="col-4 col-md-2 text-end">
                    <button
                      className="btn btn-link text-danger p-0"
                      onClick={() => removeItem(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                {/* Dibuja un separador entre items, pero no después del último */}
                {index < cart.items.length - 1 && <hr className="my-0" />}
              </div>
            ))}
            
            {/* --- Resumen del Total --- */}
            <div className="d-flex justify-content-end align-items-center mt-4 pt-3 border-top">
              <span className="fs-5 text-secondary me-3">Total del Pedido:</span>
              <span className="fs-3 fw-bolder text-primary">${cart.totalPrice.toFixed(2)}</span>
            </div>

            {/* --- Botón para ir al Checkout --- */}
            <div className="d-flex justify-content-end mt-4">
              <Link to="/checkout" className="btn btn-success btn-lg fw-bold">
                Proceder al Pago
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}