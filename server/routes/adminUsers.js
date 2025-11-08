const express = require('express');
const router = express.Router();

// 注意: supabaseAdmin 從 index.js 傳入
module.exports = function(supabaseAdmin) {
  // GET /api/admin/users - 列出所有使用者
  router.get('/', async (req, res) => {
    try {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) {
        console.error('列出使用者失敗:', error);
        return res.status(500).json({ error: error.message });
      }
      
      res.json({ users });
    } catch (err) {
      console.error('取得使用者例外:', err);
      res.status(500).json({ error: '伺服器錯誤' });
    }
  });

  return router;
};