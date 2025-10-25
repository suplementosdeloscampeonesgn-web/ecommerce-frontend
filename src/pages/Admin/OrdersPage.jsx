import React, { useState, useEffect } from 'react';
import { 
  Box, CircularProgress, Typography, Chip, Dialog, DialogTitle, 
  DialogContent, List, ListItem, ListItemText, Divider, Grid,
  Menu, MenuItem, Button, Snackbar, Alert, TextField, DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Visibility as ViewIcon, Search as SearchIcon } from '@mui/icons-material';
// ✅ CORREGIDO: Importamos tu 'apiClient'
import apiClient from '../../api/apiClient';

// ❌ CORREGIDO: Eliminamos 'axios' y las URLS_API manuales

// --- FUNCIONES DE API (Corregidas) ---
const fetchOrdersApi = async () => {
  // ✅ CORREGIDO: Usamos apiClient y la nueva ruta del admin.py
  const response = await apiClient.get('/api/admin/orders');
  return response.data;
};

const updateOrderStatusApi = async (orderId, newStatus) => {
  // ✅ CORREGIDO: Usamos apiClient.patch.
  // Esta ruta (del router público) debe estar protegida para admin en tu backend
  const response = await apiClient.patch(
    `/api/orders/${orderId}/status`, 
    { status: newStatus }
  );
  return response.data;
};

// --- (El resto de tu componente estaba perfecto) ---

const statusOptions = ['PENDING', 'PROCESANDO', 'ENVIADO', 'COMPLETADO', 'CANCELADO'];
const statusChipColor = {
  'COMPLETADO': 'success', 'ENVIADO': 'info', 'PROCESANDO': 'primary', 
  'PENDING': 'warning', 'CANCELADO': 'error',
};

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusMenu, setStatusMenu] = useState({ anchorEl: null, orderId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchText, setSearchText] = useState('');

  useEffect(() => { loadOrders(); }, []);
  useEffect(() => {
    const filtered = orders.filter(order => 
      (order.id?.toString().toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (order.user?.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (order.user?.email?.toLowerCase() || '').includes(searchText.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchText, orders]);

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

  const columns = [
    { field: 'id', headerName: 'ID Pedido', width: 100 },
    { 
      field: 'user', 
      headerName: 'Cliente', 
      width: 200,
      renderCell: (params) => (
        <span>
          {params.row.user?.name || "SIN NOMBRE"}<br />
          <small>{params.row.user?.email}</small>
        </span>
      )
    },
    { 
      field: 'created_at', 
      headerName: 'Fecha', 
      width: 180, 
      type: 'dateTime',
      valueGetter: (params) => new Date(params.value)
    },
    { 
      field: 'total_amount', 
      headerName: 'Total', 
      width: 110, 
      type: 'number',
      renderCell: (params) => <Typography>${Number(params.value).toFixed(2)}</Typography>
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 140,
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
          getRowId={row => row.id}
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
                  <Typography><b>Nombre:</b> {selectedOrder.user?.name}</Typography>
                  <Typography><b>Email:</b> {selectedOrder.user?.email}</Typography>
                  <Typography><b>Dirección de Envío:</b> {selectedOrder.shipping_address}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6">Productos en el Pedido</Typography>
                  <List dense>
                    {selectedOrder.items.map(item => (
                      <ListItem key={item.id}>
                        <ListItemText 
                          primary={`${item.product_name} (x${item.quantity})`}
                          secondary={`Precio unitario: $${item.product_price.toFixed(2)}`}
                        />
                        <Typography variant="body1"><b>${(item.quantity * item.product_price).toFixed(2)}</b></Typography>
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ textAlign: 'right', pr: 2 }}>
                    <Typography variant="h6">Total: ${selectedOrder.total_amount.toFixed(2)}</Typography>
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