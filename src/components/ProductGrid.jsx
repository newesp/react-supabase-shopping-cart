import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Skeleton,
  Typography,
  Box,
} from '@mui/material';
import { supabase } from '../supabase/client';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';

export default function ProductGrid({ searchTerm }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      } else {
        query = query.eq('featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Grid
        container
        spacing={3}
        justifyContent="center" // ✅ Skeleton 卡片也置中
        sx={{ p: 3 }}
      >
        {[1, 2, 3, 4].map((n) => (
          <Grid
            item
            key={n}
            sx={{ display: 'flex', justifyContent: 'center' }}
          >
            <Card sx={{ width: 240, height: 360 }}>
              <Skeleton variant="rectangular" height={180} />
              <CardContent>
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">錯誤: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, pt: 2 }}>
      {searchTerm && (
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          一共找到 {products.length} 個商品
        </Typography>
      )}

      <Grid
        container
        spacing={3}
        justifyContent="center" // ✅ 商品卡片置中排列
        sx={{ p: 3 }}
      >
        {products.map((product) => (
          <Grid
            item
            key={product.id}
            sx={{ display: 'flex', justifyContent: 'center' }} // ✅ 單張卡片也置中
          >
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}