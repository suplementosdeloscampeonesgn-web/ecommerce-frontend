import { useParams, useLocation, Link } from 'react-router-dom';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const paymentMethod = location.state?.paymentMethod;

  return (
    <div className="container text-center py-5" style={{ maxWidth: '700px' }}>
      <h1 className="display-4 fw-bold text-success">¡Gracias por tu compra!</h1>
      <p className="lead text-muted">Hemos recibido tu pedido y lo estamos procesando.</p>
      <div className="card shadow-sm my-4">
        <div className="card-body">
          <h5 className="card-title">Número de Pedido</h5>
          <p className="card-text fs-4 fw-bold text-primary">{orderId}</p>
        </div>
      </div>
      
      {/* --- Muestra instrucciones según el método de pago --- */}
      {paymentMethod === 'transferencia' && (
        <div className="alert alert-info">
          <h4 className="alert-heading">Instrucciones para Transferencia</h4>
          <p>Por favor, realiza la transferencia a la siguiente cuenta CLABE:</p>
          <hr />
          <p className="mb-0 fs-5 fw-bold">1234 5678 9012 3456 78</p>
          <small>A nombre de: Suplementos de los Campeones GN</small>
        </div>
      )}

      {paymentMethod === 'contra_entrega' && (
        <div className="alert alert-secondary">
          <h4 className="alert-heading">Pago Contra Entrega</h4>
          <p>Un representante se pondrá en contacto contigo a la brevedad para coordinar la entrega y el pago en efectivo de tu pedido.</p>
        </div>
      )}

      <Link to="/" className="btn btn-primary mt-3">Volver a la Página Principal</Link>
    </div>
  );
}