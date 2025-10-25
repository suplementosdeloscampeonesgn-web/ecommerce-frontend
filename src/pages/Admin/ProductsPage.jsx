import React, { useState, useEffect, useRef } from 'react';
// ✅ ESTE ARCHIVO YA ESTABA CORRECTO
import apiClient from '../../api/apiClient';
import { 
  Box, Button, CircularProgress, Typography, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Snackbar, Alert, Grid,
  Card, CardMedia, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useForm } from 'react-hook-form';
import { Add, Edit, Delete, Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material';
import { uploadImage } from '../../utils/uploadImageToFirebase'; // Asumiendo que esta ruta es correcta

function ProductsPage() {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const imageFile = watch('image'); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    } else {
      if (!editingProduct?.imageUrl) setImagePreview(null);
    }
  }, [imageFile, editingProduct]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Usamos apiClient. El endpoint público /api/products está bien para cargar
      const response = await apiClient.get('/api/products');
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        // Si la respuesta no es un array, puede que el endpoint admin devuelva un objeto
        // Asumimos que el admin endpoint es /api/admin/products
        const adminResponse = await apiClient.get('/api/admin/products');
        if (adminResponse.data && Array.isArray(adminResponse.data.products)) {
           setProducts(adminResponse.data.products);
        } else {
           console.error("La respuesta de la API no es un array válido:", adminResponse.data);
           setProducts([]);
           setSnackbar({ open: true, message: 'Error: La respuesta del servidor no es válida.', severity: 'error' });
        }
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProducts([]);
      setSnackbar({ open: true, message: 'Error de red al cargar los productos.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    reset();
    setImagePreview(null);
    setEditingProduct(product);

    if (product) {
      Object.keys(product).forEach(key => setValue(key, product[key]));
      if (product.imageUrl) setImagePreview(product.imageUrl);
    } else {
      setValue('id', null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    let imageUrl = editingProduct?.imageUrl || "";
    
    try {
      if (data.image && data.image.length > 0) {
        console.log("Subiendo nueva imagen a Firebase...");
        imageUrl = await uploadImage(data.image[0], "productos");
        console.log("URL de imagen obtenida:", imageUrl);
        if (!imageUrl) throw new Error("La subida de imagen falló, no se obtuvo URL.");
      }
      
      const body = {
        ...data,
        image_url: imageUrl, // Esta es la clave que espera el backend
        image: undefined // No enviar el 'file' object
      };

      if (editingProduct) {
        // Usamos la ruta de admin para editar
        await apiClient.put(`/api/admin/products/${editingProduct.id}`, body);
      } else {
        // Usamos la ruta de admin para crear
        await apiClient.post('/api/admin/products', body);
      }
      
      setSnackbar({ open: true, message: `Producto ${editingProduct ? 'actualizado' : 'creado'} con éxito.`, severity: 'success' });
      await loadProducts();
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al guardar el producto.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      setLoading(true);
      try {
        // Usamos la ruta de admin para eliminar
        await apiClient.delete(`/api/admin/products/${id}`);
        setSnackbar({ open: true, message: 'Producto eliminado con éxito.', severity: 'warning' });
        await loadProducts();
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        setSnackbar({ open: true, message: 'Error al eliminar el producto.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setValue('image', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (editingProduct) setValue('imageUrl', null);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'imageUrl', // ✅ Esto es correcto, coincide con el backend
      headerName: 'Imagen', 
      width: 100,
      renderCell: (params) => (
        <CardMedia
          component="img"
          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '4px' }}
          image={params.value || 'https://via.placeholder.com/60?text=No_Img'}
          alt="Imagen del Producto"
        />
      ),
      sortable: false, filterable: false,
    },
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'description', headerName: 'Descripción', width: 300 },
    { field: 'price', headerName: 'Precio ($)', type: 'number', width: 120 },
    { field: 'stock', headerName: 'Stock', type: 'number', width: 100 },
    { field: 'category', headerName: 'Categoría', width: 150 },
    {
      field: 'actions', headerName: 'Acciones', width: 150, sortable: false, filterable: false,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleOpenModal(params.row)}><Edit /></IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}><Delete /></IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Gestión de Productos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
          Añadir Producto
        </Button>
      </Box>
      <Box sx={{ height: '70vh', width: '100%' }}>
        <DataGrid
          rows={products}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>Imagen</Typography>
                <Card sx={{ maxWidth: 250, height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, position: 'relative' }}>
                  {imagePreview ? (
                    <>
                      <CardMedia component="img" image={imagePreview} alt="Previsualización" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      <IconButton onClick={handleRemoveImage} sx={{ position: 'absolute', top: 4, right: 4, color: 'white', backgroundColor: 'rgba(0,0,0,0.6)' }} size="small">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <ImageIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
                  )}
                </Card>
                <Button variant="outlined" component="label" fullWidth startIcon={<ImageIcon />}>
                  {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
                  <input type="file" hidden accept="image/*" {...register('image')} ref={fileInputRef} />
                </Button>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField {...register('name', { required: 'El nombre es obligatorio' })} label="Nombre del Producto" fullWidth margin="dense" error={!!errors.name} helperText={errors.name?.message} />
                <TextField {...register('description', { required: 'La descripción es obligatoria' })} label="Descripción" multiline rows={4} fullWidth margin="dense" error={!!errors.description} helperText={errors.description?.message} />
                <TextField {...register('price', { required: 'El precio es obligatorio', valueAsNumber: true, min: { value: 0.01, message: 'El precio debe ser mayor a 0.' } })} label="Precio ($)" type="number" fullWidth margin="dense" error={!!errors.price} helperText={errors.price?.message} inputProps={{ step: "0.01" }} />
                <TextField {...register('stock', { required: 'El stock es obligatorio', valueAsNumber: true, min: { value: 0, message: 'El stock no puede ser negativo.' } })} label="Stock" type="number" fullWidth margin="dense" error={!!errors.stock} helperText={errors.stock?.message} />
                <TextField {...register('category', { required: 'La categoría es obligatoria' })} label="Categoría" fullWidth margin="dense" error={!!errors.category} helperText={errors.category?.message} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProductsPage;