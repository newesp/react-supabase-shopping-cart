import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import ProductGrid from './ProductGrid';
import Navbar from './Navbar';
import AuthDialog from './AuthDialog';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { totalCount } = useCart();
  const query = searchParams.get('term') || '';

  const [authOpen, setAuthOpen] = useState(false);
  const handleLoginClick = () => setAuthOpen(true);
  const handleAuthClose = () => setAuthOpen(false);

  const handleSearch = (newQuery) => {
    const newSearchParams = new URLSearchParams();
    if (newQuery) newSearchParams.set('term', newQuery);
    window.history.pushState({}, '', `?${newSearchParams.toString()}`);
    window.location.reload();
  };

  return (
    <Box>
      <Navbar
        isLoggedIn={!!user}
        user={user}
        cartCount={totalCount}
        onSearch={handleSearch}
        onLoginClick={handleLoginClick}
        onLogoutClick={signOut}
      />

      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          搜尋「{query}」的結果
        </Typography>
        <ProductGrid searchTerm={query} />
      </Box>

      <AuthDialog open={authOpen} onClose={handleAuthClose} />
    </Box>
  );
}