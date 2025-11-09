import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function CartDropdown({ onClose }) {
  const { items, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const { user, setShowLoginModal } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false); // ✅ 登入後續接結帳
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.warning('請先登入');
      setPendingCheckout(true); // ✅ 標記為待結帳
      setShowLoginModal(true);
      return;
    }
    setConfirmOpen(true);
  };

  // ✅ 登入後自動開啟確認結帳視窗
  useEffect(() => {
    if (user && pendingCheckout) {
      setConfirmOpen(true);
      setPendingCheckout(false);
    }
  }, [user, pendingCheckout]);

  const handleConfirm = async () => {
    const orderPayload = {
      user_id: user?.id || null,
      items,
      total: totalAmount,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('orders').insert(orderPayload);
    if (error) {
      console.error('❌ 訂單儲存失敗:', error.message);
    } else {
      console.log('✅ 訂單已儲存');
      const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
      clearCart();
      setConfirmOpen(false);
      onClose();
      navigate('/order-success', {
        state: { totalAmount, totalCount },
      });
    }
  };

  return (
    <>
      <Box sx={{ width: 320, maxHeight: 400, overflow: 'auto', p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom>購物車</Typography>
        {items.length === 0 ? (
          <Typography color="text.secondary">購物車是空的</Typography>
        ) : (
          <>
            <List sx={{ mb: 2 }}>
              {items.map((item) => (
                <ListItem key={item.id} sx={{ alignItems: 'flex-start' }}>
                  <ListItemText
                    primary={item.name}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          NT$ {item.price} × {item.quantity}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" size="small" onClick={() => removeFromCart(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Divider />
            <Box sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>總計:</Typography>
                <Typography>NT$ {totalAmount?.toLocaleString()}</Typography>
              </Box>
              <Button fullWidth variant="contained" color="primary" onClick={handleCheckout}>
                結帳
              </Button>
            </Box>
          </>
        )}
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>確認結帳</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            <Typography component="div" dangerouslySetInnerHTML={{
              __html: `<h2>這是一個展示頁面，沒有實際效用。</h2><p>接下來會直接產生一筆訂單，可以進行接下來的展示。</p>`
            }} />
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleConfirm}
            >
              確認產生訂單
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}