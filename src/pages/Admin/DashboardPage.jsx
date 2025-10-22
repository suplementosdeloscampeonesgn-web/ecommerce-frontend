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
import axios from 'axios';

const statusChipColor = {
  'COMPLETADO': 'success',
  'ENVIADO': 'info',
  'PENDIENTE': 'warning',
  'CANCELADO': 'error',
};

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

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/dashboard`;
        const token = localStorage.getItem("access_token");
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData({
          ...response.data,
          stats: response.data.stats.map((stat, index) => ({
            ...stat,
            Icon: [MonetizationOn, ShoppingCart, People, BarChart][index] || MonetizationOn,
            color: ['success.main', 'info.main', 'primary.main', 'warning.main'][index] || 'success.main'
          })),
          topProducts: response.data.topProducts.map(p => ({
            ...p,
            imageUrl: `https://via.placeholder.com/40/${Math.random().toString(16).slice(2, 8)}/FFFFFF?text=${p.name[0] || "P"}`
          }))
        });
      } catch {
        setDashboardData(null);
      }
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

  if (!dashboardData) {
    return <Typography>No se pudieron cargar los datos del dashboard.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Resumen del Negocio</Typography>
      <Grid container spacing={3}>
        {/* Estadísticas */}
        {dashboardData.stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
        {/* Gráfica de ventas */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" mb={2}>Tendencia de Ventas (Últimos 7 Días)</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={dashboardData.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <Line type="monotone" dataKey="ventas" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }}/>
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Productos más vendidos */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" mb={2}>Productos Más Vendidos</Typography>
            <List>
              {dashboardData.topProducts.map(product => (
                <ListItem key={product.id}>
                  <ListItemAvatar>
                    <Avatar src={product.imageUrl}><ImageIcon/></Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={product.name} secondary={`${product.sold} unidades vendidas`}/>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        {/* Pedidos recientes */}
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
                          color={statusChipColor[order.status.toUpperCase()] || 'default'}
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
