import { createContext, useContext, useState, useEffect } from 'react';

// 1. Creamos el contexto
const AuthContext = createContext(null);

/**
 * El AuthProvider es el componente que envuelve tu aplicación
 * para darle acceso global al estado de autenticación.
 */
export function AuthProvider({ children }) {
  // 2. El estado 'user' se inicializa intentando leer desde localStorage.
  // Esto mantiene la sesión activa después de recargar la página.
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error al leer el usuario del localStorage", error);
      return null;
    }
  });

  // 3. Este efecto sincroniza el estado 'user' con localStorage.
  useEffect(() => {
    if (user) {
      // Si el usuario existe (login), lo guardamos como un string JSON.
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      // Si el usuario es nulo (logout), lo eliminamos.
      localStorage.removeItem('user');
    }
  }, [user]); // Se ejecuta cada vez que el objeto 'user' cambia.

  /**
   * Actualiza el estado del usuario al iniciar sesión.
   * El useEffect se encargará de guardarlo en localStorage.
   */
  const login = (userData) => {
    setUser(userData);
  };

  /**
   * Limpia el estado del usuario al cerrar sesión.
   * El useEffect se encargará de limpiarlo de localStorage.
   */
  const logout = () => {
    setUser(null);
  };

  // 4. Pasamos el estado y las funciones al resto de la app.
  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user, // Un booleano útil para verificaciones rápidas
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para acceder fácilmente al contexto de autenticación
 * desde cualquier componente.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}