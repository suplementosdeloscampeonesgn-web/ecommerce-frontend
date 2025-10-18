import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, dispatch } = useCart();

  return (
    <section className="bg-light min-vh-70 pt-5">
      <div className="container" style={{ maxWidth: "650px" }}>
        <h2 className="display-6 fw-bold mb-4 text-primary">Carrito de compras</h2>
        {cart.items.length === 0 ? (
          <div className="p-4 bg-white rounded shadow text-muted text-center fw-medium">
            Tu carrito está vacío
          </div>
        ) : (
          <ul className="list-unstyled">
            {cart.items.map(item => (
              <li
                key={item.product_id}
                className="d-flex justify-content-between align-items-center mb-3 bg-white p-3 rounded shadow-sm"
              >
                <span>Producto #{item.product_id}</span>
                <span className="fw-semibold">{item.quantity} uds.</span>
                <button
                  className="btn btn-link text-danger p-0"
                  onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.product_id })}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
