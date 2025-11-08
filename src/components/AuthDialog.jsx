import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  Divider,
  Box,
  CircularProgress,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../hooks/useAuth';

export default function AuthDialog({ open, onClose }) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!email || !password || (isRegister && (!confirmPassword || !name))) {
      setErrorMsg('請填寫所有欄位');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Email 格式錯誤');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('密碼至少需 6 個字元');
      setLoading(false);
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setErrorMsg('兩次輸入的密碼不一致');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await signUp(email, password, name);
        setSuccessMsg('註冊成功，請到信箱收確認信。點擊確認後即可登入。');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isRegister ? '註冊' : '登入'}</DialogTitle>
      <DialogContent>
        <Tabs value={isRegister ? 1 : 0} onChange={(e, val) => setIsRegister(val === 1)} centered>
          <Tab label="登入" />
          <Tab label="註冊" />
        </Tabs>

        <Box mt={2}>
          {isRegister && (
            <TextField
              label="姓名"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="密碼"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {isRegister && (
            <TextField
              label="再次輸入密碼"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          {errorMsg && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {successMsg && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {successMsg}
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, height: 48 }}
            onClick={handleAuth}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : isRegister ? '註冊' : '登入'}
          </Button>

          <Divider sx={{ my: 3 }}>或</Divider>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            用 GOOGLE 登入
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}