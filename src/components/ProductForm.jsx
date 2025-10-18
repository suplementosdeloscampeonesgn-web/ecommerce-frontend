import React, { useState } from "react";
import { uploadImage } from "../utils/uploadImageToFirebase";

function ProductForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    let imageUrl = "";
    try {
      if (image) {
        // SUBE la imagen a Firebase Storage y obtiene la URL pública
        imageUrl = await uploadImage(image, "productos"); // "productos" es el folder opcional
      }
      // Envia los datos del producto al backend con la URL de Firebase
      await onSubmit({
        name,
        price: parseFloat(price),
        image_url: imageUrl,
      });
      // Resetea campos si todo sale bien
      setName("");
      setPrice("");
      setImage(null);
      alert("Producto registrado correctamente");
    } catch (err) {
      alert("Ocurrió un error al registrar el producto");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required/>
      <input type="number" placeholder="Precio" value={price} onChange={e => setPrice(e.target.value)} required/>
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
      <button type="submit" disabled={uploading}>
        {uploading ? "Registrando..." : "Registrar Producto"}
      </button>
    </form>
  );
}

export default ProductForm;
