// /server/index.js
const express = require('express');
const app = express();
const cors = require('cors');
const getUserInfoRoute = require('./routes/getUserInfo');
const { createClient } = require('@supabase/supabase-js');

// ✅ 載入根目錄 .env
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
console.log('✅ SUPABASE_URL:', process.env.SUPABASE_URL);


// ✅ 檢查環境變數是否存在
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 缺少 Supabase 環境變數，請確認 .env 設定');
  process.exit(1);
}

// ✅ 初始化 Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ 中介層設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ✅ 掛載 routes
app.use('/api', getUserInfoRoute);

// ✅ 測試 API
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// ✅ Supabase Auth 管理 API
app.get('/api/admin/users', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ users: data.users });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/users', async (req, res) => {
  const { email, password, role, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const payload = {
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { full_name: name } : {},
    app_metadata: role ? { role } : {},
  };

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser(payload);
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ user: data?.user ?? data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const { role, name, email, password } = req.body;
  const updates = {};
  if (role !== undefined) updates.app_metadata = { role };
  if (name !== undefined) updates.user_metadata = { full_name: name };
  if (email !== undefined) updates.email = email;
  if (password !== undefined) updates.password = password;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updates);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ 啟動 server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
