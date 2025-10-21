import { useEffect, useState } from "react";
import axios from "axios";
import OrderDetail from "./OrderDetail";

export default function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = `${import.meta.env.VITE_API_URL}/api/orders/`;

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
      setError("No se pudieron cargar tus pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p>Cargando pedidos...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  if (selectedOrder) {
    return (
      <OrderDetail
        orderId={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <div>
      <h4 className="fw-bold mb-3">Mis Pedidos</h4>
      {orders.length === 0 ? (
        <div className="alert alert-secondary">
          Aún no tienes pedidos registrados.
        </div>
      ) : (
        <div className="table-responsive shadow-sm">
          <table className="table table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Número</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.order_number}</td>
                  <td>{new Date(order.created_at).toLocaleString("es-MX")}</td>
                  <td>${order.total_amount.toFixed(2)}</td>
                  <td>
                    <span
                      className={`badge ${
                        order.status === "PENDING"
                          ? "bg-warning text-dark"
                          : order.status === "PAID"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSelectedOrder(order.id)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
