import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import ProductGrid from './ProductGrid';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { totalCount } = useCart();
  const query = searchParams.get('q') || '';

  const handleSearch = (newQuery) => {
    // Update URL with new search query
    const newSearchParams = new URLSearchParams();
    if (newQuery) newSearchParams.set('q', newQuery);
    window.history.pushState({}, '', `?${newSearchParams.toString()}`);
    window.location.reload(); // Refresh to show new results
  };

  return (
    <Box>
      <Navbar
        isLoggedIn={!!user}
        user={user}
        cartCount={totalCount}
        onSearch={handleSearch}
        onLogoutClick={signOut}
      />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          搜尋「{query}」的結果
        </Typography>
        <ProductGrid searchTerm={query} />
      </Box>
    </Box>
  );
}