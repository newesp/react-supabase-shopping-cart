import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase/client';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  Button,
} from '@mui/material';
import useNavbarProps from '../hooks/useNavbarProps';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const {
    isLoggedIn,
    user,
    cartCount,
    onLoginClick,
    onLogoutClick,
    onSearch,
    searchTerm,
    setSearchTerm,
  } = useNavbarProps();


  useEffect(() => {
    console.log('收到商品 ID:', id);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ 無法取得商品:', error.message);
    } else {
      setProduct(data);
    }
    setLoading(false);
  };

  const getImages = (urls) =>
    Array.isArray(urls) && urls.length > 0 ? urls : ['/placeholder.jpg'];

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 4 }}>
          <Typography color="error" component="div">
            找不到商品。
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        cartCount={cartCount}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onSearch={onSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <Box sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* 商品圖片區塊 */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {getImages(product.image_urls).map((url, idx) => (
                <Grid item xs={6} key={idx}>
                  <Card>
                    <CardMedia
                      component="img"
                      image={url}
                      alt={`商品圖片 ${idx + 1}`}
                      sx={{ height: 240, objectFit: 'cover' }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* 商品資訊區塊 */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom component="div">
              {product.name}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 2 }}
              component="div"
            >
              {product.description}
            </Typography>
            <Typography
              variant="h6"
              color="primary"
              sx={{ mb: 3 }}
              component="div"
            >
              NT$ {product.price?.toLocaleString()}
            </Typography>
            <Button
              variant="contained"
              onClick={() => addToCart(product)}
              sx={{ minWidth: 160 }}
            >
              加入購物車
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}