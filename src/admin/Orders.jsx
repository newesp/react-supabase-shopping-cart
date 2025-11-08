import { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Paper,
  Select,
  MenuItem,
} from '@mui/material';
import { supabase } from '../supabase/client';

const ORDER_STATUSES = ['已成立', '發貨中', '完成', '取消'];
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserInfo = async (user_id) => {
    try {
      const res = await fetch(`${API_BASE}/api/getUserInfo?user_id=${user_id}`);
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await res.text();
        console.error('❌ API 回傳非 JSON:', text);
        throw new Error('API 回傳格式錯誤');
      }

      const data = await res.json();
      return {
        email: data.email || '未知',
        full_name: data.full_name || '未知',
      };
    } catch (err) {
      console.error('❌ 查詢使用者失敗:', err.message);
      return { email: '未知', full_name: '未知' };
    }
  };

  const fetchOrders = async () => {
    setLoading(true);

    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ 無法取得訂單:', ordersError.message);
      setOrders([]);
      setLoading(false);
      return;
    }

    const enrichedOrders = await Promise.all(
      ordersData.map(async (order) => {
        const { email, full_name } = await fetchUserInfo(order.user_id);
        return {
          ...order,
          email,
          full_name,
        };
      })
    );

    setOrders(enrichedOrders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('❌ 更新訂單狀態失敗:', error.message);
    } else {
      fetchOrders();
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Box maxWidth="1000px" width="100%">
        <Typography variant="h5" mb={2} textAlign="center">
          訂單管理
        </Typography>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>訂單編號</TableCell>
                <TableCell>姓名</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>建立時間</TableCell>
                <TableCell>訂單狀態</TableCell>
                <TableCell>商品總數</TableCell>
                <TableCell>總金額</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    載入中...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    目前沒有任何訂單。
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.full_name}</TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                    <TableCell>{order.status || '未知'}</TableCell>
                    <TableCell>{order.items?.length ?? 0}</TableCell>
                    <TableCell>NT$ {order.total?.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Select
                        size="small"
                        value={order.status || ''}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}