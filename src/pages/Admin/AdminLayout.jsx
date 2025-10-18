import { Link, Outlet } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, AppBar, Typography } from '@mui/material';

// Ancho definido para el menú lateral (puedes ajustarlo)
const drawerWidth = 240;

/**
 * Componente principal del layout para el panel de administración.
 * Proporciona una estructura persistente con una barra superior (AppBar)
 * y un menú lateral de navegación (Drawer).
 * El contenido de cada página de admin se renderiza a través del componente <Outlet>.
 */
function AdminLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Barra superior (Header) */}
      <AppBar 
        position="fixed" 
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Panel Administrativo
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Menú Lateral (Sidebar) */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {/* --- Enlaces de Navegación Corregidos --- */}
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/admin">
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/admin/products">
                <ListItemText primary="Productos" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/admin/orders">
                <ListItemText primary="Pedidos" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* --- Área de Contenido Principal --- */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {/* Aquí es donde React Router renderizará las páginas hijas (DashboardPage, ProductsPage, etc.) */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminLayout;