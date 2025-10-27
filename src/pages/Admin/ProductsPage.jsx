import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../api/apiClient'; // Tu instancia de Axios configurada
import {
  Box, Button, CircularProgress, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert, Grid,
  Card, CardMedia, IconButton, FormControlLabel, Checkbox // Añadido FormControlLabel y Checkbox si los usas
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useForm } from 'react-hook-form';
import { Add, Edit, Delete, Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material';
import { uploadImage } from '../../utils/uploadImageToFirebase'; // Verifica esta ruta

// --- DEBUG --- Log de Renderizado del Componente
console.log('--- Renderizando ProductsPage ---');

function ProductsPage() {
  // --- DEBUG --- Log de Inicialización de useForm
  console.log('--- Inicializando useForm ---');
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty, isValid } } = useForm({
    mode: 'onChange', // Validar al cambiar para feedback inmediato
    defaultValues: { // Establecer valores por defecto claros
        name: '',
        brand: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        sku: '',
        slug: '',
        image_url: null,
        image: null, // Campo para el FileList
        is_active: true,
        is_featured: false,
    }
  });

  // --- DEBUG --- Log de 'watch' para el campo de imagen
  const imageFile = watch('image');
  console.log('--- Observando campo \'image\', valor actual:', imageFile);

  // Estados del componente
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Cargar productos (con useCallback para estabilidad de referencia)
  const loadProducts = useCallback(async () => {
    // --- DEBUG --- Inicio de Carga de Productos
    console.log('--- loadProducts: Obteniendo productos ---');
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/products'); // Usa la ruta de admin
      if (response.data && Array.isArray(response.data)) {
        // --- DEBUG --- Carga de Productos Exitosa
        console.log(`--- loadProducts: Éxito, ${response.data.length} productos recibidos ---`);
        setProducts(response.data);
      } else {
        console.error("--- loadProducts: La respuesta de la API no es un array válido:", response.data);
        setProducts([]);
        setSnackbar({ open: true, message: 'Error: Respuesta del servidor no válida.', severity: 'error' });
      }
    } catch (error) {
      // --- DEBUG --- Error en Carga de Productos
      console.error("--- loadProducts: Error obteniendo productos ---", error.response?.data?.detail || error.message);
      setProducts([]);
      setSnackbar({ open: true, message: `Error al cargar productos: ${error.message}`, severity: 'error' });
    } finally {
      // --- DEBUG --- Fin de Carga de Productos
      console.log('--- loadProducts: Carga finalizada ---');
      setLoading(false);
    }
  }, []); // Sin dependencias

  // Efecto para cargar productos al montar el componente
  useEffect(() => {
    // --- DEBUG --- Efecto de Carga Inicial
    console.log('--- useEffect[]: Llamada inicial a loadProducts ---');
    loadProducts();
  }, [loadProducts]); // Dependencia: loadProducts

  // --- useEffect con MÁXIMA DEPURACIÓN para previsualización de imagen ---
  useEffect(() => {
    // --- DEBUG --- Inicio del Efecto de Previsualización
    console.log("--- useEffect[imageFile]: INICIO ---");
    console.log("   > Valor actual imageFile:", imageFile);
    console.log("   > Producto en edición:", editingProduct);
    console.log("   > Estado actual imagePreview:", imagePreview);

    // Verifica si imageFile es un FileList válido con al menos un archivo
    if (imageFile && imageFile instanceof FileList && imageFile.length > 0) {
      const file = imageFile[0];
      // --- DEBUG --- Archivo Detectado
      console.log("   > Archivo detectado:", file);
      console.log(`   > Detalles: nombre=${file.name}, tamaño=${file.size}, tipo=${file.type}`);

      // Validación básica de tipo de archivo
      if (!file.type.startsWith('image/')) {
        console.warn("   > El archivo seleccionado no es de tipo imagen:", file.type);
        setSnackbar({ open: true, message: 'Por favor, selecciona un archivo de imagen (png, jpg, webp, gif).', severity: 'warning' });
        setValue('image', null); // Limpia el estado de RHF
        if(fileInputRef.current) fileInputRef.current.value = ''; // Limpia el input del DOM
        setImagePreview(editingProduct?.image_url || null); // Revierte a la imagen original o null
        return; // Detiene la ejecución
      }

      let currentPreviewUrl = null; // Guarda la URL localmente para limpieza segura
      try {
        currentPreviewUrl = URL.createObjectURL(file);
        // --- DEBUG --- Creando URL Blob
        console.log("   > Creando URL Blob:", currentPreviewUrl);
        setImagePreview(currentPreviewUrl); // Actualiza el estado para mostrarla

        // Función de limpieza para esta URL específica
        return () => {
          // --- DEBUG --- Disparador de Limpieza
          console.log(`--- useEffect[imageFile]: LIMPIEZA para ${currentPreviewUrl} ---`);
          URL.revokeObjectURL(currentPreviewUrl);
          console.log(`   > URL Blob revocada: ${currentPreviewUrl}`);
        };
      } catch (error) {
        // --- DEBUG --- Error Creando URL Blob
        console.error("   > Error creando URL Blob:", error);
        setImagePreview(null); // Resetea la previsualización en caso de error
      }
    } else {
      // --- DEBUG --- Sin Archivo o FileList Vacío
      console.log("   > No se detectó archivo válido en imageFile.");
      // Lógica para resetear/restaurar previsualización
      // Si no estamos editando O si estamos editando pero no hay imagen original, la preview es null
      if (!editingProduct?.image_url) {
           console.log("   > Estableciendo previsualización a null (no hay imagen existente).");
           // Solo actualiza si no es ya null para evitar re-renders
           if (imagePreview !== null) {
               setImagePreview(null);
           }
      } else {
           // Si estamos editando y hay imagen original, la mostramos
           console.log("   > Restaurando previsualización a imagen original del producto:", editingProduct.image_url);
           // Solo restaura si la preview actual no es ya la original
           if (imagePreview !== editingProduct.image_url) {
               setImagePreview(editingProduct.image_url);
           }
      }
    }
     // --- DEBUG --- Fin del Efecto de Previsualización
     console.log("--- useEffect[imageFile]: FIN ---");
  }, [imageFile, editingProduct, setValue, imagePreview]); // Añadido imagePreview a dependencias

  // Abrir modal (con useCallback)
  const handleOpenModal = useCallback((product = null) => {
    // --- DEBUG --- Abrir Modal
    console.log('--- handleOpenModal: Abriendo modal ---', product ? `Editando ID: ${product.id}` : 'Nuevo producto');
    // Resetea a los valores por defecto definidos en useForm
    reset();
    setEditingProduct(product);

    if (product) {
      console.log('   > Estableciendo valores del formulario desde producto:', product);
      // Itera sobre el producto y usa setValue
      Object.entries(product).forEach(([key, value]) => {
         if (key !== 'image') { // No establecer 'image' (FileList)
            try {
                // Usa los defaultValues de useForm como referencia para saber qué campos existen
                if (key in reset().defaultValues) { // <-- Corrección: Llama a reset() para obtener defaultValues
                     setValue(key, value, { shouldValidate: true, shouldDirty: false });
                } else {
                     console.warn(`handleOpenModal: Clave "${key}" del producto no encontrada en defaultValues de useForm.`);
                }
            } catch (e) {
                console.warn(`handleOpenModal: Error estableciendo valor para clave "${key}":`, e);
            }
         }
      });
      // Establece la previsualización inicial después de poner los valores
      setImagePreview(product.image_url || null);
       // Asegura que el campo 'image' (FileList) esté vacío al editar
      setValue('image', null);
    } else {
        // Para nuevo producto, asegúrate de que todo esté limpio (reset ya lo hace)
        setImagePreview(null);
        setValue('id', null);
        setValue('image', null);
        setValue('image_url', null); // Asegura que image_url sea null
    }
    setIsModalOpen(true);
  }, [reset, setValue]); // Dependencias: reset, setValue

  // Cerrar modal (con useCallback)
  const handleCloseModal = useCallback(() => {
    // --- DEBUG --- Cerrar Modal
    console.log('--- handleCloseModal: Cerrando modal ---');
    setIsModalOpen(false);
    setEditingProduct(null);
    reset(); // Resetea el formulario al cerrar
    setImagePreview(null); // Limpia previsualización
    if (fileInputRef.current) {
      console.log('   > Limpiando valor del input de archivo.');
      fileInputRef.current.value = ''; // Limpia el input del DOM
    }
  }, [reset]); // Dependencia: reset

  // Enviar formulario (Guardar/Actualizar)
  const onSubmit = async (data) => {
    // --- DEBUG --- Inicio de Submit
    console.log('--- onSubmit: INICIO ---');
    console.log('   > Datos recibidos del formulario:', data);
    setIsSubmitting(true);
    let finalImageUrl = editingProduct?.image_url || ""; // URL existente o vacía

    try {
      // Verifica si se seleccionó un nuevo archivo
      const newImageFile = data.image && data.image.length > 0 ? data.image[0] : null;

      if (newImageFile) {
        // --- DEBUG --- Subiendo Imagen
        console.log("   > Nuevo archivo detectado. Subiendo a Firebase:", newImageFile);
        const uploadedUrl = await uploadImage(newImageFile, "productos"); // Llama a tu función
        // --- DEBUG --- Resultado de Subida
        console.log("   > URL de Firebase:", uploadedUrl);
        if (!uploadedUrl) {
          throw new Error("La subida a Firebase falló, no se recibió URL.");
        }
        finalImageUrl = uploadedUrl; // Actualiza con la nueva URL
      } else {
        // --- DEBUG --- Sin Nueva Imagen
        console.log("   > No se seleccionó archivo nuevo.");
        // Verifica si el usuario quitó explícitamente la imagen
        // Usamos el valor del form 'data.image_url' que handleRemoveImage pudo haber puesto a null
        if (data.image_url === null) {
             console.log("   > Imagen explícitamente eliminada por el usuario (image_url es null en form). Usando null.");
             finalImageUrl = null;
        } else {
             console.log("   > Manteniendo URL previa/existente:", finalImageUrl);
        }
      }

      // Prepara el payload para la API Backend
      const body = {
        ...data, // Incluye todos los campos del formulario
        image_url: finalImageUrl, // Envía la URL correcta (puede ser null si se quitó)
        image: undefined // IMPORTANTE: No enviar el objeto FileList
      };
      // Elimina campos que no quieras enviar (ej. 'id' al crear)
      if (!editingProduct) {
          delete body.id;
      }
      // Elimina 'image' del body por si acaso (aunque ya es undefined)
      delete body.image;

      // --- DEBUG --- Payload enviado a la API
      console.log('   > Payload para la API:', body);

      let response;
      if (editingProduct) {
        // --- DEBUG --- Llamando API PUT
        console.log(`   > Llamando PUT /api/admin/products/${editingProduct.id}`);
        response = await apiClient.put(`/api/admin/products/${editingProduct.id}`, body);
      } else {
        // --- DEBUG --- Llamando API POST
        console.log(`   > Llamando POST /api/admin/products`);
        response = await apiClient.post('/api/admin/products', body);
      }

      // --- DEBUG --- Respuesta de la API
      console.log('   > Respuesta API:', response.data);

      setSnackbar({ open: true, message: `Producto ${editingProduct ? 'actualizado' : 'creado'} con éxito.`, severity: 'success' });
      await loadProducts(); // Recarga la lista
      handleCloseModal();
    } catch (error) {
      // --- DEBUG --- Error en Submit
      console.error("--- onSubmit: ERROR ---", error.response?.data || error);
      const errorMessage = error.response?.data?.detail || error.message || 'Error desconocido al guardar.';
      setSnackbar({ open: true, message: `Error: ${errorMessage}`, severity: 'error' });
    } finally {
      // --- DEBUG --- Fin de Submit
      console.log('--- onSubmit: FIN ---');
      setIsSubmitting(false);
    }
  };

  // Eliminar producto (con useCallback)
  const handleDelete = useCallback(async (id) => {
    // --- DEBUG --- Inicio de Borrado
    console.log(`--- handleDelete: Intentando borrar producto ID: ${id} ---`);
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      setLoading(true);
      try {
        // --- DEBUG --- Llamando API DELETE
        console.log(`   > Llamando DELETE /api/admin/products/${id}`);
        await apiClient.delete(`/api/admin/products/${id}`);
        // --- DEBUG --- Borrado Exitoso
        console.log(`   > Producto ID: ${id} eliminado.`);
        setSnackbar({ open: true, message: 'Producto eliminado.', severity: 'warning' });
        await loadProducts(); // Recarga la lista
      } catch (error) {
        // --- DEBUG --- Error en Borrado
        console.error(`--- handleDelete: Error borrando ID: ${id} ---`, error.response?.data?.detail || error.message);
        setSnackbar({ open: true, message: `Error al eliminar: ${error.message}`, severity: 'error' });
      } finally {
        // --- DEBUG --- Fin de Borrado
        console.log(`--- handleDelete: Finalizado para ID: ${id} ---`);
        setLoading(false);
      }
    } else {
      // --- DEBUG --- Borrado Cancelado
      console.log(`--- handleDelete: Borrado cancelado para ID: ${id} ---`);
    }
  }, [loadProducts]); // Dependencia: loadProducts

  // Quitar imagen seleccionada/previsualizada (con useCallback)
  const handleRemoveImage = useCallback(() => {
    // --- DEBUG --- Quitar Imagen
    console.log('--- handleRemoveImage: Quitando imagen ---');
    setImagePreview(null);
    setValue('image', null, { shouldDirty: true }); // Limpia FileList de RHF
    if (fileInputRef.current) {
      console.log('   > Limpiando valor del input de archivo.');
      fileInputRef.current.value = ''; // Limpia input del DOM
    }
    // Establece image_url a null en el form para señalar eliminación al guardar
    console.log('   > Estableciendo image_url a null en el estado del form.');
    setValue('image_url', null, { shouldDirty: true }); // Señala eliminación
  }, [setValue]); // Dependencia: setValue (quitamos editingProduct, ya no es necesario aquí)

  // Definición de columnas con useMemo para optimización
  const columns = React.useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'image_url',
      headerName: 'Imagen',
      width: 100,
      renderCell: (params) => (
        <CardMedia
          component="img"
          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '4px' }}
          image={params.value || 'https://via.placeholder.com/60?text=No+Img'} // Placeholder URL ajustada
          alt="Imagen Producto"
          onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/60?text=Error'; console.warn(`Fallo al cargar imagen: ${params.value}`) }}
        />
      ),
      sortable: false, filterable: false,
    },
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 150 },
    { field: 'brand', headerName: 'Marca', width: 130 },
    {
      field: 'price',
      headerName: 'Precio ($)',
      type: 'number',
      width: 110,
      // ✅ CORRECCIÓN toFixed APLICADA AQUÍ: Verifica si es número válido
      valueFormatter: ({ value }) => { // Destructura para obtener value
        if (typeof value === 'number' && !isNaN(value)) { // Añade chequeo isNaN
          return `$${value.toFixed(2)}`;
        }
        return '$ --'; // Valor por defecto si no es número válido
      }
    },
    { field: 'stock', headerName: 'Stock', type: 'number', width: 90 },
    { field: 'category', headerName: 'Categoría', width: 140 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => ( // No necesita useCallback aquí si las funciones de fuera lo usan
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton aria-label="Editar" color="primary" size="small" onClick={() => handleOpenModal(params.row)}><Edit fontSize="small" /></IconButton>
          <IconButton aria-label="Eliminar" color="error" size="small" onClick={() => handleDelete(params.row.id)}><Delete fontSize="small" /></IconButton>
        </Box>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [handleDelete, handleOpenModal]); // Dependencias para useMemo

  // --- DEBUG --- Log Estado de Carga
  console.log(`--- Renderizando ProductsPage, estado loading: ${loading} ---`);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando productos...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}> {/* Padding responsivo */}
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>Gestión de Productos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
          Añadir Producto
        </Button>
      </Box>

      {/* Tabla */}
      <Box sx={{ height: '70vh', width: '100%', backgroundColor: 'white', borderRadius: 1, boxShadow: 1 }}>
        <DataGrid
          rows={products}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          checkboxSelection
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          onError={(error) => console.error('--- Error DataGrid ---', error)}
          sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' } }}
        />
      </Box>

      {/* --- MODAL --- */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md" aria-labelledby="product-dialog-title">
        <DialogTitle id="product-dialog-title">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        {/* --- DEBUG --- Log de estado del form dentro del modal */}
        {isModalOpen && console.log('--- Modal Abierto, Errores RHF:', errors, `Sucio: ${isDirty}, Válido: ${isValid}`)}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}> {/* Padding responsivo */}
            <Grid container spacing={3}>
              {/* Columna Imagen */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom component="h3">Imagen</Typography>
                <Card sx={{ width: '100%', aspectRatio: '1 / 1', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, position: 'relative', overflow: 'hidden', backgroundColor: '#f0f0f0', border: errors.image ? '1px solid red' : 'none' }}> {/* Resaltar error */}
                  {imagePreview ? (
                    <>
                      <CardMedia component="img" image={imagePreview} alt="Previsualización" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      <IconButton aria-label="Quitar imagen" onClick={handleRemoveImage} sx={{ position: 'absolute', top: 8, right: 8, color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', '&:hover': {backgroundColor: 'rgba(0,0,0,0.8)'} }} size="small">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <ImageIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
                  )}
                </Card>
                <Button variant="outlined" component="label" fullWidth startIcon={<ImageIcon />}>
                  {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
                  <input
                    id="image-upload-input"
                    type="file"
                    hidden
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    // --- DEBUG --- onChange directo en input oculto
                    onChange={(e) => console.log('>>> Input onChange DIRECTO:', e.target.files)}
                    {...register('image')} // Registro RHF
                    ref={fileInputRef}
                    aria-label="Subir imagen de producto"
                  />
                </Button>
                 {errors.image && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>{errors.image.message || 'Error en archivo de imagen'}</Typography>}
              </Grid>
              {/* Columna Campos */}
              <Grid item xs={12} md={8}>
                <TextField
                  {...register('name', { required: 'El nombre es obligatorio' })}
                  label="Nombre del Producto *" fullWidth margin="dense"
                  error={!!errors.name} helperText={errors.name?.message}
                  required autoFocus={!editingProduct}
                />
                <TextField {...register('brand')} label="Marca" fullWidth margin="dense" />
                <TextField
                  {...register('description', { required: 'La descripción es obligatoria' })}
                  label="Descripción *" multiline rows={3} fullWidth margin="dense"
                  error={!!errors.description} helperText={errors.description?.message}
                  required
                 />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                        {...register('price', {
                            required: 'El precio es obligatorio', valueAsNumber: true,
                            min: { value: 0.01, message: 'Precio debe ser mayor a 0.' }
                        })}
                        label="Precio ($) *" type="number" fullWidth margin="dense"
                        error={!!errors.price} helperText={errors.price?.message}
                        InputProps={{ inputProps: { step: "0.01", min: "0.01" } }}
                        required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                        {...register('stock', {
                            required: 'El stock es obligatorio', valueAsNumber: true,
                            min: { value: 0, message: 'Stock no puede ser negativo.' },
                            validate: value => Number.isInteger(value) || 'Stock debe ser entero.'
                        })}
                        label="Stock *" type="number" fullWidth margin="dense"
                        error={!!errors.stock} helperText={errors.stock?.message}
                        InputProps={{ inputProps: { step: "1", min: "0" } }}
                        required
                        />
                    </Grid>
                </Grid>
                <TextField
                  {...register('category', { required: 'La categoría es obligatoria' })}
                  label="Categoría *" fullWidth margin="dense"
                  error={!!errors.category} helperText={errors.category?.message}
                  required
                />
                <TextField {...register('sku')} label="SKU" fullWidth margin="dense" helperText="Código único (opcional)"/>
                <TextField {...register('slug')} label="Slug (URL)" fullWidth margin="dense" helperText="Dejar vacío para autogenerar (recomendado)"/>
                {/* Checkbox opcionales - Descomentar si los necesitas */}
                {/*
                <FormControlLabel control={<Checkbox {...register('is_active')} defaultChecked={editingProduct ? editingProduct.is_active : true} />} label="Activo" sx={{mt: 1}}/>
                <FormControlLabel control={<Checkbox {...register('is_featured')} defaultChecked={editingProduct?.is_featured || false} />} label="Destacado" sx={{mt: 1}}/>
                */}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseModal} color="secondary">Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !isDirty || !isValid} // Deshabilita si no hay cambios o no es válido
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (editingProduct ? 'Actualizar Producto' : 'Crear Producto')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar para notificaciones */}
       <Snackbar
         open={snackbar.open}
         autoHideDuration={6000}
         onClose={() => setSnackbar({ ...snackbar, open: false })}
         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
       >
         <Alert
           onClose={() => setSnackbar({ ...snackbar, open: false })}
           severity={snackbar.severity} sx={{ width: '100%' }}
           variant="filled" // Hacerla más visible
         >
           {snackbar.message}
         </Alert>
       </Snackbar>
    </Box>
  );
}

export default ProductsPage;