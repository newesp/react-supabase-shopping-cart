// /server/routes/getUserInfo.js
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// ✅ 載入根目錄 .env
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

// ✅ 初始化 Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.get('/getUserInfo', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

  console.log('✅ /api/getUserInfo 被呼叫:', user_id);

  try {
    const { data, error } = await supabase.auth.admin.getUserById(user_id);
    if (error || !data?.user) {
      console.error('❌ 查詢失敗:', error?.message);
      return res.status(403).json({ email: '未知', full_name: '未知' });
    }

    const user = data.user;
    const email = user.email || '未知';
    const full_name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.display_name ||
      '未知';

    return res.status(200).json({ email, full_name });
  } catch (err) {
    console.error('❌ 例外錯誤:', err.message);
    return res.status(500).json({ email: '未知', full_name: '未知' });
  }
});

module.exports = router;