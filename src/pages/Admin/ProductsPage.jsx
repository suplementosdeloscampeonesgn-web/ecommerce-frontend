import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../api/apiClient'; // Tu instancia de Axios configurada
import {
  Box, Button, CircularProgress, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert, Grid,
  Card, CardMedia, IconButton, FormControlLabel, Checkbox
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useForm } from 'react-hook-form';
import { Add, Edit, Delete, Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material';
import { uploadImage } from '../../utils/uploadImageToFirebase'; // Verifica esta ruta

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
  console.log('--- Observando campo \'image\', valor actual:', imageFile);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const loadProducts = useCallback(async () => {
    console.log('--- loadProducts: Obteniendo productos ---');
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/products');
      if (response.data && Array.isArray(response.data)) {
        console.log(`--- loadProducts: Éxito, ${response.data.length} productos recibidos ---`);
        setProducts(response.data);
      } else {
        console.error("--- loadProducts: La respuesta de la API no es un array válido:", response.data);
        setProducts([]);
        setSnackbar({ open: true, message: 'Error: Respuesta del servidor no válida.', severity: 'error' });
      }
    } catch (error) {
      console.error("--- loadProducts: Error obteniendo productos ---", error.response?.data?.detail || error.message);
      setProducts([]);
      setSnackbar({ open: true, message: `Error al cargar productos: ${error.message}`, severity: 'error' });
    } finally {
      console.log('--- loadProducts: Carga finalizada ---');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('--- useEffect[]: Llamada inicial a loadProducts ---');
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    console.log("--- useEffect[imageFile]: INICIO ---");
    console.log("   > Valor actual imageFile:", imageFile);
    console.log("   > Producto en edición:", editingProduct);
    console.log("   > Estado actual imagePreview:", imagePreview);

    if (imageFile && imageFile instanceof FileList && imageFile.length > 0) {
      const file = imageFile[0];
      console.log("   > Archivo detectado:", file);
      console.log(`   > Detalles: nombre=${file.name}, tamaño=${file.size}, tipo=${file.type}`);

      if (!file.type.startsWith('image/')) {
        console.warn("   > El archivo seleccionado no es de tipo imagen:", file.type);
        setSnackbar({ open: true, message: 'Por favor, selecciona un archivo de imagen (png, jpg, webp, gif).', severity: 'warning' });
        setValue('image', null);
        if(fileInputRef.current) fileInputRef.current.value = '';
        setImagePreview(editingProduct?.image_url || null);
        return;
      }

      let currentPreviewUrl = null;
      try {
        currentPreviewUrl = URL.createObjectURL(file);
        console.log("   > Creando URL Blob:", currentPreviewUrl);
        setImagePreview(currentPreviewUrl);

        return () => {
          console.log(`--- useEffect[imageFile]: LIMPIEZA para ${currentPreviewUrl} ---`);
          URL.revokeObjectURL(currentPreviewUrl);
          console.log(`   > URL Blob revocada: ${currentPreviewUrl}`);
        };
      } catch (error) {
        console.error("   > Error creando URL Blob:", error);
        setImagePreview(null);
      }
    } else {
      console.log("   > No se detectó archivo válido en imageFile.");
      if (!editingProduct?.image_url) {
           console.log("   > Estableciendo previsualización a null (no hay imagen existente).");
           setImagePreview(null);
      } else {
           console.log("   > Restaurando previsualización a imagen original del producto:", editingProduct.image_url);
           if (imagePreview !== editingProduct.image_url) {
               setImagePreview(editingProduct.image_url);
           }
      }
    }
     console.log("--- useEffect[imageFile]: FIN ---");
  }, [imageFile, editingProduct, setValue]);

  const handleOpenModal = useCallback((product = null) => {
    console.log('--- handleOpenModal: Abriendo modal ---', product ? `Editando ID: ${product.id}` : 'Nuevo producto');
    reset();
    setImagePreview(product?.image_url || null);
    setEditingProduct(product);

    if (product) {
      console.log('   > Estableciendo valores del formulario desde producto:', product);
      Object.entries(product).forEach(([key, value]) => {
         if (key !== 'image') {
            try {
                setValue(key, value, { shouldValidate: true, shouldDirty: false });
            } catch (e) {
                console.warn(`Error setting value for key "${key}":`, e);
            }
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
    console.log('--- handleCloseModal: Cerrando modal ---');
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
    setImagePreview(null);
    if (fileInputRef.current) {
      console.log('   > Limpiando valor del input de archivo.');
      fileInputRef.current.value = '';
    }
  }, [reset]);

  const onSubmit = async (data) => {
    console.log('--- onSubmit: INICIO ---');
    console.log('   > Datos recibidos del formulario:', data);
    setIsSubmitting(true);
    let finalImageUrl = editingProduct?.image_url || "";

    try {
      const newImageFile = data.image && data.image.length > 0 ? data.image[0] : null;

      if (newImageFile) {
        console.log("   > Nuevo archivo detectado. Subiendo a Firebase:", newImageFile);
        const uploadedUrl = await uploadImage(newImageFile, "productos");
        console.log("   > URL de Firebase:", uploadedUrl);
        if (!uploadedUrl) {
          throw new Error("La subida a Firebase falló, no se recibió URL.");
        }
        finalImageUrl = uploadedUrl;
      } else {
        console.log("   > No se seleccionó archivo nuevo. Usando URL previa/existente:", finalImageUrl);
        if (data.image_url === null || data.image_url === '') {
             console.log("   > Imagen explícitamente eliminada por el usuario.");
             finalImageUrl = data.image_url;
        }
      }

      const body = {
        ...data,
        image_url: finalImageUrl,
        image: undefined
      };
      if (!editingProduct) {
          delete body.id;
      }

      console.log('   > Payload para la API:', body);

      let response;
      if (editingProduct) {
        console.log(`   > Llamando PUT /api/admin/products/${editingProduct.id}`);
        response = await apiClient.put(`/api/admin/products/${editingProduct.id}`, body);
      } else {
        console.log(`   > Llamando POST /api/admin/products`);
        response = await apiClient.post('/api/admin/products', body);
      }

      console.log('   > Respuesta API:', response.data);

      setSnackbar({ open: true, message: `Producto ${editingProduct ? 'actualizado' : 'creado'} con éxito.`, severity: 'success' });
      await loadProducts();
      handleCloseModal();
    } catch (error) {
      console.error("--- onSubmit: ERROR ---", error.response?.data || error.message);
      const errorMessage = error.response?.data?.detail || error.message || 'Error desconocido al guardar.';
      setSnackbar({ open: true, message: `Error: ${errorMessage}`, severity: 'error' });
    } finally {
      console.log('--- onSubmit: FIN ---');
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    console.log(`--- handleDelete: Intentando borrar producto ID: ${id} ---`);
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      setLoading(true);
      try {
        console.log(`   > Llamando DELETE /api/admin/products/${id}`);
        await apiClient.delete(`/api/admin/products/${id}`);
        console.log(`   > Producto ID: ${id} eliminado.`);
        setSnackbar({ open: true, message: 'Producto eliminado.', severity: 'warning' });
        await loadProducts();
      } catch (error) {
        console.error(`--- handleDelete: Error borrando ID: ${id} ---`, error.response?.data?.detail || error.message);
        setSnackbar({ open: true, message: `Error al eliminar: ${error.message}`, severity: 'error' });
      } finally {
        console.log(`--- handleDelete: Finalizado para ID: ${id} ---`);
        setLoading(false);
      }
    } else {
      console.log(`--- handleDelete: Borrado cancelado para ID: ${id} ---`);
    }
  }, [loadProducts]);

  const handleRemoveImage = useCallback(() => {
    console.log('--- handleRemoveImage: Quitando imagen seleccionada/previsualizada ---');
    setImagePreview(null);
    setValue('image', null, { shouldDirty: true });
    if (fileInputRef.current) {
      console.log('   > Limpiando valor del input de archivo.');
      fileInputRef.current.value = '';
    }
    if (editingProduct) {
        console.log('   > Estableciendo image_url a null en el estado del form.');
        setValue('image_url', null, { shouldDirty: true });
    }
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
      valueFormatter: (value) => {
        if (typeof value === 'number') {
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
          onError={(error) => console.error('--- Error DataGrid ---', error)}
          sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' } }}
        />
      </Box>
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md" aria-labelledby="product-dialog-title">
        <DialogTitle id="product-dialog-title">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        {isModalOpen && console.log('--- Modal Abierto, Errores RHF:', errors, `Sucio: ${isDirty}, Válido: ${isValid}`)}
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
                {/* --- CAMBIO CRÍTICO: Input visible, nunca oculto, registra correctamente con RHF --- */}
                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  {...register('image')}
                  ref={fileInputRef}
                  style={{ display: "block", marginBottom: "12px" }}
                  onChange={e => console.log("onChange REAL imagen:", e.target.files)}
                  aria-label="Subir imagen de producto"
                />
                {errors.image &&
                  <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {errors.image.message || 'Error en archivo de imagen'}
                  </Typography>
                }
              </Grid>
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
