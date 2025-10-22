import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, AppBar, Typography, ListItemIcon, Avatar, IconButton, Menu, MenuItem, CssBaseline } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta según tu contexto real
import { useState } from 'react';

const drawerWidth = 240;

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, route: "/admin" },
    { text: "Productos", icon: <InventoryIcon />, route: "/admin/products" },
    { text: "Pedidos", icon: <ShoppingCartIcon />, route: "/admin/orders" },
  ];

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    navigate('/login');
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
          <IconButton onClick={handleAvatarClick} sx={{ ml: 2 }}>
            <Avatar src="/admin-avatar.png">{user?.name?.[0] || "A"}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
            <MenuItem disabled>
              <Typography variant="subtitle1">{user?.name || user?.email}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize='small' sx={{ mr: 1 }} /> Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Menú Lateral (Sidebar) animado y con ruta activa */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.default',
            borderRight: '1px solid #e0e0e0',
            pt: 2,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', pt: 2 }}>
          <List>
            {menuItems.map((item, idx) => (
              <ListItem disablePadding key={item.text}>
                <ListItemButton 
                  component={Link}
                  to={item.route}
                  selected={location.pathname === item.route}
                  sx={{
                    borderRadius: 1.5,
                    mx: 1,
                    mb: 0.5,
                    color: location.pathname === item.route ? 'primary.main' : 'text.secondary',
                    bgcolor: location.pathname === item.route ? 'primary.100' : 'transparent',
                    '&:hover': { bgcolor: 'primary.50' },
                    fontWeight: location.pathname === item.route ? 700 : 400,
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.route ? 'primary.main' : 'text.disabled' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Área de Contenido Principal */}
      <Box component="main" sx={{
        flexGrow: 1, p: 3, minHeight: '100vh',
        backgroundColor: '#f4f6f8'
      }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminLayout;
