import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addToCart } = useCart(); // ✅ 修正為 addToCart
  const navigate = useNavigate();

  const cover =
    Array.isArray(product.image_urls) && product.image_urls.length > 0
      ? product.image_urls[0]
      : '/placeholder.png';
  const price = product.price ?? 0;

  // ✅ 導向詳情頁
  const handleNavigate = () => {
    console.log('導向商品 ID:', product.id);
    navigate(`/products/${product.id}`);
  };

  // ✅ 加入購物車
  const handleAddToCart = (e) => {
    e.stopPropagation(); // 防止觸發導向
    addToCart({
      id: product.id,
      name: product.name,
      price: price,
      image: cover,
    });
  };

  // ✅ 點擊 InfoIcon 導向詳情
  const handleInfoClick = (e) => {
    e.stopPropagation();
    handleNavigate();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 商品圖片與 Featured 標籤 */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={cover}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />        
      </Box>

      {/* 商品資訊區塊（可點擊導向詳情頁） */}
      <CardContent
        sx={{ flexGrow: 1, cursor: 'pointer' }}
        onClick={handleNavigate}
      >
        <Typography variant="subtitle1" noWrap component="div">
          {product.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, minHeight: 40 }}
          component="div"
        >
          {product.description}
        </Typography>
        <Typography variant="h6" sx={{ mt: 1 }} component="div">
          NT$ {price.toLocaleString()}
        </Typography>
      </CardContent>

      {/* 操作區塊：加入購物車與詳情導向 */}
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
    </Card>
  );
}