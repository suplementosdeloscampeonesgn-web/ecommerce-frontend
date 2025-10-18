import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  
  // Solo permite acceso si el usuario está autenticado Y su rol es admin
  if (!user || !user.token || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  
  return children;
}
