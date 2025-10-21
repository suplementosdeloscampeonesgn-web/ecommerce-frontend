import { useState, useEffect } from "react";
import axios from "axios";

export default function OrderDetail({ orderId, onBack }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = `${import.meta.env.VITE_API_URL}/api/orders/${orderId}`;

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data);
      } catch (err) {
        setError("No se pudo cargar el detalle del pedido.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  if (loading) return <p>Cargando detalle del pedido...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <button className="btn btn-outline-secondary mb-3" onClick={onBack}>
        ← Volver a mis pedidos
      </button>
      <h4 className="fw-bold">
        Detalle del Pedido #{order?.order_number || orderId}
      </h4>

      <div className="mb-3">
        <p>
          <strong>Estado:</strong> {order.status}
        </p>
        <p>
          <strong>Método de pago:</strong>{" "}
          {order.payment_method === "transferencia"
            ? "Transferencia Bancaria"
            : order.payment_method === "contra_entrega"
            ? "Contra Entrega"
            : order.payment_method}
        </p>
        <p>
          <strong>Total:</strong> ${order.total_amount?.toFixed(2)}
        </p>
      </div>

      <h6 className="fw-bold mt-3">Productos</h6>
      <div className="table-responsive">
        <table className="table table-sm table-bordered align-middle mt-2">
          <thead className="table-light">
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unidad</th>
              <th>Total Línea</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td>{item.quantity}</td>
                <td>${item.product_price.toFixed(2)}</td>
                <td>${item.line_total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <h6 className="fw-bold">Dirección de envío</h6>
        <div className="border rounded p-3 bg-light small">
          <p className="mb-1">
            {order.shipping_address || "Sin dirección registrada"}
          </p>
          <p className="mb-0">
            <strong>Tipo de envío:</strong> {order.shipping_type || "Estándar"}
          </p>
        </div>
      </div>
    </div>
  );
}
