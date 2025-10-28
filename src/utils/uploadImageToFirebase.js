// src/utils/uploadImageToFirebase.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export async function uploadImage(file, folder = "productos") {
  // Validación de tipo (puedes hacerlo más estricto si quieres)
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Formato de archivo no soportado. Usa PNG/JPG/JPEG/WEBP.');
  }
  // Produce nombre seguro:
  const ext = file.name.split('.').pop();
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2,9)}.${ext}`;

  const imgRef = ref(storage, `${folder}/${uniqueName}`);
  try {
    await uploadBytes(imgRef, file); // puede lanzar error CORS/storage
    const url = await getDownloadURL(imgRef);
    return url; // Puedes devolver {url, name: uniqueName, type: file.type}
  } catch (err) {
    console.error('Error subiendo imagen a Firebase:', err);
    throw new Error('Error subiendo la imagen. Intenta de nuevo.');
  }
}
