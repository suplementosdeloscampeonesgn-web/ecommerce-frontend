import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  // Inicializa como array vacío, ¡eso está perfecto!
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Construye la URL completa usando la variable de entorno
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/products`;
    
    axios.get(apiUrl)
      .then(res => {
        // --- LA CORRECCIÓN ESTÁ AQUÍ ---
        
        // 1. (Opcional) Muestra en consola lo que *realmente* llega
        console.log("Respuesta completa de la API:", res.data);

        // 2. Asignamos el array de adentro, no el objeto completo.
        // Estoy 99% seguro de que tu array se llama 'items'.
        // Si se llama 'products' o de otra forma, solo cámbialo aquí.
        setProducts(res.data.items); 
      })
      .catch(err => {
        console.error("Error al traer productos:", err);
        
        // Importante: si falla, setea a un array vacío
        // para que el .map() no falle en el resto de la app.
        setProducts([]); 
      });
  }, []);

  return (
    <ProductContext.Provider value={{ products }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);