import React, { useState, useEffect, useRef, useCallback } from 'react';
// 👇 ****** ¡CORRECCIÓN AQUÍ! ****** 👇
import { apiClient } from '../../api/apiClient'; // Tu instancia de Axios configurada
// 👆 ****** ¡CORRECCIÓN AQUÍ! ****** 👆
import {
  Box, Button, CircularProgress, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert, Grid,
  Card, CardMedia, IconButton, FormControlLabel, Checkbox
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useForm } from 'react-hook-form';
import { Add, Edit, Delete, Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material';
// 👇 ****** ¡Y AQUÍ TAMBIÉN! ****** 👇
import { uploadImage } from '../../utils/uploadImageToFirebase'; // Asegúrate que esta ruta sea correcta

console.log('--- Renderizando ProductsPage ---');

function ProductsPage() {
  console.log('--- Inicializando useForm ---');
  const { register, handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = useForm({
    mode: 'onChange',
    defaultValues: {
        name: '',
        brand: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        sku: '',
        slug: '',
        image_url: null,
        // 'image' ya no es parte de defaultValues porque se maneja por estado
        is_active: true,
        is_featured: false,
    }
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // NUEVO: estado local para manejo correcto de archivo y preview
  const [imageFile, setImageFile] = useState(null); // <-- ¡Genial!
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // ---------- CARGA DE PRODUCTOS ----------
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Asegúrate que la ruta termine con '/' si así lo espera tu backend
      const response = await apiClient.get('/api/admin/products'); 
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
        setSnackbar({ open: true, message: 'Error: Respuesta del servidor no válida.', severity: 'error' });
      }
    } catch (error) {
      setProducts([]);
      setSnackbar({ open: true, message: `Error al cargar productos: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ----------- PREVIEW Y SELECCIÓN DE IMAGEN (TU LÓGICA NUEVA - ESTÁ BIEN) -----------
  useEffect(() => {
    // Este efecto maneja la preview basada en el estado imageFile O el producto editado
    let newPreviewUrl = null;
    if (imageFile) { // Prioridad 1: El nuevo archivo seleccionado
      try {
        newPreviewUrl = URL.createObjectURL(imageFile);
        setImagePreview(newPreviewUrl);
      } catch (err) {
        setSnackbar({ open: true, message: 'Error creando vista previa: ' + err.message, severity: 'error' });
        setImagePreview(null);
      }
    } else if (editingProduct?.image_url) { // Prioridad 2: La imagen del producto que se edita
      setImagePreview(editingProduct.image_url);
    } else { // Prioridad 3: Nada
      setImagePreview(null);
    }

    // Función de limpieza para la URL del Blob
    return () => {
      if (newPreviewUrl) {
        URL.revokeObjectURL(newPreviewUrl);
      }
    };
  }, [imageFile, editingProduct]); // Se ejecuta si cambia el archivo o el producto

  // ---------- ABRIR/CERRAR MODAL ----------
  const handleOpenModal = useCallback((product = null) => {
    reset(); // Resetea validaciones y valores de RHF
    setEditingProduct(product);
    setImageFile(null); // Limpia el estado del archivo
    
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Limpia el input de archivo
    }

    if (product) {
      // Llena el formulario con datos del producto
      Object.entries(product).forEach(([key, value]) => {
         // Asegúrate de que el campo exista en defaultValues
         if (key in reset().defaultValues) {
            setValue(key, value, { shouldValidate: true, shouldDirty: false });
         }
      });
      // Importante: Setea image_url en RHF también
      setValue('image_url', product.image_url || null);
      // El useEffect de preview se encargará de setear imagePreview
    } else {
      // Es un producto nuevo, resetea todo a los valores por defecto
      reset(); 
      setImagePreview(null);
    }
    setIsModalOpen(true);
  }, [reset, setValue]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
    setImageFile(null); // Limpia estado de archivo
    setImagePreview(null); // Limpia preview
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [reset]);

  // ---------- SUBMIT FORM ----------
  const onSubmit = async (data) => { // 'data' viene de RHF (todo menos la imagen)
    setIsSubmitting(true);
    // Inicia con la URL que está en el formulario (puede ser la original o null si se quitó)
    let finalImageUrl = data.image_url; 
    
    try {
      // Si hay un *nuevo* archivo en el estado 'imageFile', súbelo
      if (imageFile) { 
        console.log("Subiendo nuevo archivo:", imageFile.name);
        const uploadedUrl = await uploadImage(imageFile, "productos"); // Tu función de subida
        if (!uploadedUrl) throw new Error("La subida de la imagen falló.");
        finalImageUrl = uploadedUrl; // Reemplaza la URL
      } else {
        console.log("No hay archivo nuevo. Usando image_url del formulario:", finalImageUrl);
      }

      // Prepara el body: datos de RHF + la URL de imagen final
      const body = { ...data, image_url: finalImageUrl };

      if (!editingProduct) delete body.id; // Quita 'id' si es nuevo

      let response;
      if (editingProduct) {
        console.log("Actualizando producto:", body);
        response = await apiClient.put(`/api/admin/products/${editingProduct.id}`, body);
      } else {
        console.log("Creando producto:", body);
        response = await apiClient.post('/api/admin/products/', body); // Asegúrate que ruta POST termine en '/'
      }
      
      console.log("Respuesta API:", response.data);
      setSnackbar({ open: true, message: `Producto ${editingProduct ? 'actualizado' : 'creado'} con éxito.`, severity: 'success' });
      await loadProducts();
      handleCloseModal();
    } catch (error) {
      console.error("Error en onSubmit:", error.response?.data || error);
      setSnackbar({ open: true, message: `Error: ${error.response?.data?.detail || error.message}`, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- ELIMINAR PRODUCTO ----------
  const handleDelete = useCallback(async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      setLoading(true);
      try {
        await apiClient.delete(`/api/admin/products/${id}`);
        setSnackbar({ open: true, message: 'Producto eliminado.', severity: 'warning' });
        await loadProducts();
      } catch (error) {
        setSnackbar({ open: true, message: `Error al eliminar: ${error.message}`, severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  }, [loadProducts]);

  // ----------- REMOVER IMAGEN (TU LÓGICA NUEVA - ESTÁ BIEN) -----------
  const handleRemoveImage = useCallback(() => {
    console.log("Removiendo imagen...");
    setImagePreview(null);
    setImageFile(null); // Limpia el archivo del estado
    if (fileInputRef.current) fileInputRef.current.value = ''; // Limpia el input
    // Actualiza RHF para que 'image_url' sea null, marcando que se borró
    setValue('image_url', null, { shouldDirty: true }); 
  }, [setValue]); // Quita editingProduct, no es necesario

  // ---------- COLUMNS DATAGRID (CON CORRECCIÓN toFixed) ----------
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
          image={params.value || 'https://via.placeholder.com/60?text=No+Img'} // Placeholder
          alt="Imagen Producto"
          onError={e => { e.target.onerror = null; e.target.src='https://via.placeholder.com/60?text=Error'; }}
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
      // ✅ CORRECCIÓN toFixed (ya la tenías bien)
      valueFormatter: ({ value }) => {
        if (typeof value === 'number' && !isNaN(value)) {
          return `$${value.toFixed(2)}`;
        }
        return '$ --';
      }
    },
    { field: 'stock', headerName: 'Stock', type: 'number', width: 90 },
    { field: 'category', headerName: 'Categoría', width: 140 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 130, sortable: false, filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton aria-label="Editar" color="primary" size="small" onClick={() => handleOpenModal(params.row)}><Edit fontSize="small" /></IconButton>
          <IconButton aria-label="Eliminar" color="error" size="small" onClick={() => handleDelete(params.row.id)}><Delete fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ], [handleDelete, handleOpenModal]); // Dependencias correctas

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress /><Typography sx={{ ml: 2 }}>Cargando productos...</Typography>
      </Box>
    );
  }

  // ------------- RENDER -------------
  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>Gestión de Productos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>Añadir Producto</Button>
      </Box>
      <Box sx={{ height: '70vh', width: '100%', backgroundColor: 'white', borderRadius: 1, boxShadow: 1 }}>
        <DataGrid
          rows={products}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          checkboxSelection
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' } }}
        />
      </Box>
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md" aria-labelledby="product-dialog-title">
        <DialogTitle id="product-dialog-title">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom component="h3">Imagen</Typography>
                <Card sx={{ width: '100%', aspectRatio: '1 / 1', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, position: 'relative', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
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
                {/* Input de archivo visible (TU LÓGICA NUEVA - ESTÁ BIEN) */}
                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith("image/")) {
                      setImageFile(file); // Setea el estado
                      // El useEffect se encargará del preview
                    } else {
                      setImageFile(null); // Limpia si el archivo no es válido
                    }
                  }}
                  ref={fileInputRef}
                  style={{ display: "block", marginBottom: "12px" }}
                  aria-label="Subir imagen de producto"
                />
                 {/* Ya no necesitas {...register('image')} aquí */}
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField  {...register('name', { required: 'El nombre es obligatorio' })} label="Nombre del Producto *" fullWidth margin="dense"
                  error={!!errors.name} helperText={errors.name?.message} required autoFocus={!editingProduct} />
                <TextField {...register('brand')} label="Marca" fullWidth margin="dense" />
                <TextField {...register('description', { required: 'La descripción es obligatoria' })} label="Descripción *" multiline rows={3} fullWidth margin="dense" error={!!errors.description} helperText={errors.description?.message} required />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField {...register('price', { required: 'El precio es obligatorio', valueAsNumber: true, min: { value: 0.01, message: 'Precio debe ser mayor a 0.' } })}
                      label="Precio ($) *" type="number" fullWidth margin="dense" error={!!errors.price} helperText={errors.price?.message} InputProps={{ inputProps: { step: "0.01", min: "0.01" } }} required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField {...register('stock', { required: 'El stock es obligatorio', valueAsNumber: true, min: { value: 0, message: 'Stock no puede ser negativo.' }, validate: value => Number.isInteger(value) || 'Stock debe ser entero.' })}
                      label="Stock *" type="number" fullWidth margin="dense" error={!!errors.stock} helperText={errors.stock?.message} InputProps={{ inputProps: { step: "1", min: "0" } }} required />
                  </Grid>
                </Grid>
                <TextField {...register('category', { required: 'La categoría es obligatoria' })} label="Categoría *" fullWidth margin="dense" error={!!errors.category} helperText={errors.category?.message} required />
                <TextField {...register('sku')} label="SKU" fullWidth margin="dense" helperText="Código único (opcional)" />
                <TextField {...register('slug')} label="Slug (URL)" fullWidth margin="dense" helperText="Dejar vacío para autogenerar (recomendado)" />
                {/* Campo oculto para image_url (manejado por RHF) */}
                <input type="hidden" {...register('image_url')} />
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity} sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProductsPage;