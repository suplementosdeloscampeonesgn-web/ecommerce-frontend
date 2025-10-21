import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import OrdersSection from "../components/profile/OrdersSection";
import AddressesSection from "../components/profile/AddressesSection";

function RewardsSection() {
  return (
    <div>
      <h4 className="mb-3 fw-bold">Recompensas &amp; Cupones</h4>
      <div className="alert alert-success">
        Pronto recibirás puntos y beneficios exclusivos.
      </div>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [section, setSection] = useState("orders");

  return (
    <div className="container py-5" style={{ maxWidth: 1100 }}>
      <div className="row gy-4">
        {/* Sidebar de Perfil */}
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-body text-center">
              <div
                className="mx-auto mb-2 bg-light border rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 72, height: 72 }}
              >
                <svg width={44} height={44} fill="currentColor" className="text-secondary">
                  <circle cx="22" cy="22" r="22" fill="#dee2e6" />
                  <ellipse cx="22" cy="18" rx="10" ry="9" fill="#adb5bd" />
                  <ellipse cx="22" cy="38" rx="15" ry="8" fill="#adb5bd" />
                </svg>
              </div>
              <h5 className="mb-0">{user?.name || user?.email}</h5>
              <div className="text-muted small">{user?.email}</div>
            </div>
            <hr className="my-2" />

            {/* Menú lateral */}
            <ul className="list-group list-group-flush">
              <li
                className={`list-group-item list-group-item-action ${section === "orders" ? "active" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => setSection("orders")}
              >
                <i className="bi bi-receipt me-2"></i> Pedidos
              </li>
              <li
                className={`list-group-item list-group-item-action ${section === "addresses" ? "active" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => setSection("addresses")}
              >
                <i className="bi bi-geo-alt-fill me-2"></i> Direcciones
              </li>
              <li
                className={`list-group-item list-group-item-action ${section === "rewards" ? "active" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => setSection("rewards")}
              >
                <i className="bi bi-gift me-2"></i> Recompensas
              </li>
            </ul>

            <hr className="my-2" />
            <Link to="/" className="btn btn-outline-secondary w-100">
              Volver a la tienda
            </Link>
          </div>
        </div>

        {/* Contenido dinámico */}
        <div className="col-12 col-md-9">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              {section === "orders" && <OrdersSection />}
              {section === "addresses" && <AddressesSection />}
              {section === "rewards" && <RewardsSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
