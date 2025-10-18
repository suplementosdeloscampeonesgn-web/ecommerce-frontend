// EN: src/firebaseConfig.js

// Importa las funciones que necesitas
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // <-- CAMBIO 1: Importa getStorage

// Tu configuración de Firebase (esta parte está bien como la copiaste)
const firebaseConfig = {
  apiKey: "AIzaSyBgSSTQSv6yJWb_G3YUMeGdFnwwpoui2sA",
  authDomain: "asesoriasgnwebapp.firebaseapp.com",
  projectId: "asesoriasgnwebapp",
  storageBucket: "asesoriasgnwebapp.appspot.com", // Mantenemos el bucket por defecto aquí
  messagingSenderId: "622314082712",
  appId: "1:622314082712:web:79c2fbfd7db2b42fdb1bed",
  measurementId: "G-PVSW7RWSVJ"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// CAMBIO 2: Inicializa Storage apuntando a TU BUCKET PERSONALIZADO
const storage = getStorage(app, "gs://ecommerce-project-scamp");

// CAMBIO 3: Exporta solo 'storage' (y 'app' si lo necesitas en otro lado)
export { storage };

// La parte de Analytics no es necesaria para subir imágenes, puedes borrarla o comentarla.
// import { getAnalytics } from "firebase/analytics";
// const analytics = getAnalytics(app);