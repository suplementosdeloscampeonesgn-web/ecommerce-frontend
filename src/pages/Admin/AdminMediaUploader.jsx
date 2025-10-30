import React, { useState, useRef, useCallback } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, LinearProgress, Paper, TextField, Alert } from '@mui/material';
import { UploadFile as UploadFileIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { uploadImage } from '../../utils/uploadImageToFirebase'; // Asegúrate que esta ruta sea correcta

function AdminMediaUploader() {
  const [selectedFiles, setSelectedFiles] = useState([]); // Archivos seleccionados por el usuario
  const [uploadProgress, setUploadProgress] = useState(0); // Progreso general (0 a 100)
  const [isUploading, setIsUploading] = useState(false); // ¿Estamos subiendo ahora?
  const [results, setResults] = useState([]); // Array para guardar { id: '1', url: '...', status: 'success'/'error', errorMsg: '...' }
  const [error, setError] = useState(''); // Errores generales
  const fileInputRef = useRef(null); // Referencia al input de archivo

  // Maneja la selección de archivos
  const handleFileChange = (event) => {
    setError(''); // Limpia errores previos
    setResults([]); // Limpia resultados previos
    setUploadProgress(0); // Resetea progreso
    const files = Array.from(event.target.files); // Convierte FileList a Array
    console.log('Archivos seleccionados:', files);

    // Validación básica inicial (opcional pero recomendada)
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    const invalidCount = files.length - validFiles.length;
    if (invalidCount > 0) {
      setError(`Se descartaron ${invalidCount} archivos por no ser imágenes.`);
    }

    // Extrae el ID del nombre de archivo (asumiendo formato '1.jpg', '2.png', etc.)
    const filesWithId = validFiles.map(file => {
      const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
      const id = nameWithoutExtension; // Usamos el nombre sin extensión como ID
      if (!id || isNaN(parseInt(id))) { // Verifica si el ID es numérico o válido
          console.warn(`Archivo "${file.name}" no tiene ID numérico como nombre. Se usará el nombre completo como ID.`);
          return { file, id: file.name, preview: URL.createObjectURL(file) }; // Fallback a usar nombre completo
      }
      return { file, id, preview: URL.createObjectURL(file) };
    }).filter(f => f.id); // Asegura que todos tengan un ID asignado

    setSelectedFiles(filesWithId);
  };

  // Limpia las URLs de previsualización cuando el componente se desmonta o los archivos cambian
  useEffect(() => {
    return () => {
      selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [selectedFiles]);

  // Función principal para subir los archivos
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('No hay archivos seleccionados para subir.');
      return;
    }

    setIsUploading(true);
    setError('');
    setResults([]); // Limpia resultados previos
    setUploadProgress(0);
    const totalFiles = selectedFiles.length;
    let completedCount = 0;
    const uploadResults = [];

    // Usamos Promise.allSettled para ejecutar todas las subidas en paralelo
    // y esperar a que TODAS terminen (con éxito o error)
    const promises = selectedFiles.map(async ({ file, id }) => {
      try {
        console.log(`Subiendo archivo con ID: ${id}, nombre: ${file.name}`);
        const url = await uploadImage(file, "productos"); // Llama a tu función de subida
        console.log(`Éxito ID ${id}: ${url}`);
        return { id, url, status: 'success', fileName: file.name };
      } catch (uploadError) {
        console.error(`Error subiendo ID ${id} (${file.name}):`, uploadError);
        return { id, url: null, status: 'error', fileName: file.name, errorMsg: uploadError.message || 'Error desconocido' };
      } finally {
        // Actualiza el progreso después de cada subida (éxito o fallo)
        completedCount++;
        setUploadProgress(Math.round((completedCount / totalFiles) * 100));
      }
    });

    // Espera a que todas las promesas se resuelvan
    const settledResults = await Promise.allSettled(promises);

    // Procesa los resultados
    settledResults.forEach(result => {
      if (result.status === 'fulfilled') {
        uploadResults.push(result.value); // El objeto { id, url, status, fileName }
      } else {
        // Esto no debería pasar con Promise.allSettled si el catch dentro del map funciona bien
        // Pero lo dejamos por si acaso
        console.error("Error inesperado en Promise.allSettled:", result.reason);
        // Si necesitas saber qué archivo falló aquí, tendrías que mapear el índice
        uploadResults.push({ id: 'desconocido', url: null, status: 'error', errorMsg: 'Error muy inesperado en subida paralela.' });
      }
    });

    setResults(uploadResults); // Guarda todos los resultados
    setIsUploading(false);
    // Limpia el input de archivo después de subir
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSelectedFiles([]); // Limpia la lista de previsualización
  };

  // Copia los resultados al portapapeles en formato CSV (ID,URL)
  const copyResultsToClipboard = useCallback(() => {
    if (results.length === 0) return;
    const successfulUploads = results.filter(r => r.status === 'success');
    if (successfulUploads.length === 0) {
        alert("No hay subidas exitosas para copiar.");
        return;
    }
    // Formato CSV: id,image_url (como en tu CSV original, ¡perfecto para VLOOKUP!)
    const csvHeader = "id,image_url\n";
    const csvContent = successfulUploads
      .map(r => `${r.id},${r.url}`)
      .join("\n");
    navigator.clipboard.writeText(csvHeader + csvContent)
      .then(() => alert(`${successfulUploads.length} URLs copiadas al portapapeles!`))
      .catch(err => alert('Error al copiar: ' + err));
  }, [results]);

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>Cargador de Imágenes en Lote</Typography>
      <Typography variant="body1" gutterBottom>
        Sube múltiples imágenes renombradas con su ID (ej. '1.jpg', '2.png').
        Luego podrás copiar la lista de URLs para actualizar la base de datos.
      </Typography>

      {/* Input de Archivo (oculto pero conectado al botón) */}
      <input
        type="file"
        multiple // ¡Permite seleccionar varios!
        accept="image/png, image/jpeg, image/webp, image/gif"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="batch-image-upload-input"
      />

      {/* Botón para Seleccionar Archivos */}
      <label htmlFor="batch-image-upload-input">
        <Button
          variant="contained"
          component="span" // Importante para conectar con el input
          startIcon={<UploadFileIcon />}
          sx={{ mb: 2 }}
          disabled={isUploading} // Deshabilita mientras sube
        >
          Seleccionar Imágenes ({selectedFiles.length})
        </Button>
      </label>

      {/* Muestra errores generales */}
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Lista de Archivos Seleccionados (Previsualización) */}
      {selectedFiles.length > 0 && !isUploading && (
        <Paper elevation={1} sx={{ maxHeight: 200, overflow: 'auto', mb: 2, p: 1 }}>
          <Typography variant="subtitle2" sx={{pl: 1}}>Archivos listos:</Typography>
          <List dense>
            {selectedFiles.map(({ file, id, preview }) => (
              <ListItem key={file.name}>
                 <img src={preview} alt="preview" width="30" height="30" style={{ marginRight: 8, objectFit: 'cover' }} />
                <ListItemText primary={`${file.name} (ID detectado: ${id})`} secondary={`${(file.size / 1024).toFixed(1)} KB`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Botón para Iniciar Subida */}
      {selectedFiles.length > 0 && !isUploading && (
        <Button
          variant="contained"
          color="secondary"
          onClick={handleUpload}
          sx={{ mb: 2 }}
        >
          Subir {selectedFiles.length} Imágenes
        </Button>
      )}

      {/* Progreso de Subida */}
      {isUploading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography variant="body2">Subiendo... {uploadProgress}%</Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Resultados de la Subida */}
      {results.length > 0 && !isUploading && (
        <Box>
          <Typography variant="h6">Resultados de la Subida:</Typography>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={copyResultsToClipboard}
            sx={{ my: 1 }}
            disabled={results.filter(r=>r.status === 'success').length === 0}
          >
            Copiar URLs Exitosas (CSV)
          </Button>
          {/* Usamos un TextField multilínea para mostrar resultados y permitir copiar fácil */}
          <TextField
             multiline
             fullWidth
             readOnly
             rows={10}
             value={
                "id,image_url\n" + // Encabezado CSV
                results.map(r =>
                    r.status === 'success'
                    ? `${r.id},${r.url}`
                    : `${r.id},ERROR: ${r.errorMsg || 'Fallo'}`
                ).join("\n")
             }
             variant="outlined"
             sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
          />
          {results.some(r => r.status === 'error') && (
              <Alert severity="error" sx={{mt: 1}}>Algunas imágenes fallaron al subir. Revisa la lista.</Alert>
          )}
        </Box>
      )}
    </Box>
  );
}

export default AdminMediaUploader;