import React, { useState } from "react";
import ImageUpload from "./ImageUpload";

function ProductForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      await onSubmit({
        name,
        price: parseFloat(price),
        image_url: imageUrl,
      });
      setName("");
      setPrice("");
      setImageUrl(null);
      alert("Producto registrado correctamente");
    } catch (err) {
      alert("Ocurrió un error al registrar el producto");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 340, margin: "auto" }}>
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        style={{ display: "block", width: "100%", marginBottom: 10 }}
      />
      <input
        type="number"
        placeholder="Precio"
        value={price}
        onChange={e => setPrice(e.target.value)}
        required
        style={{ display: "block", width: "100%", marginBottom: 10 }}
      />
      {/* Componente robusto de subida y preview */}
      <ImageUpload onUpload={(url) => setImageUrl(url)} defaultUrl={imageUrl} />
      <button type="submit" disabled={uploading || !imageUrl} style={{ marginTop: 14, width: "100%" }}>
        {uploading ? "Registrando..." : "Registrar Producto"}
      </button>
    </form>
  );
}

export default ProductForm;
