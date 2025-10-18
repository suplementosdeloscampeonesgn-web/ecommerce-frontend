import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de Login para autenticación de usuarios.
 * Soporta login tradicional (email/contraseña) y login con Google.
 * Gestiona estados de carga, errores y redirige al usuario tras un login exitoso.
 */
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // --- ESTADO DEL COMPONENTE ---
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- LÓGICA DE MANEJO DE DATOS ---

  /**
   * Procesa la respuesta de un login exitoso.
   * Decodifica el token, guarda los datos del usuario en el contexto global
   * y redirige a la página correspondiente según el rol.
   * @param {string} accessToken - El token JWT recibido de la API.
   */
  const handleLoginSuccess = (accessToken) => {
    try {
      const decodedToken = jwtDecode(accessToken);
      const userData = {
        token: accessToken,
        role: decodedToken.role,
        email: decodedToken.sub, // 'sub' (subject) es el estándar para el ID de usuario en JWT
      };
      
      login(userData); // Actualiza el estado global de autenticación

      // Redirige usando navigate para una experiencia de SPA fluida
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Error al procesar el token:", err);
      setError("El token recibido no es válido. Inténtalo de nuevo.");
    }
  };

  /**
   * Maneja el cambio en los inputs del formulario.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // --- MANEJADORES DE EVENTOS ---

  /**
   * Envía el formulario de login tradicional a la API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // ✅ CORRECCIÓN: La URL se construye dinámicamente
    const LOGIN_URL = `${import.meta.env.VITE_API_URL}/api/auth/login`;

    try {
      const response = await axios.post(LOGIN_URL, formData);
      if (response.data.access_token) {
        handleLoginSuccess(response.data.access_token);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Credenciales incorrectas o error en el servidor.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja la respuesta exitosa del botón de login de Google.
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setIsLoading(true);

    // ✅ CORRECCIÓN: La URL se construye dinámicamente
    const GOOGLE_LOGIN_URL = `${import.meta.env.VITE_API_URL}/api/auth/google-login`;

    try {
      const response = await axios.post(GOOGLE_LOGIN_URL, {
        token_id: credentialResponse.credential,
      });
      if (response.data.access_token) {
        handleLoginSuccess(response.data.access_token);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Error al autenticar con Google.';
      setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div style={{ maxWidth: 430, margin: '60px auto', padding: '20px' }}>
      <h2 className="text-center mb-4">Iniciar Sesión</h2>
      
      {/* Formulario de Login Tradicional */}
      <form onSubmit={handleSubmit} className="mb-3">
        <div className="form-group mb-2">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            required
            autoComplete="email"
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            required
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={isLoading}
        >
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <div className="d-flex align-items-center my-3">
        <hr className="flex-grow-1"/>
        <span className="px-2 text-muted">o</span>
        <hr className="flex-grow-1"/>
      </div>
      
      {/* Botón de Login con Google */}
      <div className="d-flex justify-content-center mb-3">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Error en el login con Google')}
          useOneTap
        />
      </div>

      {/* Muestra de Errores */}
      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      <div className="text-center mt-3">
        ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
      </div>
    </div>
  );
}

export default Login;