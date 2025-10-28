import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import {
  Box, Button, CircularProgress, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert, Grid,
  Card, CardMedia, IconButton, FormControlLabel, Checkbox
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useForm } from 'react-hook-form';
import { Add, Edit, Delete, Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material';
import { uploadImage } from '../../utils/uploadImageToFirebase';

console.log('--- Renderizando ProductsPage ---');

function ProductsPage() {
  console.log('--- Inicializando useForm ---');
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty, isValid } } = useForm({
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
        image: null,
        is_active: true,
        is_featured: false,
    }
  });

  const imageFile = watch('image');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
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

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    let file = null;
    if (imageFile) {
      if (imageFile instanceof FileList && imageFile.length > 0) file = imageFile[0];
      if (Array.isArray(imageFile) && imageFile.length > 0 && imageFile[0] instanceof File) file = imageFile[0];
    }
    if (file) {
      if (file.type.startsWith('image/')) {
        try {
          const url = URL.createObjectURL(file);
          setImagePreview(url);
          return () => URL.revokeObjectURL(url);
        } catch (err) {
          setSnackbar({ open: true, message: 'Error creando la vista previa: ' + err.message, severity: 'error' });
          setImagePreview(null);
        }
      } else {
        setSnackbar({ open: true, message: 'Selecciona archivo de imagen válido.', severity: 'warning' });
        setImagePreview(null);
      }
    } else {
      if (editingProduct?.image_url) {
        setImagePreview(editingProduct.image_url);
      } else {
        setImagePreview(null);
      }
    }
  }, [imageFile, editingProduct]);

  const handleOpenModal = useCallback((product = null) => {
    reset();
    setImagePreview(product?.image_url || null);
    setEditingProduct(product);
    if (product) {
      Object.entries(product).forEach(([key, value]) => {
         if (key !== 'image') {
            try { setValue(key, value, { shouldValidate: true, shouldDirty: false }); } catch (e) {}
         }
      });
      setValue('image', null);
    } else {
        reset();
        setValue('id', null);
        setValue('image', null);
        setImagePreview(null);
    }
    setIsModalOpen(true);
  }, [reset, setValue]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    let finalImageUrl = editingProduct?.image_url || "";
    try {
      let newImageFile = (
        data.image && data.image.length > 0
        && (data.image[0] instanceof File)
          ? data.image[0]
          : null
      );
      if (newImageFile) {
        const uploadedUrl = await uploadImage(newImageFile); // Usa tu función conectada a /api/admin/upload-images
        if (!uploadedUrl) throw new Error("La subida de la imagen falló.");
        finalImageUrl = uploadedUrl;
      } else {
        if (data.image_url === null || data.image_url === '') {
          finalImageUrl = data.image_url;
        }
      }
      const body = {
        ...data,
        image_url: finalImageUrl,
        image: undefined
      };
      if (!editingProduct) delete body.id;
      let response;
      if (editingProduct) {
        response = await apiClient.put(`/api/admin/products/${editingProduct.id}`, body);
      } else {
        response = await apiClient.post('/api/admin/products', body);
      }
      setSnackbar({ open: true, message: `Producto ${editingProduct ? 'actualizado' : 'creado'} con éxito.`, severity: 'success' });
      await loadProducts();
      handleCloseModal();
    } catch (error) {
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setValue('image', null, { shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (editingProduct) setValue('image_url', null, { shouldDirty: true });
  }, [setValue, editingProduct]);

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
          image={params.value || 'https://via.placeholder.com/60?text=No+Img'}
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
      valueFormatter: (value) => {
        if (typeof value === 'number') return `$${value.toFixed(2)}`;
        return '$ --';
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
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton aria-label="Editar" color="primary" size="small" onClick={() => handleOpenModal(params.row)}><Edit fontSize="small" /></IconButton>
          <IconButton aria-label="Eliminar" color="error" size="small" onClick={() => handleDelete(params.row.id)}><Delete fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ], [handleDelete, handleOpenModal]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando productos...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>Gestión de Productos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
          Añadir Producto
        </Button>
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
                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  {...register('image')}
                  ref={fileInputRef}
                  style={{ display: "block", marginBottom: "12px" }}
                  aria-label="Subir imagen de producto"
                />
                {errors.image &&
                  <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {errors.image.message || 'Error en archivo de imagen'}
                  </Typography>
                }
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
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseModal} color="secondary">Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !isDirty || !isValid}
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
