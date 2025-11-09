import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase/client';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Button,
} from '@mui/material';
import useNavbarProps from '../hooks/useNavbarProps';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useKeenSlider } from 'keen-slider/react';
import Lightbox from 'yet-another-react-lightbox';

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

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const getImages = (urls) =>
    Array.isArray(urls) && urls.length > 0 ? urls : ['/placeholder.jpg'];

  const images = getImages(product?.image_urls);

  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    mode: 'snap',
    slides: { perView: 1 },
    spacing: 8,
    slideChanged: (s) => setCurrentSlide(s.track.details.rel),
  });

  useEffect(() => {
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
          <Typography color="error">找不到商品。</Typography>
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
          {/* 商品圖片輪播區塊 */}
          <Grid item xs={12} md={6}>
            <Box sx={{ maxWidth: 400, mx: 'auto' }}>
              <Box
                ref={sliderRef}
                className="keen-slider"
                sx={{
                  height: 400,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 3,
                  cursor: 'pointer',
                }}
              >
                {images.map((url, idx) => (
                  <Box
                    key={idx}
                    className="keen-slider__slide"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9f9f9',
                    }}
                    onClick={() => {
                      setPhotoIndex(idx);
                      setLightboxOpen(true);
                    }}
                  >
                    <img
                      src={url}
                      alt={`商品圖片 ${idx + 1}`}
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'cover',
                        borderRadius: 8,
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {/* 點點導覽 */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                {images.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={() => slider.current?.moveToIdx(idx)}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: currentSlide === idx ? '#1976d2' : '#ccc',
                      mx: 0.5,
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* 商品資訊區塊 */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {product.description}
            </Typography>
            <Typography variant="h5" color="primary" sx={{ mb: 3 }}>
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

      {/* 圖片放大預覽 */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={photoIndex}
          slides={images.map((url) => ({ src: url }))}
        />
      )}
    </>
  );
}