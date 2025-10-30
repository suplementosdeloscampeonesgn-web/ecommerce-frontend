import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, AppBar, Typography, ListItemIcon, Avatar, IconButton, Menu, MenuItem, CssBaseline } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import PermMediaIcon from '@mui/icons-material/PermMedia'; // 👈 ¡NUEVO! Importa un icono para Media
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta según tu contexto real
import { useState } from 'react';

const drawerWidth = 240;

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  // Define los ítems del menú, incluyendo el nuevo
  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, route: "/admin" },
    { text: "Productos", icon: <InventoryIcon />, route: "/admin/products" },
    { text: "Pedidos", icon: <ShoppingCartIcon />, route: "/admin/orders" },
    { text: "Subir Imágenes", icon: <PermMediaIcon />, route: "/admin/media" }, // 👈 ¡NUEVO! Añade el cargador de imágenes
  ];

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirige al login después de cerrar sesión
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <CssBaseline />
      {/* Barra superior (Header) */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            Admin - Suplementos Campeones
          </Typography>
          {/* Menú de Usuario */}
          <IconButton onClick={handleAvatarClick} sx={{ ml: 2 }}>
            <Avatar src="/admin-avatar.png">{user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}</Avatar> {/* Letra inicial como fallback */}
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
            <MenuItem disabled sx={{ '&.Mui-disabled': { opacity: 1 } }}> {/* Para que no se vea deshabilitado */}
              <Typography variant="subtitle1" fontWeight="bold">{user?.name || user?.email}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize='small' />
              </ListItemIcon>
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Menú Lateral (Sidebar) */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.default', // O un color específico si prefieres
            borderRight: '1px solid #e0e0e0', // Borde sutil
            // pt: 2, // Quitar padding top si Toolbar ya da espacio
          },
        }}
      >
        <Toolbar /> {/* Espacio para que el contenido no quede debajo del AppBar */}
        <Box sx={{ overflow: 'auto', py: 2 }}> {/* Añadir padding vertical */}
          <List>
            {menuItems.map((item) => {
                const isActive = location.pathname === item.route || (item.route !== "/admin" && location.pathname.startsWith(item.route)); // Mejorar detección de ruta activa
                return (
                    <ListItem disablePadding key={item.text}>
                    <ListItemButton
                        component={Link}
                        to={item.route}
                        selected={isActive} // Usa la variable isActive
                        sx={{
                        borderRadius: 1.5, // Bordes redondeados
                        mx: 1.5, // Margen horizontal
                        mb: 0.5, // Margen inferior
                        py: 1.2, // Padding vertical ajustado
                        // Estilos condicionales para el ítem activo
                        color: isActive ? 'primary.main' : 'text.secondary',
                        backgroundColor: isActive ? (theme) => theme.palette.action.selected : 'transparent', // Color de fondo activo
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.action.hover, // Color al pasar el mouse
                        },
                        // Estilos del texto e icono cuando está activo
                        '& .MuiListItemIcon-root': {
                            color: isActive ? 'primary.main' : 'text.disabled',
                            minWidth: '40px', // Espacio fijo para icono
                        },
                        '& .MuiListItemText-primary': {
                           fontWeight: isActive ? 600 : 400, // Texto en negrita si activo
                        },
                        }}
                    >
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItemButton>
                    </ListItem>
                );
             })}
          </List>
        </Box>
      </Drawer>

      {/* Área de Contenido Principal */}
      <Box component="main" sx={{
        flexGrow: 1,
        p: { xs: 2, sm: 3 }, // Padding responsivo
        minHeight: '100vh',
        backgroundColor: '#f4f6f8', // Fondo del área de contenido
      }}>
        <Toolbar /> {/* Otro Toolbar para empujar el contenido debajo del AppBar */}
        <Outlet /> {/* Aquí se renderizan las páginas de admin */}
      </Box>
    </Box>
  );
}

export default AdminLayout;