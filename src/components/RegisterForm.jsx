import { useState } from 'react';
import { TextField, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function RegisterForm() {
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = '請輸入姓名';
    if (!emailRegex.test(formData.email)) newErrors.email = 'Email 格式錯誤';
    if (formData.password.length < 6) newErrors.password = '密碼至少 6 個字元';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '密碼不一致';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validate()) return;

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.name);
      setMessage('✅ 註冊成功！請至信箱收信並完成驗證。');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } catch (err) {
      setMessage(err.message || '註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h5">註冊</Typography>

      <TextField
        label="姓名"
        fullWidth
        margin="normal"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={!!errors.name}
        helperText={errors.name}
      />

      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={!!errors.email}
        helperText={errors.email}
      />

      <TextField
        label="密碼"
        type="password"
        fullWidth
        margin="normal"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        error={!!errors.password}
        helperText={errors.password}
      />

      <TextField
        label="再次輸入密碼"
        type="password"
        fullWidth
        margin="normal"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
      />

      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
        {loading ? '註冊中...' : '註冊'}
      </Button>

      {message && (
        <Alert severity={message.startsWith('✅') ? 'success' : 'error'} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </form>
  );
}