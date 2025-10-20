import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  // Estados para el formulario
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transferencia'); // Valor por defecto
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Si el carrito está vacío, no se puede proceder al pago
  if (cart.items.length === 0) {
    return (
      <div className="text-center py-5">
        <h2 className="fw-bold">Tu carrito está vacío</h2>
        <p className="text-muted">Añade productos a tu carrito antes de proceder al pago.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 1. Preparamos los datos que espera el backend
    const orderData = {
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      items: cart.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      // 2. Hacemos la llamada a la API para crear el pedido
      const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`;
      const response = await axios.post(API_URL, orderData, {
        // Asumo que el token se envía automáticamente por un interceptor de Axios
        // o que tu endpoint de 'get_current_user' lo maneja.
      });

      const newOrder = response.data;
      
      // 3. Si todo sale bien, limpiamos el carrito y redirigimos
      clearCart();
      navigate(`/order-confirmation/${newOrder.id}`, { 
        state: { paymentMethod: newOrder.payment_method } 
      });

    } catch (err) {
      console.error("Error al crear el pedido:", err);
      setError(err.response?.data?.detail || "Hubo un error al procesar tu pedido. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-center fw-bolder mb-5 text-primary">Finalizar Compra</h1>
      <form onSubmit={handleSubmit}>
        <div className="row g-5">
          {/* --- Columna de Formulario --- */}
          <div className="col-lg-7">
            <h3 className="fw-bold mb-4">Detalles de Envío</h3>
            <div className="mb-3">
              <label htmlFor="shippingAddress" className="form-label">Dirección Completa de Envío</label>
              <textarea
                id="shippingAddress"
                className="form-control"
                rows="4"
                placeholder="Calle, número, colonia, código postal, ciudad, estado."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              />
            </div>

            <h3 className="fw-bold mt-5 mb-4">Método de Pago</h3>
            <div className="list-group">
              <label className="list-group-item d-flex gap-3">
                <input
                  className="form-check-input flex-shrink-0"
                  type="radio"
                  name="paymentMethod"
                  value="transferencia"
                  checked={paymentMethod === 'transferencia'}
                  onChange={() => setPaymentMethod('transferencia')}
                />
                <span>
                  <strong>Transferencia Bancaria</strong>
                  <small className="d-block text-muted">Realiza el pago directamente desde tu cuenta bancaria. Te daremos los detalles al confirmar.</small>
                </span>
              </label>
              <label className="list-group-item d-flex gap-3">
                <input
                  className="form-check-input flex-shrink-0"
                  type="radio"
                  name="paymentMethod"
                  value="contra_entrega"
                  checked={paymentMethod === 'contra_entrega'}
                  onChange={() => setPaymentMethod('contra_entrega')}
                />
                <span>
                  <strong>Pago en Efectivo Contra Entrega</strong>
                  <small className="d-block text-muted">Paga en efectivo cuando recibas tu pedido. Nos pondremos en contacto para coordinar.</small>
                </span>
              </label>
            </div>
          </div>

          {/* --- Columna de Resumen de Pedido --- */}
          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="card-title fw-bold mb-4">Resumen de tu Pedido</h3>
                <ul className="list-group list-group-flush">
                  {cart.items.map(item => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{item.name} <small className="text-muted">x{item.quantity}</small></span>
                      <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                    </li>
                  ))}
                </ul>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <span className="fs-5 fw-bold">Total</span>
                  <strong className="fs-4 text-primary">${cart.totalPrice.toFixed(2)}</strong>
                </div>
              </div>
            </div>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            <div className="d-grid mt-4">
              <button type="submit" className="btn btn-success btn-lg" disabled={isLoading}>
                {isLoading ? 'Procesando Pedido...' : 'Realizar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}