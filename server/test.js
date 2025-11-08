// /server/test.js
const axios = require('axios');

const testPayload = {
  userId: '8c1c3099-19f9-441e-a281-08cc58f11022', // 請替換成有效的 Supabase UUID
  role: 'admin'
};

axios.post('http://localhost:3001/api/setUserRole', testPayload, {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('✅ 成功回應：');
  console.log(response.data);
})
.catch(error => {
  console.error('❌ 發生錯誤：');
  if (error.response) {
    console.error('狀態碼：', error.response.status);
    console.error('錯誤訊息：', error.response.data);
  } else {
    console.error(error.message);
  }
});