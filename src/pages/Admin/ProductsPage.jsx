import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient'; // Assuming this is your configured Axios instance
import {
  Box, Button, CircularProgress, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert, Grid,
  Card, CardMedia, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useForm } from 'react-hook-form';
import { Add, Edit, Delete, Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material';
import { uploadImage } from '../../utils/uploadImageToFirebase'; // Verify this path

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

  // --- useEffect with console.log for debugging image preview ---
  useEffect(() => {
    console.log("useEffect [imageFile] activado. Valor de imageFile:", imageFile); // DEBUG 1

    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      console.log("Archivo seleccionado:", file); // DEBUG 2

      try { // Added try...catch for safety
          const previewUrl = URL.createObjectURL(file);
          console.log("URL de previsualización creada:", previewUrl); // DEBUG 3
          setImagePreview(previewUrl);

          // Cleanup function
          return () => {
              console.log("Limpiando URL de previsualización:", previewUrl);
              URL.revokeObjectURL(previewUrl);
          };
      } catch (error) {
          console.error("Error al crear URL de previsualización:", error);
          setImagePreview(null); // Reset preview on error
      }

    } else {
      console.log("imageFile está vacío o nulo.");
      // Logic to reset preview if no file or editing existing product
      if (!editingProduct?.imageUrl) {
           console.log("Limpiando previsualización porque no hay archivo ni imagen existente.");
           setImagePreview(null);
      } else if (editingProduct?.imageUrl && !imagePreview) {
           // If editing and the preview was cleared (e.g., removed new image), restore original
           console.log("Restaurando previsualización a la imagen original del producto.");
           setImagePreview(editingProduct.imageUrl);
      }
    }
  }, [imageFile, editingProduct]); // Dependencies seem correct

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Use the admin endpoint to load products, assuming it requires auth
      const response = await apiClient.get('/api/admin/products');
      if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
      } else {
          console.error("La respuesta de la API admin no es un array válido:", response.data);
          setProducts([]);
          setSnackbar({ open: true, message: 'Error: La respuesta del servidor no es válida.', severity: 'error' });
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
    setImagePreview(null); // Clear preview when opening modal
    setEditingProduct(product);

    if (product) {
      Object.keys(product).forEach(key => setValue(key, product[key]));
      // Use image_url (lowercase) if that's what your backend provides
      if (product.image_url) setImagePreview(product.image_url);
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
    if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Use image_url from editingProduct if available, otherwise start empty
    let finalImageUrl = editingProduct?.image_url || "";

    try {
      // Check if a new image file was selected
      if (data.image && data.image.length > 0) {
        console.log("Subiendo nueva imagen a Firebase...");
        const uploadedUrl = await uploadImage(data.image[0], "productos"); // Call your upload function
        console.log("URL de imagen obtenida:", uploadedUrl);
        if (!uploadedUrl) throw new Error("La subida de imagen falló, no se obtuvo URL.");
        finalImageUrl = uploadedUrl; // Update the URL with the newly uploaded one
      }

      // Prepare data for the backend, ensuring image_url is correct
      const body = {
        ...data,
        image_url: finalImageUrl, // Use the final URL (new or existing)
        image: undefined // Remove the FileList object before sending
      };

      if (editingProduct) {
        // Use admin endpoint for updating
        await apiClient.put(`/api/admin/products/${editingProduct.id}`, body);
      } else {
        // Use admin endpoint for creating
        await apiClient.post('/api/admin/products', body);
      }

      setSnackbar({ open: true, message: `Producto ${editingProduct ? 'actualizado' : 'creado'} con éxito.`, severity: 'success' });
      await loadProducts(); // Reload products list
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
      setLoading(true); // Maybe use a different loading state like isDeleting?
      try {
        // Use admin endpoint for deleting
        await apiClient.delete(`/api/admin/products/${id}`);
        setSnackbar({ open: true, message: 'Producto eliminado con éxito.', severity: 'warning' });
        await loadProducts(); // Reload products list
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
    setValue('image', null); // Clear the file input in the form state
    if (fileInputRef.current) fileInputRef.current.value = ''; // Clear the actual file input element
    // If editing, clear the image_url field as well, maybe? Or keep original? Decide the logic.
    // Let's assume we want to signal removal by setting image_url to null or empty
    if (editingProduct) setValue('image_url', null);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'image_url', // Ensure this matches the field name from your API response
      headerName: 'Imagen',
      width: 100,
      renderCell: (params) => (
        <CardMedia
          component="img"
          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '4px' }}
          // Use a reliable placeholder URL
          image={params.value || 'https://via.placeholder.com/60?text=No+Img'}
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
          // Make sure getRowId is correct if your ID field is not 'id'
          // getRowId={(row) => row.id} 
        />
      </Box>
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>Imagen</Typography>
                <Card sx={{ maxWidth: 250, height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, position: 'relative', overflow: 'hidden' }}>
                  {imagePreview ? (
                    <>
                      <CardMedia component="img" image={imagePreview} alt="Previsualización" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      <IconButton onClick={handleRemoveImage} sx={{ position: 'absolute', top: 4, right: 4, color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', '&:hover': {backgroundColor: 'rgba(0,0,0,0.8)'} }} size="small">
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
                    type="file"
                    hidden
                    accept="image/*"
                    {...register('image')} // Registering the file input
                    ref={fileInputRef}
                  />
                </Button>
              </Grid>
              <Grid item xs={12} md={8}>
                {/* Ensure all fields expected by ProductCreate/ProductUpdate schema are registered */}
                <TextField {...register('name', { required: 'El nombre es obligatorio' })} label="Nombre del Producto" fullWidth margin="dense" error={!!errors.name} helperText={errors.name?.message} />
                <TextField {...register('brand')} label="Marca" fullWidth margin="dense" /> 
                <TextField {...register('description', { required: 'La descripción es obligatoria' })} label="Descripción" multiline rows={3} fullWidth margin="dense" error={!!errors.description} helperText={errors.description?.message} />
                <TextField {...register('price', { required: 'El precio es obligatorio', valueAsNumber: true, min: { value: 0.01, message: 'El precio debe ser mayor a 0.' } })} label="Precio ($)" type="number" fullWidth margin="dense" error={!!errors.price} helperText={errors.price?.message} inputProps={{ step: "0.01" }} />
                <TextField {...register('stock', { required: 'El stock es obligatorio', valueAsNumber: true, min: { value: 0, message: 'El stock no puede ser negativo.' } })} label="Stock" type="number" fullWidth margin="dense" error={!!errors.stock} helperText={errors.stock?.message} />
                <TextField {...register('category', { required: 'La categoría es obligatoria' })} label="Categoría" fullWidth margin="dense" error={!!errors.category} helperText={errors.category?.message} />
                <TextField {...register('sku')} label="SKU" fullWidth margin="dense" /> 
                <TextField {...register('slug')} label="Slug (URL)" fullWidth margin="dense" helperText="Dejar vacío para autogenerar"/> 
                {/* Hidden field for image_url if needed, usually handled in onSubmit */}
                {/* <input type="hidden" {...register('image_url')} /> */}
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