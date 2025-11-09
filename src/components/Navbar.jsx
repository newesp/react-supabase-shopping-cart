import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Button,
  TextField,
  InputAdornment,
  Box,
  Popover,
  Menu,
  MenuItem,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import CartDropdown from './CartDropdown';

const Navbar = ({ user, cartCount, onSearch, onLoginClick, onLogoutClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartAnchorEl, setCartAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const isLoggedIn = !!user;
  const isGoogleUser = user?.app_metadata?.provider === 'google';

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    '使用者';

  const handleSearch = () => {
    if (onSearch) onSearch(searchTerm.trim());
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const openSettings = (e) => setAnchorEl(e.currentTarget);
  const closeSettings = () => setAnchorEl(null);

  const handleCartClick = (e) => setCartAnchorEl(e.currentTarget);
  const handleCartClose = () => setCartAnchorEl(null);

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', pr: { xs: '100px', sm: '160px' } }}>
          <Button
            onClick={() => navigate('/')}
            sx={{ color: 'white', textTransform: 'none', fontSize: '1.25rem', mr: 2 }}
          >
            NullaShop
          </Button>

          <Box sx={{ flexGrow: 1, maxWidth: 400 }}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="搜尋商品名稱或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLoggedIn ? (
              <>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  歡迎，{displayName}
                </Typography>

                <IconButton
                  color="inherit"
                  onClick={openSettings}
                  aria-controls="nav-settings"
                  aria-haspopup="true"
                  aria-label="設定"
                >
                  <SettingsIcon />
                </IconButton>

                <Menu
                  id="nav-settings"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={closeSettings}
                  keepMounted
                >
                  <MenuItem onClick={() => { closeSettings(); navigate('/orders'); }}>我的訂單</MenuItem>
                  {!isGoogleUser && (
                    <MenuItem onClick={() => {
                      closeSettings();
                      navigate('/account/change-password');
                    }}>
                      修改密碼
                    </MenuItem>
                  )}
                  <MenuItem onClick={async () => {
                    closeSettings();
                    if (onLogoutClick) await onLogoutClick();
                  }}>
                    登出
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton color="inherit" onClick={onLoginClick} aria-label="登入" title="登入">
                <AccountCircle />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {!isAdminRoute && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: { xs: 10, sm: 10 },
              right: 16,
              zIndex: (theme) => theme.zIndex.tooltip,
            }}
          >
            <IconButton
              color="primary"
              onClick={handleCartClick}
              aria-label="購物車"
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 3,
                '&:hover': { bgcolor: 'background.paper' },
                width: 48,
                height: 48,
              }}
            >
              <Badge badgeContent={cartCount} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>

          <Popover
            open={Boolean(cartAnchorEl)}
            anchorEl={cartAnchorEl}
            onClose={handleCartClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <CartDropdown onClose={handleCartClose} />
          </Popover>
        </>
      )}
    </>
  );
};

export default Navbar;