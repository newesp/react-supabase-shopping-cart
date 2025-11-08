const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post('/', async (req, res) => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase 環境變數未設定');
    return res.status(500).json({ error: 'Supabase 設定錯誤' });
  }

  const { userId, role } = req.body;

  console.log('✅ 進入 /api/setUserRole');
  console.log('headers:', req.headers);
  console.log('raw body:', req.body);

  if (!userId || !role) {
    return res.status(400).json({ error: '缺少 userId 或 role' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { role },
    });

    if (error) {
      console.error('❌ Supabase 更新錯誤:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ 角色已更新:', data.app_metadata.role);
    res.status(200).json({ success: true, role: data.app_metadata.role });
  } catch (err) {
    console.error('❌ API 執行錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;