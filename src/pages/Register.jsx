import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Register() {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setIsLoading(true);

    // ✅ CORRECCIÓN: Se construye la URL completa usando la variable de entorno
    const REGISTER_URL = `${import.meta.env.VITE_API_URL}/api/auth/register`;

    try {
      const res = await axios.post(REGISTER_URL, form);
      if (res.data && res.data.access_token) {
        login({ token: res.data.access_token }); // Auto-login tras registro
        window.location.href = '/';
      } else {
        setRegisterError('No se pudo crear la cuenta');
      }
    } catch (err) {
      setRegisterError("Error registrando usuario");
    }
    setIsLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto' }}>
      <h2>Crear cuenta</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre:</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <label>Contraseña:</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="form-control mb-3"
          required
        />
        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={isLoading}
        >
          {isLoading ? 'Creando...' : 'Crear cuenta'}
        </button>
        {registerError && <div className="text-danger mt-3">{registerError}</div>}
      </form>
      <div style={{ marginTop: 18 }}>
        ¿Ya tienes cuenta? <a href="/login">Iniciar sesión</a>
      </div>
    </div>
  );
}

export default Register;