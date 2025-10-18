import React, { useState, useEffect } from 'react';
import { 
  Box, CircularProgress, Typography, Chip, Dialog, DialogTitle, 
  DialogContent, List, ListItem, ListItemText, Divider, Grid,
  Menu, MenuItem, Button, Snackbar, Alert, TextField, DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Visibility as ViewIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios'; // Se importa Axios para las llamadas reales a la API

// --- CONFIGURACIÓN DE LA API ---
// ✅ CORRECCIÓN: Se define la URL base de la API usando variables de entorno
const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/orders`;

// --- FUNCIONES DE API REALES ---
const fetchOrdersApi = async () => {
  const response = await axios.get(API_URL, {
    // Aquí puedes añadir headers de autorización si los necesitas
    // headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

const updateOrderStatusApi = async (orderId, newStatus) => {
  // El ID del pedido usualmente contiene caracteres que deben ser codificados en una URL
  const encodedOrderId = encodeURIComponent(orderId);
  const response = await axios.patch(`${API_URL}/${encodedOrderId}`, { status: newStatus });
  return response.data;
};


// --- DATOS Y CONFIGURACIÓN VISUAL ---
const statusOptions = ['Pendiente', 'Procesando', 'Enviado', 'Completado', 'Cancelado'];
const statusChipColor = {
  'Completado': 'success', 'Enviado': 'info', 'Procesando': 'primary', 
  'Pendiente': 'warning', 'Cancelado': 'error',
};


function OrdersPage() {
  // --- ESTADOS DEL COMPONENTE ---
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusMenu, setStatusMenu] = useState({ anchorEl: null, orderId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchText, setSearchText] = useState('');

  // --- EFECTOS ---
  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order => 
      (order.id?.toString().toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (order.customer?.name?.toLowerCase() || '').includes(searchText.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchText, orders]);

  // --- MANEJADORES DE LÓGICA ---
  const loadOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await fetchOrdersApi();
      setOrders(fetchedOrders);
      setFilteredOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setSnackbar({ open: true, message: 'Error al cargar los pedidos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => setSelectedOrder(order);
  const handleCloseDetails = () => setSelectedOrder(null);
  const handleStatusMenuOpen = (event, orderId) => setStatusMenu({ anchorEl: event.currentTarget, orderId });
  const handleStatusMenuClose = () => setStatusMenu({ anchorEl: null, orderId: null });

  const handleStatusUpdate = async (newStatus) => {
    const { orderId } = statusMenu;
    handleStatusMenuClose();
    try {
      await updateOrderStatusApi(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setSnackbar({ open: true, message: `Estado del pedido ${orderId} actualizado`, severity: 'success' });
    } catch (error) {
      console.error("Error updating order status:", error);
      setSnackbar({ open: true, message: 'Error al actualizar el estado', severity: 'error' });
    }
  };
  
  // El resto del componente (columnas y JSX) permanece igual...
  
  const columns = [
     { field: 'id', headerName: 'ID Pedido', width: 120 },
     { 
       field: 'customerName', 
       headerName: 'Cliente', 
       width: 200,
       valueGetter: (value, row) => row.customer?.name || ''
     },
     { 
       field: 'date', 
       headerName: 'Fecha', 
       width: 180, 
       type: 'dateTime',
       valueGetter: (value, row) => new Date(row.date) 
     },
     { 
       field: 'total', 
       headerName: 'Total', 
       width: 120, 
       type: 'number',
       renderCell: (params) => <Typography>{`$${params.value.toFixed(2)}`}</Typography>
     },
     {
       field: 'status',
       headerName: 'Estado',
       width: 150,
       renderCell: (params) => (
         <Chip 
           label={params.value} 
           color={statusChipColor[params.value] || 'default'} 
           size="small"
           onClick={(e) => handleStatusMenuOpen(e, params.row.id)}
           sx={{ cursor: 'pointer', textTransform: 'capitalize', fontWeight: 'bold' }}
         />
       ),
     },
     {
       field: 'actions',
       headerName: 'Acciones',
       sortable: false,
       filterable: false,
       width: 120,
       renderCell: (params) => (
         <Button startIcon={<ViewIcon />} onClick={() => handleViewDetails(params.row)} size="small">
           Detalles
         </Button>
       ),
     },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Gestión de Pedidos</Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar por ID o cliente..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.disabled' }} />,
          }}
        />
      </Box>

      <Box sx={{ height: '70vh', width: '100%' }}>
        <DataGrid
          rows={filteredOrders}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } }}}
          disableRowSelectionOnClick
        />
      </Box>

      <Menu anchorEl={statusMenu.anchorEl} open={Boolean(statusMenu.anchorEl)} onClose={handleStatusMenuClose}>
        {statusOptions.map((status) => (
          <MenuItem key={status} onClick={() => handleStatusUpdate(status)}>{status}</MenuItem>
        ))}
      </Menu>
      
      <Dialog open={Boolean(selectedOrder)} onClose={handleCloseDetails} fullWidth maxWidth="sm">
        {selectedOrder && (
          <>
            <DialogTitle>Detalles del Pedido: {selectedOrder.id}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">Información del Cliente</Typography>
                  <Typography><b>Nombre:</b> {selectedOrder.customer.name}</Typography>
                  <Typography><b>Email:</b> {selectedOrder.customer.email}</Typography>
                  <Typography><b>Dirección de Envío:</b> {selectedOrder.shippingAddress}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6">Productos en el Pedido</Typography>
                  <List dense>
                    {selectedOrder.products.map(p => (
                      <ListItem key={p.id}>
                        <ListItemText 
                          primary={`${p.name} (x${p.quantity})`}
                          secondary={`Precio unitario: $${p.price.toFixed(2)}`}
                        />
                        <Typography variant="body1"><b>${(p.quantity * p.price).toFixed(2)}</b></Typography>
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ textAlign: 'right', pr: 2 }}>
                    <Typography variant="h6">Total: ${selectedOrder.total.toFixed(2)}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default OrdersPage;