import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function Admin() {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  // Si está logueado pero no es admin, lo saca
  useEffect(() => {
    if (user && user.token && user.role !== "admin") {
      logout();
      navigate("/", { replace: true });
    }
  }, [user, logout, navigate]);

  // Dashboard visible solo a admin autenticado
  if (user && user.token && user.role === "admin") {
    return (
      <div className="container mx-auto max-w-xl p-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">
          ¡Bienvenido al panel administrativo!
        </h2>
        <button 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mb-6"
          onClick={logout}
        >Cerrar Sesión</button>
        <hr className="my-6" />
        <div className="mb-3">
          <b>Email:</b> {user.sub || user.email}
        </div>
        <div className="mb-8">
          <b>Admin:</b> {user.role === "admin" ? 'Sí' : 'No'}
        </div>
        {/* Aquí el resto de tu dashboard real (productos, pedidos, stats...) */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold">Productos</h3>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mt-2"
              onClick={() => navigate("/admin/products")}
            >Gestionar productos</button>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold">Pedidos</h3>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mt-2"
              onClick={() => navigate("/admin/orders")}
            >Gestionar pedidos</button>
          </div>
        </div>
      </div>
    );
  }

  // Login Admin tradicional
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    // ✅ CORRECCIÓN: La URL se construye dinámicamente
    const LOGIN_URL = `${import.meta.env.VITE_API_URL}/api/auth/login`;

    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        login({ token: data.access_token });
      } else {
        setLoginError((data && data.detail) || "Credenciales inválidas");
      }
    } catch (err) {
      setLoginError("Error de conexión");
    }
  };

  // Login Google (usa el tokenId devuelto por el componente GoogleLogin)
  const handleGoogleLogin = async (credentialResponse) => {
    setLoginError('');

    // ✅ CORRECCIÓN: La URL se construye dinámicamente
    const GOOGLE_LOGIN_URL = `${import.meta.env.VITE_API_URL}/api/auth/google-login`;
    
    try {
      const res = await fetch(GOOGLE_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_id: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        login({ token: data.access_token });
      } else {
        setLoginError(data.detail || "Login Google inválido");
      }
    } catch (err) {
      setLoginError("Error Google OAuth");
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Login Administrador</h1>
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
        <label className="block mb-4">
          Correo:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-2 border rounded px-3 py-2 w-full"
            required
          />
        </label>
        <label className="block mb-4">
          Contraseña:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-2 border rounded px-3 py-2 w-full"
            required
          />
        </label>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Ingresar
        </button>
        {loginError && <div className="mt-4 text-red-600">{loginError}</div>}
      </form>
      <div className="mt-6">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setLoginError("Error de login con Google")}
          useOneTap
        />
      </div>
    </div>
  );
}