import { useEffect, useState } from 'react';
import { Box, Button, Typography, Card, CardContent, CircularProgress, Chip } from '@mui/material';
import useNavbarProps from '../hooks/useNavbarProps';
import Navbar from '../components/Navbar';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';

export default function MyOrders() {  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
    if (user) fetchOrders();
  }, [user]);

  const cancelOrder = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: '取消' })
      .eq('id', orderId);

    if (error) {
      console.error('❌ 訂單取消失敗:', error.message);
    } else {
      // 重新載入訂單列表
      fetchOrders();
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error('❌ 無法取得訂單:', error.message);
    else setOrders(data || []);
    setLoading(false);
  };

  const statusColor = (status) => {
    switch (status) {
      case '已成立': return 'default';
      case '發貨中': return 'info';
      case '完成': return 'success';
      case '取消': return 'error';
      default: return 'default';
    }
  };

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

      <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>我的訂單</Typography>

        {loading ? (
          <CircularProgress />
        ) : orders.length === 0 ? (
          <Typography color="text.secondary">目前沒有任何訂單。</Typography>
        ) : (
          orders.map((order) => (
            <Card key={order.id} sx={{ mb: 3 }}>
              <CardContent>
                {/* 第一行：訂單編號 + 建立時間 + 狀態 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      訂單編號：{order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      建立時間：{new Date(order.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip label={order.status} color={statusColor(order.status)} />
                </Box>

                {/* 商品資訊區塊 */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>商品資訊</Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {order.items?.map((item, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{item.name}</Typography>
                      </li>
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    商品數量：{order.items?.length ?? 0}
                  </Typography>
                  <Typography variant="body2">
                    總金額：NT$ {order.total?.toLocaleString()}
                  </Typography>
                </Box>

                {/* 右下角取消訂單按鈕 */}
                {order.status === '已成立' && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => cancelOrder(order.id)}
                    >
                      取消訂單
                    </Button>
                  </Box>
                )}
              </CardContent>
  
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}