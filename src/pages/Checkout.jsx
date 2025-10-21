import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BRANCH_ADDRESS = "Av Vicente Rivera 131 A, Col. Nuevo Paseo, 78437, SLP";
const BRANCH_MAPS_URL = "https://www.google.com/maps?q=Av+Vicente+Rivera+131+A,+Col.+Nuevo+Paseo,+78437,+SLP";
const SLP_POSTAL_CODES = ["78437", "78000", "78010"]; // agrega los de SLP aquí si amplías

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingType, setShippingType] = useState(""); // "branch" o "delivery"
  const [form, setForm] = useState({
    postal: "",
    address: "",
    city: "",
    state: "",
  });
  const [shippingCost, setShippingCost] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Bloqueo si el carrito está vacío
  if (cart.items.length === 0) {
    return (
      <div className="text-center py-5">
        <h2 className="fw-bold">Tu carrito está vacío</h2>
        <p className="text-muted">Añade productos a tu carrito antes de proceder al pago.</p>
      </div>
    );
  }

  const handleSelectType = (type) => {
    setShippingType(type);
    setShippingCost(null);
    setForm({
      postal: "",
      address: "",
      city: "",
      state: "",
    });
  };

  const handlePostalChange = (e) => {
    const postal = e.target.value;
    setForm({ ...form, postal });

    if (shippingType === "delivery") {
      if (!SLP_POSTAL_CODES.includes(postal)) {
        setShippingCost(249);
      } else {
        setShippingCost(postal === "78437" ? 50 : 100);
      }
    }
  };

  // Resumen completo de dirección que va para backend
  const shippingAddress = shippingType === "branch"
    ? `Sucursal: ${BRANCH_ADDRESS}` 
    : `${form.address}, CP: ${form.postal}, ${form.city}, ${form.state}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 1. Preparamos los datos que espera el backend
    const orderData = {
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      shipping_type: shippingType,
      shipping_cost: shippingCost || 0,
      items: cart.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`;
      const response = await axios.post(API_URL, orderData);

      const newOrder = response.data;
      clearCart();
      navigate(`/order-confirmation/${newOrder.id}`, { 
        state: { paymentMethod: newOrder.payment_method } 
      });

    } catch (err) {
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

          {/* Columna Formulario */}
          <div className="col-lg-7">
            <h3 className="fw-bold mb-4">Opciones de Entrega</h3>
            <div className="d-flex gap-4 mb-4">
              <button
                type="button"
                className={`btn ${shippingType === "branch" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => handleSelectType("branch")}
              >
                Recoger en sucursal
              </button>
              <button
                type="button"
                className={`btn ${shippingType === "delivery" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => handleSelectType("delivery")}
              >
                Envío a domicilio
              </button>
            </div>

            {/* Recoger en sucursal */}
            {shippingType === "branch" && (
              <div className="border rounded p-3 mb-4 bg-light">
                <p className="mb-1"><strong>Dirección sucursal:</strong></p>
                <p className="mb-1">{BRANCH_ADDRESS}</p>
                <a
                  href={BRANCH_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-decoration-underline"
                >
                  Ver en Maps
                </a>
              </div>
            )}

            {/* Envío a domicilio */}
            {shippingType === "delivery" && (
              <div className="border rounded p-3 mb-4 bg-light">
                <div className="mb-2">
                  <label className="form-label">Código Postal</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.postal}
                    onChange={handlePostalChange}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Ciudad</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Estado</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    required
                  />
                </div>
                {shippingCost !== null && (
                  <div className="alert alert-info mb-0">
                    Costo de envío: <strong>${shippingCost} MXN</strong>
                  </div>
                )}
              </div>
            )}

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
                  <small className="d-block text-muted">Realiza el pago desde tu cuenta bancaria. Te daremos los detalles al confirmar.</small>
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
                  <small className="d-block text-muted">Paga en efectivo cuando recibas tu pedido.</small>
                </span>
              </label>
            </div>
          </div>

          {/* Columna Resumen Pedido */}
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
                {shippingType === "delivery" && shippingCost !== null && (
                  <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                    <span className="fs-6">Envío</span>
                    <strong className="fs-6 text-info">${shippingCost}</strong>
                  </div>
                )}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <span className="fs-5 fw-bold">Total</span>
                  <strong className="fs-4 text-primary">
                    ${(cart.totalPrice + (shippingType === "delivery" && shippingCost ? shippingCost : 0)).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            <div className="d-grid mt-4">
              <button
                type="submit"
                className="btn btn-success btn-lg"
                disabled={isLoading || !shippingType || (shippingType === "delivery" && (!form.postal || !form.address || !form.city || !form.state))}
              >
                {isLoading ? 'Procesando Pedido...' : 'Realizar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
