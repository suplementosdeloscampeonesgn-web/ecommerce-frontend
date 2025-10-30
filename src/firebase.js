// src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBgSSTQSv6yJWb_G3YUMeGdFnwwpoui2sA",
  authDomain: "asesoriasgnwebapp.firebaseapp.com",
  projectId: "asesoriasgnwebapp",
  // 👇 ****** ¡CORRECCIÓN AQUÍ! ****** 👇
  storageBucket: "asesoriasgnwebapp.firebasestorage.app",
  // 👆 ****** ¡CORRECCIÓN AQUÍ! ****** 👆
  messagingSenderId: "622314082712",
  appId: "1:622314082712:web:79c2fbfd7db2b42fdb1bed",
  measurementId: "G-PVSW7RWSVJ"
};

const app = initializeApp(firebaseConfig);
// getStorage() usará el storageBucket corregido de firebaseConfig
const storage = getStorage(app); 

export { storage };