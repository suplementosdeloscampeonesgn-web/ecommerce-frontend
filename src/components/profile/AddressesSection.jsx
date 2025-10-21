import { useEffect, useState } from "react";
import axios from "axios";

export default function AddressesSection() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    address_line: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
  });

  const API_URL = `${import.meta.env.VITE_API_URL}/api/address/`;

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(response.data);
    } catch (err) {
      setError("No se pudieron cargar tus direcciones.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(API_URL, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses((prev) => [...prev, response.data]);
      setForm({
        name: "",
        address_line: "",
        city: "",
        state: "",
        postal_code: "",
        phone: "",
      });
      setError("");
    } catch (err) {
      setError("Error al guardar la dirección.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Deseas eliminar esta dirección?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_URL}${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    } catch {
      setError("Error al eliminar la dirección.");
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  if (loading) return <p>Cargando direcciones...</p>;

  return (
    <div>
      <h4 className="fw-bold mb-3">Mis Direcciones</h4>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Formulario Nueva Dirección */}
      <form
        onSubmit={handleAddAddress}
        className="border rounded p-3 bg-light mb-4"
      >
        <h6 className="fw-semibold mb-3">Agregar Nueva Dirección</h6>
        <div className="row g-2">
          <div className="col-md-6">
            <input
              type="text"
              placeholder="Alias (opcional e.g. Casa)"
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              placeholder="Teléfono"
              className="form-control"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="col-md-12">
            <input
              type="text"
              placeholder="Calle y número"
              className="form-control"
              value={form.address_line}
              onChange={(e) =>
                setForm({ ...form, address_line: e.target.value })
              }
              required
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              placeholder="Ciudad"
              className="form-control"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              placeholder="Estado"
              className="form-control"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="text"
              placeholder="C.P."
              className="form-control"
              value={form.postal_code}
              onChange={(e) =>
                setForm({ ...form, postal_code: e.target.value })
              }
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Guardar Dirección
        </button>
      </form>

      {/* Lista de Direcciones */}
      <h6 className="fw-bold mb-2">Direcciones Guardadas</h6>
      {addresses.length === 0 ? (
        <p className="text-muted">Aún no tienes direcciones guardadas.</p>
      ) : (
        <div className="list-group">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{addr.name || "Dirección sin nombre"}</strong>
                <div className="text-muted small">
                  {addr.address_line}, {addr.city}, {addr.state},{" "}
                  {addr.postal_code}
                </div>
                {addr.phone && (
                  <div className="text-muted small">Tel: {addr.phone}</div>
                )}
              </div>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(addr.id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
