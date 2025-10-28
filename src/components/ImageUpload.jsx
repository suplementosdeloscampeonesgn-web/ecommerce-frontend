import React, { useState } from 'react';
import { uploadImage } from '../utils/uploadImageToFirebase'; // Asegúrate de path correcto
import { Box, Button, LinearProgress, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function ImageUpload({ onUpload, defaultUrl = null }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(defaultUrl || null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const f = e.target.files[0];
    setError('');
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Solo se permiten imágenes PNG, JPG, JPEG o WEBP');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Selecciona una imagen antes de subir.');
      return;
    }
    setProgress(0);
    setUploading(true);
    setError('');
    try {
      // El upload es instantáneo, pero puedes acoplar la función para usar uploadBytesResumable si quieres progreso real.
      const url = await uploadImage(file, "productos");
      setProgress(100);
      setTimeout(() => setUploading(false), 300);
      setError('');
      if (onUpload) onUpload(url);
    } catch (err) {
      setError(err.message || 'Error inesperado al subir.');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError('');
    if (onUpload) onUpload(null);
  };

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <input
          accept=".png,.jpg,.jpeg,.webp"
          style={{ display: 'none' }}
          id="image-upload"
          type="file"
          onChange={handleChange}
        />
        <label htmlFor="image-upload">
          <Button variant="outlined" component="span" disabled={uploading}>
            Seleccionar archivo
          </Button>
        </label>
        {preview && (
          <IconButton aria-label="Quitar imagen" onClick={handleRemove} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      {preview && (
        <Box sx={{ mb: 1 }}>
          <img src={preview} alt="Preview" style={{ maxWidth: 160, maxHeight: 160, borderRadius: 4, objectFit: "contain", background: "#f0f0f0" }} />
        </Box>
      )}
      <Box sx={{ my: 1 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!file || uploading}
          onClick={handleUpload}
          sx={{ minWidth: 160 }}
        >
          {uploading ? 'Subiendo...' : 'Subir Imagen'}
        </Button>
      </Box>
      {uploading && <LinearProgress variant="determinate" value={progress} sx={{ my: 1 }} />}
      {error && <Typography color="error" variant="caption">{error}</Typography>}
    </Box>
  );
}

export default ImageUpload;
