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
        image: null,
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
      if (!editingProduct?.image_url) {
           console.log("   > Estableciendo previsualización a null (no hay imagen existente).");
           setImagePreview(null);
      } else {
           // Si se edita y se quitó un archivo seleccionado, o estado inicial sin archivo, muestra la original
           console.log("   > Restaurando previsualización a imagen original del producto:", editingProduct.image_url);
           // Solo restaura si la preview actual no es ya la original (evita bucle)
           if (imagePreview !== editingProduct.image_url) {
               setImagePreview(editingProduct.image_url);
           }
      }
    }
     // --- DEBUG --- Fin del Efecto de Previsualización
     console.log("--- useEffect[imageFile]: FIN ---");
  }, [imageFile, editingProduct, setValue]); // Dependencias: imageFile, editingProduct, setValue

  // Abrir modal (con useCallback)
  const handleOpenModal = useCallback((product = null) => {
    // --- DEBUG --- Abrir Modal
    console.log('--- handleOpenModal: Abriendo modal ---', product ? `Editando ID: ${product.id}` : 'Nuevo producto');
    reset(); // Resetea estado del formulario ANTES de poner valores
    // Establece previsualización inicial (URL existente o null) DESPUÉS de reset
    setImagePreview(product?.image_url || null);
    setEditingProduct(product);

    if (product) {
      console.log('   > Estableciendo valores del formulario desde producto:', product);
      // Itera sobre el producto y usa setValue
      Object.entries(product).forEach(([key, value]) => {
         // Asegúrate de que el campo exista en tu useForm defaultValues o register
         // No intentes establecer 'image' (el FileList)
         if (key !== 'image') {
            try {
                setValue(key, value, { shouldValidate: true, shouldDirty: false }); // No marcar como sucio al inicio
            } catch (e) {
                console.warn(`Error setting value for key "${key}":`, e);
            }
         }
      });
      // Asegura que el campo 'image' esté vacío al editar
      setValue('image', null);
    } else {
        // Resetea a valores por defecto definidos en useForm para nuevo producto
        reset();
        setValue('id', null); // Asegura que id sea null
        setValue('image', null); // Asegura que imagen sea null
        setImagePreview(null); // Asegura que preview sea null
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
        console.log("   > No se seleccionó archivo nuevo. Usando URL previa/existente:", finalImageUrl);
        // Verifica si el usuario quitó explícitamente la imagen
        // (handleRemoveImage puede poner image_url = null en el estado del form 'data')
        if (data.image_url === null || data.image_url === '') {
             console.log("   > Imagen explícitamente eliminada por el usuario.");
             finalImageUrl = data.image_url; // Usa el valor vacío/nulo
        }
      }

      // Prepara el payload para la API Backend
      const body = {
        ...data, // Incluye todos los campos del formulario
        image_url: finalImageUrl, // Envía la URL correcta
        image: undefined // IMPORTANTE: No enviar el objeto FileList
      };
      // Elimina campos que no quieras enviar si es necesario (ej. si 'id' no debe ir en POST)
      if (!editingProduct) {
          delete body.id;
      }

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
      console.error("--- onSubmit: ERROR ---", error.response?.data || error.message);
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
      // Considera usar estado específico como `isDeleting`
      setLoading(true); // O un estado específico: setIsDeleting(id)
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
        setLoading(false); // O setIsDeleting(null)
      }
    } else {
      // --- DEBUG --- Borrado Cancelado
      console.log(`--- handleDelete: Borrado cancelado para ID: ${id} ---`);
    }
  }, [loadProducts]); // Dependencia: loadProducts

  // Quitar imagen seleccionada/previsualizada (con useCallback)
  const handleRemoveImage = useCallback(() => {
    // --- DEBUG --- Quitar Imagen
    console.log('--- handleRemoveImage: Quitando imagen seleccionada/previsualizada ---');
    setImagePreview(null);
    setValue('image', null, { shouldDirty: true }); // Limpia estado RHF, marca como sucio
    if (fileInputRef.current) {
      console.log('   > Limpiando valor del input de archivo.');
      fileInputRef.current.value = ''; // Limpia input del DOM
    }
    // Si se edita, establece image_url a null en el form para señalar eliminación al guardar
    if (editingProduct) {
        console.log('   > Estableciendo image_url a null en el estado del form.');
        setValue('image_url', null, { shouldDirty: true }); // Señala eliminación
    }
  }, [setValue, editingProduct]); // Dependencias: setValue, editingProduct

  // Definición de columnas (fuera del render, memoizar con useMemo si es necesario)
  const columns = React.useMemo(() => [ // Envuelto en useMemo
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
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 150 }, // Usa flex para adaptabilidad
    { field: 'brand', headerName: 'Marca', width: 130 },
    {
      field: 'price',
      headerName: 'Precio ($)',
      type: 'number',
      width: 110,
      // ✅ CORRECCIÓN toFixed: Verifica si es número antes de formatear
      valueFormatter: (value) => {
        if (typeof value === 'number') {
          return `$${value.toFixed(2)}`;
        }
        return '$ --'; // Valor por defecto si no es número
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
      // Usar useCallback dentro de useMemo para renderCell
      renderCell: (params) => (
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}> {/* Flex wrap */}
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>Gestión de Productos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
          Añadir Producto
        </Button>
      </Box>
      <Box sx={{ height: '70vh', width: '100%', backgroundColor: 'white', borderRadius: 1, boxShadow: 1 }}> {/* Mejor estilo tabla */}
        <DataGrid
          rows={products}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          checkboxSelection
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          onError={(error) => console.error('--- Error DataGrid ---', error)}
          // Estilos para mejorar visualización
          sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' } }}
        />
      </Box>

      {/* --- MODAL --- */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md" aria-labelledby="product-dialog-title">
        <DialogTitle id="product-dialog-title">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        {/* --- DEBUG --- Log de estado del form dentro del modal */}
        {isModalOpen && console.log('--- Modal Abierto, Errores RHF:', errors, `Sucio: ${isDirty}, Válido: ${isValid}`)}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Columna Imagen */}
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
                    id="image-upload-input"
                    type="file"
                    hidden
                    accept="image/png, image/jpeg, image/webp, image/gif" // Tipos específicos
                    // --- DEBUG --- onChange directo en input oculto
                    onChange={(e) => console.log('>>> Input onChange DIRECTO:', e.target.files)}
                    {...register('image')} // Registro RHF
                    ref={fileInputRef}
                    aria-label="Subir imagen de producto"
                  />
                </Button>
                 {/* Mensaje de error para imagen */}
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
                    <Grid item xs={12} sm={6}> {/* Grid responsivo */}
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
                    <Grid item xs={12} sm={6}> {/* Grid responsivo */}
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
                {/* Checkbox opcionales */}
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
           variant="filled"
         >
           {snackbar.message}
         </Alert>
       </Snackbar>
    </Box>
  );
}

export default ProductsPage;