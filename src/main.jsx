import './styles/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast'; // <-- 1. Importa el Toaster

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ✅ 2. Se usa la variable de entorno para el clientId por seguridad */}
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
        {/* ✅ 3. Se añade el componente Toaster para que las notificaciones funcionen */}
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 3000,
          }}
        />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);