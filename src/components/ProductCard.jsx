import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useKeenSlider } from 'keen-slider/react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const images = Array.isArray(product.image_urls) && product.image_urls.length > 0
    ? product.image_urls
    : ['/placeholder.png'];
  const price = product.price ?? 0;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    mode: 'snap',
    slides: { perView: 1 },
    spacing: 8,
    slideChanged: (s) => setCurrentSlide(s.track.details.rel),
  });

  const handleNavigate = () => {
    console.log('導向商品 ID:', product.id);
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: price,
      image: images[0],
    });
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
    handleNavigate();
  };

  return (
    <Card
      sx={{
        width: 300,
        height: 520,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 3,
        boxShadow: 4,
        overflow: 'hidden',
      }}
    >
      {/* 商品圖片輪播區 */}
      <Box sx={{ width: '100%', pt: 1 }}>
        <Box
          ref={sliderRef}
          className="keen-slider"
          sx={{
            width: '100%',
            height: 280,
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: 2,
            cursor: 'pointer',
          }}
        >
          {images.map((url, index) => (
            <Box
              key={index}
              className="keen-slider__slide"
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9',
              }}
              onClick={() => {
                setPhotoIndex(index);
                setLightboxOpen(true);
              }}
            >
              <img
                src={url}
                alt={`product-${index}`}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          {images.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => slider.current?.moveToIdx(idx)}
              sx={{
                width: 8,
                height: 8,
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

      {/* 商品資訊區塊 */}
      <CardContent
        sx={{
          flexGrow: 1,
          cursor: 'pointer',
          px: 2,
          py: 1,
        }}
        onClick={handleNavigate}
      >
        <Typography variant="subtitle1" noWrap>
          {product.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            minHeight: 40,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.description}
        </Typography>
        <Typography variant="h6" sx={{ mt: 1 }}>
          NT$ {price.toLocaleString()}
        </Typography>
      </CardContent>

      {/* 操作區塊 */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          size="small"
          startIcon={<AddShoppingCartIcon />}
          onClick={handleAddToCart}
        >
          加入購物車
        </Button>
        <IconButton
          size="small"
          onClick={handleInfoClick}
          aria-label="檢視詳細"
        >
          <InfoIcon />
        </IconButton>
      </CardActions>

      {/* 圖片放大預覽 */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={photoIndex}
          slides={images.map((url) => ({ src: url }))}
        />
      )}
    </Card>
  );
}