// src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// La configuración de tu proyecto principal (de la consola Firebase).
const firebaseConfig = {
  apiKey: "AIzaSyBgSSTQSv6yJWb_G3YUMeGdFnwwpoui2sA",
  authDomain: "asesoriasgnwebapp.firebaseapp.com",
  projectId: "asesoriasgnwebapp",
  storageBucket: "asesoriasgnwebapp.appspot.com",
  messagingSenderId: "622314082712",
  appId: "1:622314082712:web:79c2fbfd7db2b42fdb1bed",
  measurementId: "G-PVSW7RWSVJ"
};

// Inicializa la app y Storage (si tu bucket principal es el de config, NO pongas segundo arg a getStorage).
const app = initializeApp(firebaseConfig);
const storage = getStorage(app); // Usa el bucket por defecto de tu config

export { storage };
