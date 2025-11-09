import { Box, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import useNavbarProps from '../hooks/useNavbarProps';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
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

  // 從 location.state 傳入訂單資訊
  const { totalAmount, totalCount } = location.state || {};

  const hasOrderData = typeof totalAmount === 'number' && typeof totalCount === 'number';

  return (
    <Box>
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

      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          訂單已完成！
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          感謝您的購買，我們已成功建立您的訂單。
        </Typography>

        {hasOrderData ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1">商品數量：{totalCount} 件</Typography>
            <Typography variant="subtitle1">總金額：NT$ {totalAmount.toLocaleString()}</Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            無法取得訂單資料，請確認是否從結帳流程導向本頁。
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/orders')}>
            查看我的訂單
          </Button>
          <Button variant="contained" onClick={() => navigate('/')}>
            返回首頁
          </Button>
        </Box>
      </Box>
    </Box>
  );
}