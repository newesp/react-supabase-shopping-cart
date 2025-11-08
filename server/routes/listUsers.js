// server/routes/listUsers.js
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('❌ 取得使用者失敗:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ users: data.users });
  } catch (err) {
    console.error('❌ API 錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;