import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export async function uploadImage(file, folder = "productos") {
  const imgRef = ref(storage, `${folder}/${file.name}`);
  await uploadBytes(imgRef, file);
  return await getDownloadURL(imgRef);
}
