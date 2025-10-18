import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);

useEffect(() => {
  // Construye la URL completa usando la variable de entorno
  const apiUrl = `${import.meta.env.VITE_API_URL}/api/products`;
  
  axios.get(apiUrl)
    .then(res => setProducts(res.data))
    .catch(err => console.log(err));
}, []);

  return (
    <ProductContext.Provider value={{ products }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
