import React, { useState, useEffect } from 'react';
import { 
  Box, CircularProgress, Typography, Grid, Paper, List, ListItem, 
  ListItemText, ListItemAvatar, Avatar, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip 
} from '@mui/material';
import { 
  MonetizationOn, ShoppingCart, People, BarChart, Image as ImageIcon 
} from '@mui/icons-material';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// --- SIMULACIÓN DE DATOS DE API MÁS COMPLEJOS ---
// Nota: Dejaré los datos de prueba para que el componente siga funcionando visualmente.
const mockApiData = {
  stats: [
    { title: 'Ingresos (Mes)', value: '$12,450', Icon: MonetizationOn, color: 'success.main' },
    { title: 'Nuevos Pedidos', value: '34', Icon: ShoppingCart, color: 'info.main' },
    { title: 'Nuevos Clientes', value: '12', Icon: People, color: 'primary.main' },
    { title: 'Tasa de Conversión', value: '2.3%', Icon: BarChart, color: 'warning.main' },
  ],
  salesData: [
    { name: 'Hace 7 días', ventas: 320 }, { name: 'Hace 6 días', ventas: 450 },
    { name: 'Hace 5 días', ventas: 400 }, { name: 'Hace 4 días', ventas: 580 },
    { name: 'Hace 3 días', ventas: 520 }, { name: 'Ayer', ventas: 780 },
    { name: 'Hoy', ventas: 650 },
  ],
  topProducts: [
    { id: 1, name: 'Proteína Whey Gold', imageUrl: 'https://via.placeholder.com/40/FF0000/FFFFFF?text=P', sold: 152 },
    { id: 2, name: 'Creatina Monohidratada', imageUrl: 'https://via.placeholder.com/40/0000FF/FFFFFF?text=C', sold: 121 },
    { id: 3, name: 'BCAAs en Polvo', imageUrl: 'https://via.placeholder.com/40/00FF00/FFFFFF?text=B', sold: 98 },
  ],
  recentOrders: [
    { id: '#1256', customer: 'Juan Pérez', date: 'Oct 08, 2025', total: 84.98, status: 'Completado' },
    { id: '#1255', customer: 'Ana Gómez', date: 'Oct 08, 2025', total: 112.50, status: 'Enviado' },
    { id: '#1254', customer: 'Carlos Ruiz', date: 'Oct 07, 2025', total: 45.00, status: 'Pendiente' },
    { id: '#1253', customer: 'Sofía Lara', date: 'Oct 07, 2025', total: 24.99, status: 'Completado' },
  ]
};

// Componente reutilizable para las tarjetas de estadísticas
function StatCard({ title, value, Icon, color }) {
  return (
    <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
      <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 2 }}>
        <Icon sx={{ color: '#fff' }} />
      </Avatar>
      <Box>
        <Typography variant="h6" component="div">{value}</Typography>
        <Typography color="text.secondary">{title}</Typography>
      </Box>
    </Paper>
  );
}

// Componente para mapear el estado de un pedido a un color de Chip
const statusChipColor = {
  'Completado': 'success',
  'Enviado': 'info',
  'Pendiente': 'warning',
  'Cancelado': 'error',
};

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // ✅ CORRECCIÓN: La línea de la llamada a la API ahora está lista para producción.
      // Cuando quieras usar datos reales, descomenta las dos líneas de axios
      // y comenta o elimina las dos líneas de datos de prueba (mockApiData).
      
      // const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/dashboard`;
      // const response = await axios.get(API_URL);
      // setDashboardData(response.data);

      // --- Datos de prueba (eliminar al usar la API real) ---
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDashboardData(mockApiData);
      // ----------------------------------------------------

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Se añade una comprobación por si dashboardData sigue siendo nulo
  if (!dashboardData) {
    return <Typography>No se pudieron cargar los datos del dashboard.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Resumen del Negocio</Typography>
      
      <Grid container spacing={3}>
        {/* Fila de Tarjetas de Estadísticas */}
        {dashboardData.stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}

        {/* Gráfico de Ventas (Ocupa más espacio) */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" mb={2}>Tendencia de Ventas (Últimos 7 Días)</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={dashboardData.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ventas" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Productos más Vendidos */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" mb={2}>Productos Más Vendidos</Typography>
            <List>
              {dashboardData.topProducts.map(product => (
                <ListItem key={product.id}>
                  <ListItemAvatar>
                    <Avatar src={product.imageUrl}>
                      <ImageIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={product.name} 
                    secondary={`${product.sold} unidades vendidas`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Tabla de Pedidos Recientes */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Pedidos Recientes</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID Pedido</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell align="right">${order.total.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={order.status} 
                          color={statusChipColor[order.status] || 'default'} 
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;