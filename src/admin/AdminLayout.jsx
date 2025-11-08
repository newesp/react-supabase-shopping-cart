import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
} from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const menuItems = [
  { label: '使用者管理', path: '/admin/users' },
  { label: '商品管理', path: '/admin/products' },
  { label: '訂單管理', path: '/admin/orders' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" sx={{ width: 240 }}>
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.path} onClick={() => navigate(item.path)}>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ zIndex: 1201 }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">NullaShop 後台管理系統</Typography>
            <Button color="inherit" onClick={handleLogout}>
              登出
            </Button>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}