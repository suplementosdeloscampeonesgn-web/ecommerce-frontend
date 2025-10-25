// Ruta del archivo: src/api/apiClient.js

import axios from 'axios';

// 1. Obtenemos la URL base de tus variables de entorno
const VITE_API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: VITE_API_URL,
});

// 2. ¡La Magia! El interceptor
// Esto se ejecuta ANTES de que CADA petición salga.
apiClient.interceptors.request.use(
  (config) => {
    // 3. Obtenemos el objeto 'user' de localStorage
    // (Tu AuthContext lo guarda allí)
    const userString = localStorage.getItem('user');
    
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.token) {
        // 4. Si hay token, lo añadimos a la cabecera 'Authorization'
        config.headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    // Maneja errores de la petición
    return Promise.reject(error);
  }
);

export default apiClient;