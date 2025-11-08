import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
  Chip,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // 用於顯示列表載入錯誤
  const [saving, setSaving] = useState(false); // 用於控制儲存按鈕狀態

  // 1. 編輯/新增使用者的 Dialog 狀態
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // 2. 自定義錯誤訊息 Dialog 狀態 (取代 alert/confirm)
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  
  // 3. 自定義確認刪除 Dialog 狀態
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);


  // --- Helper Functions ---

  const showCustomAlert = (title, message) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setShowErrorDialog(true);
  };

  const handleConfirmDelete = (user) => {
    setUserToDelete(user);
    setShowConfirmDialog(true);
  }

  const handleCloseConfirm = (confirmed) => {
    setShowConfirmDialog(false);
    if (confirmed && userToDelete) {
        handleDelete(userToDelete.id);
    }
    setUserToDelete(null);
  }


  const generateRandomPassword = (len = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let out = '';
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  };

  const renderDisplayName = (u) =>
    // 假設 server.js 回傳的格式與 Supabase Auth Admin 一致
    u.user_metadata?.full_name ||
    u.user_metadata?.name ||
    u.user_metadata?.display_name ||
    u.raw_user_meta_data?.full_name ||
    '-';

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

  // --- API Functions (呼叫 /api/admin/users) ---

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 呼叫由 server/routes/adminUsers.js 提供的 GET /
      const res = await fetch(`${API_BASE}/api/admin/users`);
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || '取得使用者失敗');
      }

      setUsers(body.users || []);
    } catch (err) {
      console.error('fetchUsers error', err);
      setError(err.message || '取得使用者發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // 呼叫由 server/routes/adminUsers.js 提供的 DELETE /:id
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
          method: 'DELETE',
      });
      
      // 檢查 server/routes/adminUsers.js 的回傳
      // 成功時 (res.json({ success: true }))
      if (res.ok) {
         // 繼續
      } else {
         // 失敗時 (res.status(500).json({ error: ... }))
         const body = await res.json().catch(() => ({}));
         throw new Error(body.error || `刪除失敗 (狀態 ${res.status})`);
      }
      
      fetchUsers(); // 重新載入列表
      showCustomAlert('成功', '使用者已成功刪除。');
    } catch (err) {
      console.error('delete user error', err);
      showCustomAlert('刪除失敗', err.message || '刪除時發生錯誤');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const role = isAdmin ? 'admin' : 'user';
      let url, method, payload;

      if (editingUser) {
        // 呼叫由 server/routes/adminUsers.js 提供的 PATCH /:id
        url = `http://localhost:3001/api/admin/users/${editingUser.id}`;
        method = 'PATCH';
        payload = { 
            role: role, 
            name: formName 
        };
      } else {
        // 呼叫由 server/routes/adminUsers.js 提供的 POST /
        url = 'http://localhost:3001/api/admin/users';
        method = 'POST';
        payload = { 
            email: formEmail, 
            password: formPassword, 
            role: role, 
            name: formName 
        };
      }

      const res = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
          throw new Error(body.error || '儲存失敗');
      }

      fetchUsers();
      setDialogOpen(false);
      showCustomAlert('成功', `使用者已成功${editingUser ? '更新' : '建立'}。`);

    } catch (err) {
      console.error('save user error', err);
      showCustomAlert('儲存失敗', err.message || '儲存時發生錯誤');
    } finally {
      setSaving(false);
    }
  };


  // --- Dialog Management ---
  const openAddDialog = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setDialogOpen(true);
  };
  
  // --- Dialog form state ---
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // 當 editingUser 或 dialogOpen 改變時，初始化表單狀態
  useEffect(() => {
    if (dialogOpen) {
      if (editingUser) {
        setFormEmail(editingUser.email || '');
        const display = renderDisplayName(editingUser); // 使用 helper function 取得名稱
        setFormName(display === '-' ? '' : display); // 如果是 '-' 則設為空字串
        setIsAdmin(editingUser.app_metadata?.role === 'admin');
        setFormPassword(''); // 編輯時不顯示密碼
      } else {
        setFormEmail('');
        setFormName('');
        setIsAdmin(false);
        // 每次開啟新增表單時預設隨機密碼
        setFormPassword(generateRandomPassword(10));
      }
    }
  }, [editingUser, dialogOpen]);


  // --- Lifecycle ---

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Render ---

  return (
    <Box p={2}>
      {/* 標題與新增按鈕 */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">使用者管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
          新增使用者
        </Button>
      </Box>

      {/* 使用者列表 */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box p={2}>
            <Typography color="error">錯誤: {error}</Typography>
            <Typography variant="body2" color="textSecondary">
                無法載入使用者。請檢查後端伺服器 (server/index.js) 是否已啟動。
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>稱呼</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>最後登入時間</TableCell>
                <TableCell>權限</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{renderDisplayName(u)}</TableCell>
                  <TableCell>{u.email || '-'}</TableCell>
                  <TableCell>
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    {u.app_metadata?.role === 'admin' ? (
                      <Chip label="admin" color="primary" size="small" />
                    ) : (
                      <Chip label="user" variant="outlined" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="編輯">
                      <IconButton size="small" onClick={() => openEditDialog(u)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="刪除">
                      <IconButton size="small" onClick={() => handleConfirmDelete(u)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* 新增/編輯使用者 Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingUser ? '編輯使用者' : '新增使用者'}</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <TextField
              label="稱呼 (user_metadata.name)"
              fullWidth
              margin="normal"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              disabled={Boolean(editingUser)}
            />
            {!editingUser && (
              <TextField
                label="密碼"
                fullWidth
                margin="normal"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                helperText="預設為隨機 10 字元密碼"
              />
            )}
            <FormControlLabel
              control={<Switch checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />}
              label="是否為管理員 (app_metadata.role)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            取消
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={24} /> : editingUser ? '更新' : '建立'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 自定義錯誤/成功訊息 Dialog (取代 alert) */}
      <Dialog open={showErrorDialog} onClose={() => setShowErrorDialog(false)}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowErrorDialog(false)} autoFocus>
            確定
          </Button>
        </DialogActions>
      </Dialog>

      {/* 自定義確認刪除 Dialog (取代 window.confirm) */}
      <Dialog open={showConfirmDialog} onClose={() => handleCloseConfirm(false)}>
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>
          <Typography>確定要刪除使用者 **{userToDelete?.email || userToDelete?.id}**？此動作不可還原。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseConfirm(false)}>取消</Button>
          <Button onClick={() => handleCloseConfirm(true)} color="error" variant="contained">
            確定刪除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

