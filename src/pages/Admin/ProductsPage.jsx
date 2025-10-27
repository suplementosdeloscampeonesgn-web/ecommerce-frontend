import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import apiClient from '../../api/apiClient';
import {
  Box, Button, CircularProgress, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert, Grid,
  Card, CardMedia, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useForm } from 'react-hook-form';
import { Add, Edit, Delete, Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material';
import { uploadImage } from '../../utils/uploadImageToFirebase'; // Verify this path

// --- DEBUG --- Component Render Log
console.log('--- ProductsPage Render ---');

function ProductsPage() {
  // --- DEBUG --- Initial Hook Call Log
  console.log('--- useForm initializing ---');
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty, isValid } } = useForm({
    mode: 'onChange' // Validate on change for better feedback
  });

  // --- DEBUG --- Watch Log
  const imageFile = watch('image');
  console.log('--- Watching image field, current value:', imageFile);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Use useCallback for functions passed to effects or event handlers
  const loadProducts = useCallback(async () => {
    // --- DEBUG --- Load Products Start
    console.log('--- loadProducts: Fetching products ---');
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/products');
      if (response.data && Array.isArray(response.data)) {
        // --- DEBUG --- Load Products Success
        console.log(`--- loadProducts: Success, received ${response.data.length} products ---`);
        setProducts(response.data);
      } else {
        console.error("--- loadProducts: API response is not a valid array:", response.data);
        setProducts([]);
        setSnackbar({ open: true, message: 'Error: La respuesta del servidor no es válida.', severity: 'error' });
      }
    } catch (error) {
      // --- DEBUG --- Load Products Error
      console.error("--- loadProducts: Error fetching products ---", error.response || error.message);
      setProducts([]);
      setSnackbar({ open: true, message: `Error de red al cargar productos: ${error.message}`, severity: 'error' });
    } finally {
      // --- DEBUG --- Load Products End
      console.log('--- loadProducts: Finished loading ---');
      setLoading(false);
    }
  }, []); // Empty dependency array as it doesn't depend on props/state

  useEffect(() => {
    // --- DEBUG --- Initial Load Effect
    console.log('--- useEffect[]: Initial loadProducts call ---');
    loadProducts();
  }, [loadProducts]); // Include loadProducts in dependency array

  // --- useEffect with MAX DEBUGGING for image preview ---
  useEffect(() => {
    // --- DEBUG --- Preview Effect Start
    console.log("--- useEffect[imageFile]: START ---");
    console.log("   > Current imageFile value:", imageFile);
    console.log("   > Current editingProduct:", editingProduct);
    console.log("   > Current imagePreview state:", imagePreview);

    if (imageFile && imageFile instanceof FileList && imageFile.length > 0) {
      const file = imageFile[0];
      // --- DEBUG --- File Detected
      console.log("   > File detected:", file);
      console.log(`   > File details: name=${file.name}, size=${file.size}, type=${file.type}`);

      // Basic validation
      if (!file.type.startsWith('image/')) {
        console.warn("   > Selected file is not an image type:", file.type);
        setSnackbar({ open: true, message: 'Por favor, selecciona un archivo de imagen válido.', severity: 'warning' });
        // Optionally reset the input if invalid type
        setValue('image', null); // Clear RHF state
        if(fileInputRef.current) fileInputRef.current.value = ''; // Clear DOM input
        setImagePreview(editingProduct?.image_url || null); // Revert preview
        return; // Stop processing
      }


      let currentPreviewUrl = null; // Store URL locally for cleanup verification
      try {
        currentPreviewUrl = URL.createObjectURL(file);
        // --- DEBUG --- Creating Blob URL
        console.log("   > Creating Blob URL:", currentPreviewUrl);
        setImagePreview(currentPreviewUrl); // Update state to show preview

        // Cleanup function for this specific URL
        return () => {
          // --- DEBUG --- Cleanup Function Triggered
          console.log(`--- useEffect[imageFile]: CLEANUP for ${currentPreviewUrl} ---`);
          // Check if the URL is still the one we created to avoid revoking prematurely
          // This check might be overly cautious but helps debugging complex scenarios
          // For simplicity, we'll just revoke it. In complex apps, you might need state checks.
          URL.revokeObjectURL(currentPreviewUrl);
          console.log(`   > Revoked Blob URL: ${currentPreviewUrl}`);
        };
      } catch (error) {
        // --- DEBUG --- Error Creating Blob URL
        console.error("   > Error creating Blob URL:", error);
        setImagePreview(null); // Reset preview on error
      }
    } else {
      // --- DEBUG --- No File or Empty FileList
      console.log("   > No valid file detected in imageFile.");
      // Logic to reset preview if no file or editing existing product
      if (!editingProduct?.image_url) {
           console.log("   > Setting preview to null (no existing image).");
           setImagePreview(null);
      } else {
           // If editing and there was a preview before (meaning user selected then removed file)
           // or if the initial state had no file, ensure the original image is shown.
           console.log("   > Setting preview back to original product image:", editingProduct.image_url);
           setImagePreview(editingProduct.image_url);
      }
    }
     // --- DEBUG --- Preview Effect End
     console.log("--- useEffect[imageFile]: END ---");
  }, [imageFile, editingProduct, setValue]); // Added setValue to dependencies

  const handleOpenModal = useCallback((product = null) => {
    // --- DEBUG --- Open Modal
    console.log('--- handleOpenModal: Opening modal ---', product ? `Editing product ID: ${product.id}` : 'Adding new product');
    reset(); // Reset form state first
    setImagePreview(product?.image_url || null); // Set initial preview *after* reset
    setEditingProduct(product);

    if (product) {
      console.log('   > Setting form values from product:', product);
      Object.keys(product).forEach(key => {
        // Ensure we don't try to set the file input value directly
        if (key !== 'image') {
          setValue(key, product[key]);
        }
      });
      // Explicitly ensure 'image' field is null initially when editing if needed
      setValue('image', null);
    } else {
      setValue('id', null);
      setValue('image', null); // Ensure null for new product
    }
    setIsModalOpen(true);
  }, [reset, setValue]); // Added dependencies

  const handleCloseModal = useCallback(() => {
    // --- DEBUG --- Close Modal
    console.log('--- handleCloseModal: Closing modal ---');
    setIsModalOpen(false);
    setEditingProduct(null);
    reset(); // Reset form after closing
    setImagePreview(null); // Clear preview
    if (fileInputRef.current) {
      console.log('   > Clearing file input ref value.');
      fileInputRef.current.value = '';
    }
  }, [reset]); // Added dependency

  const onSubmit = async (data) => {
    // --- DEBUG --- Submit Start
    console.log('--- onSubmit: START ---');
    console.log('   > Form Data Received:', data);
    setIsSubmitting(true);
    let finalImageUrl = editingProduct?.image_url || ""; // Start with existing or empty

    try {
      // Check if a new image file *was actually selected*
      const newImageFile = data.image && data.image.length > 0 ? data.image[0] : null;

      if (newImageFile) {
        // --- DEBUG --- Uploading Image
        console.log("   > New image file detected. Uploading to Firebase:", newImageFile);
        const uploadedUrl = await uploadImage(newImageFile, "productos");
        // --- DEBUG --- Upload Result
        console.log("   > Firebase Upload URL:", uploadedUrl);
        if (!uploadedUrl) {
          throw new Error("La subida de imagen a Firebase falló, no se obtuvo URL.");
        }
        finalImageUrl = uploadedUrl;
      } else {
        // --- DEBUG --- No New Image
        console.log("   > No new image file selected, using existing/previous URL:", finalImageUrl);
        // If user explicitly removed image (handleRemoveImage sets image_url to null in form)
        // Check if data.image_url is explicitly set to null/empty by handleRemoveImage logic
        if (data.image_url === null || data.image_url === '') {
             console.log("   > Image explicitly removed by user.");
             finalImageUrl = data.image_url; // Use the explicitly cleared value
        }
      }

      // Prepare payload for backend
      const body = {
        ...data, // Include all form fields
        image_url: finalImageUrl, // Send the correct image URL
        image: undefined // CRITICAL: Do NOT send the FileList object
      };

      // --- DEBUG --- Data being sent to API
      console.log('   > Payload for API:', body);

      let response;
      if (editingProduct) {
        // --- DEBUG --- Calling PUT API
        console.log(`   > Calling PUT /api/admin/products/${editingProduct.id}`);
        response = await apiClient.put(`/api/admin/products/${editingProduct.id}`, body);
      } else {
        // --- DEBUG --- Calling POST API
        console.log(`   > Calling POST /api/admin/products`);
        response = await apiClient.post('/api/admin/products', body);
      }

      // --- DEBUG --- API Response
      console.log('   > API Response:', response.data);

      setSnackbar({ open: true, message: `Producto ${editingProduct ? 'actualizado' : 'creado'} con éxito.`, severity: 'success' });
      await loadProducts();
      handleCloseModal();
    } catch (error) {
      // --- DEBUG --- Submit Error
      console.error("--- onSubmit: ERROR ---", error.response?.data || error.message);
      const errorMessage = error.response?.data?.detail || error.message || 'Error desconocido al guardar el producto.';
      setSnackbar({ open: true, message: `Error: ${errorMessage}`, severity: 'error' });
    } finally {
      // --- DEBUG --- Submit End
      console.log('--- onSubmit: END ---');
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    // --- DEBUG --- Delete Start
    console.log(`--- handleDelete: Attempting to delete product ID: ${id} ---`);
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      // Consider using a specific loading state like `isDeleting` instead of generic `loading`
      setLoading(true);
      try {
        // --- DEBUG --- Calling DELETE API
        console.log(`   > Calling DELETE /api/admin/products/${id}`);
        await apiClient.delete(`/api/admin/products/${id}`);
        // --- DEBUG --- Delete Success
        console.log(`   > Product ID: ${id} deleted successfully.`);
        setSnackbar({ open: true, message: 'Producto eliminado con éxito.', severity: 'warning' });
        await loadProducts();
      } catch (error) {
        // --- DEBUG --- Delete Error
        console.error(`--- handleDelete: Error deleting product ID: ${id} ---`, error.response || error.message);
        setSnackbar({ open: true, message: `Error al eliminar: ${error.message}`, severity: 'error' });
      } finally {
        // --- DEBUG --- Delete End
        console.log(`--- handleDelete: Finished for product ID: ${id} ---`);
        setLoading(false);
      }
    } else {
      // --- DEBUG --- Delete Cancelled
      console.log(`--- handleDelete: Deletion cancelled for product ID: ${id} ---`);
    }
  }, [loadProducts]); // Added dependency

  const handleRemoveImage = useCallback(() => {
    // --- DEBUG --- Remove Image
    console.log('--- handleRemoveImage: Removing selected/previewed image ---');
    setImagePreview(null);
    setValue('image', null, { shouldDirty: true }); // Clear RHF file state, mark form as dirty
    if (fileInputRef.current) {
      console.log('   > Clearing file input ref value.');
      fileInputRef.current.value = ''; // Clear DOM input
    }
    // Decide what happens to the existing image_url when editing
    // Option 1: Set it to null in the form, signalling removal on save
    if (editingProduct) {
        console.log('   > Setting image_url to null in form state for editing product.');
        setValue('image_url', null, { shouldDirty: true }); // Signal removal
    }
    // Option 2: Keep the original editingProduct.image_url and just clear the preview
    // (If you choose option 2, remove the setValue('image_url', null) line)
  }, [setValue, editingProduct]); // Added dependencies

  // Define columns outside render, memoize if performance becomes issue
  const columns = [
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
          alt="Imagen del Producto"
          // --- DEBUG --- Add error handler for broken image URLs
          onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/60?text=Error'; console.warn(`Failed to load image: ${params.value}`) }}
        />
      ),
      sortable: false, filterable: false,
    },
    { field: 'name', headerName: 'Nombre', width: 200 },
    // Removed description for brevity in grid, maybe add tooltip?
    // { field: 'description', headerName: 'Descripción', width: 300 },
    { field: 'brand', headerName: 'Marca', width: 150 }, // Added Brand column
    { field: 'price', headerName: 'Precio ($)', type: 'number', width: 120, valueFormatter: (params) => `$${params.value.toFixed(2)}` },
    { field: 'stock', headerName: 'Stock', type: 'number', width: 100 },
    { field: 'category', headerName: 'Categoría', width: 150 },
    {
      field: 'actions', headerName: 'Acciones', width: 150, sortable: false, filterable: false,
      renderCell: useCallback((params) => ( // Use useCallback here
        <Box>
          <IconButton aria-label="Editar" color="primary" onClick={() => handleOpenModal(params.row)}><Edit /></IconButton>
          <IconButton aria-label="Eliminar" color="error" onClick={() => handleDelete(params.row.id)}><Delete /></IconButton>
        </Box>
      ), [handleOpenModal, handleDelete]), // Add dependencies
    },
  ];

  // --- DEBUG --- Loading State Log
  console.log(`--- Rendering ProductsPage, loading state: ${loading} ---`);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando productos...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Gestión de Productos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
          Añadir Producto
        </Button>
      </Box>
      <Box sx={{ height: '70vh', width: '100%' }}>
        <DataGrid
          rows={products}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          checkboxSelection
          disableRowSelectionOnClick
          getRowId={(row) => row.id} // Ensure correct ID mapping
          // --- DEBUG --- Log DataGrid Errors
          onError={(error) => console.error('--- DataGrid Error ---', error)}
          // Optionally add density toggle, filtering etc.
        />
      </Box>
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md" aria-labelledby="product-dialog-title">
        <DialogTitle id="product-dialog-title">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        {/* --- DEBUG --- Log form state inside modal */}
        {isModalOpen && console.log('--- Modal Open, RHF errors:', errors, `isDirty: ${isDirty}, isValid: ${isValid}`)}
        <form onSubmit={handleSubmit(onSubmit)} noValidate> {/* Added noValidate */}
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
                <Button variant="outlined" component="label" fullWidth startIcon={<ImageIcon />}>
                  {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
                  <input
                    id="image-upload-input" // Added id for potential label association
                    type="file"
                    hidden
                    accept="image/png, image/jpeg, image/webp, image/gif" // Be more specific
                    // --- DEBUG --- Direct onChange on hidden input
                    onChange={(e) => console.log('>>> Input onChange DIRECTO:', e.target.files)}
                    {...register('image')} // Registering the file input
                    ref={fileInputRef}
                    aria-label="Subir imagen de producto" // Accessibility
                  />
                </Button>
                 {/* --- DEBUG --- Displaying file input error if any */}
                 {errors.image && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{errors.image.message || 'Error en archivo'}</Typography>}
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  {...register('name', { required: 'El nombre es obligatorio' })}
                  label="Nombre del Producto *" fullWidth margin="dense"
                  error={!!errors.name} helperText={errors.name?.message}
                  required
                  autoFocus={!editingProduct} // Focus name field for new products
                />
                <TextField {...register('brand')} label="Marca" fullWidth margin="dense" />
                <TextField
                  {...register('description', { required: 'La descripción es obligatoria' })}
                  label="Descripción *" multiline rows={3} fullWidth margin="dense"
                  error={!!errors.description} helperText={errors.description?.message}
                  required
                 />
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                        {...register('price', {
                            required: 'El precio es obligatorio',
                            valueAsNumber: true,
                            min: { value: 0.01, message: 'El precio debe ser mayor a 0.' }
                        })}
                        label="Precio ($) *" type="number" fullWidth margin="dense"
                        error={!!errors.price} helperText={errors.price?.message}
                        InputProps={{ inputProps: { step: "0.01", min: "0.01" } }} // HTML5 validation
                        required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                        {...register('stock', {
                            required: 'El stock es obligatorio',
                            valueAsNumber: true,
                            min: { value: 0, message: 'El stock no puede ser negativo.' },
                            validate: value => Number.isInteger(value) || 'El stock debe ser un número entero.' // Ensure integer
                        })}
                        label="Stock *" type="number" fullWidth margin="dense"
                        error={!!errors.stock} helperText={errors.stock?.message}
                        InputProps={{ inputProps: { step: "1", min: "0" } }} // HTML5 validation
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
                <TextField {...register('sku')} label="SKU" fullWidth margin="dense" helperText="Código único de producto"/>
                <TextField {...register('slug')} label="Slug (URL)" fullWidth margin="dense" helperText="Parte de la URL amigable. Dejar vacío para autogenerar."/>
                 {/* Optional: Add active/featured flags if needed in the form */}
                 {/* <FormControlLabel control={<Checkbox {...register('is_active')} defaultChecked />} label="Activo" /> */}
                 {/* <FormControlLabel control={<Checkbox {...register('is_featured')} />} label="Destacado" /> */}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !isDirty || !isValid} // Disable if submitting, form unchanged, or invalid
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
         {/* Wrap Alert in forwardRef for Snackbar */}
         <Alert
           onClose={() => setSnackbar({ ...snackbar, open: false })}
           severity={snackbar.severity} sx={{ width: '100%' }}
           variant="filled" // Use filled variant for better visibility
         >
           {snackbar.message}
         </Alert>
       </Snackbar>
    </Box>
  );
}

export default ProductsPage;