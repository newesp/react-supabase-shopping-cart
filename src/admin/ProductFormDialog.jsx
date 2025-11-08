import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ProductFormDialog({
  open,
  onClose,
  onProductAdded,
  onProductUpdated,
  editingProduct,
}) {
  const isEdit = Boolean(editingProduct);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState([]); // File[]
  const [existingUrls, setExistingUrls] = useState([]); // string[]
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit && editingProduct) {
      setName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
      setPrice(editingProduct.price || '');
      setFeatured(editingProduct.featured || false);
      setExistingUrls(editingProduct.image_urls || []);
      setImages([]);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setFeatured(false);
      setExistingUrls([]);
      setImages([]);
    }
  }, [editingProduct, open]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files].slice(0, 5 - existingUrls.length);
    setImages(newImages);
  };

  const handleRemoveExisting = async (index) => {
    // 立即更新 UI
    const updated = [...existingUrls];
    const url = updated.splice(index, 1)[0];
    setExistingUrls(updated);

    // 嘗試刪除 storage 檔案與 images metadata
    try {
      // 解析 Supabase public URL 對應的 storage path
      const extractStoragePath = (urlStr) => {
        if (!urlStr) return null;
        try {
          const u = new URL(urlStr);
          // 常見 path 範例: /storage/v1/object/public/product-images/<path>
          const marker = '/product-images/';
          const idx = u.pathname.indexOf(marker);
          if (idx !== -1) return decodeURIComponent(u.pathname.slice(idx + marker.length));
          // fallback regex
          const m = urlStr.match(/product-images\/(.+)$/);
          return m ? decodeURIComponent(m[1]) : null;
        } catch (e) {
          const m = urlStr.match(/product-images\/(.+)$/);
          return m ? decodeURIComponent(m[1]) : null;
        }
      };

      const path = extractStoragePath(url);

      if (path) {
        const { data: delData, error: delErr } = await supabase
          .storage
          .from('product-images')
          .remove([path]);

        if (delErr) {
          console.error('刪除 storage 檔案失敗', delErr);
        } else {
          console.log('已從 storage 刪除檔案', delData);
        }
      } else {
        console.warn('無法解析 storage path，跳過 storage 刪除', url);
      }

      // 刪除 images metadata（若有此 table），優先使用 productId 與 url 篩選
      const prodId = productId;
      let imgDelResp;
      if (prodId) {
        imgDelResp = await supabase
          .from('images')
          .delete()
          .match({ product_id: prodId, url });
      } else {
        imgDelResp = await supabase
          .from('images')
          .delete()
          .eq('url', url);
      }

      if (imgDelResp.error) {
        console.error('刪除 images 表記錄失敗', imgDelResp.error);
      } else {
        console.log('已刪除 images 表記錄', imgDelResp.data);
      }
    } catch (err) {
      console.error('刪除現有圖片時發生例外', err);
    }
  };

  const handleRemoveNew = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  // 新增：安全取得目前 product id（避免 ESLint no-undef）
  const productId = editingProduct?.id ?? null;

  // 更完整且安全的 handleSubmit，處理 create/update 與圖片上傳/metadata （會帶 owner）
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    // 取得 session（兼容 supabase v1/v2）
    const getSession = async () => {
      if (supabase.auth && typeof supabase.auth.getSession === 'function') {
        const { data } = await supabase.auth.getSession();
        return data?.session ?? null;
      }
      if (supabase.auth && typeof supabase.auth.session === 'function') {
        return supabase.auth.session() ?? null;
      }
      return null;
    };

    try {
      const session = await getSession();
      const userId = session?.user?.id;
      if (!userId) {
        alert('請先登入再進行操作');
        setUploading(false);
        return;
      }

      // 建立或更新 product（先處理 product record，以取得 id 再上傳圖片）
      let prodId = productId;
      if (isEdit) {
        const { data: updatedData, error: updateErr } = await supabase
          .from('products')
          .update({
            name,
            description,
            price,
            featured,
            // 保留 existingUrls 但不包含尚未上傳的新檔
            image_urls: existingUrls,
          })
          .eq('id', prodId)
          .select()
          .single();

        if (updateErr) throw updateErr;
        prodId = updatedData?.id ?? prodId;
      } else {
        const { data: created, error: createErr } = await supabase
          .from('products')
          .insert([{
            name,
            description,
            price,
            featured,
            image_urls: existingUrls,
            // owner: userId, // ← 移除或註解這一行，因為 products 表沒有 owner 欄位
          }])
          .select()
          .single();

        if (createErr) throw createErr;
        prodId = created?.id;
      }

      // 上傳新的檔案到 storage 並在 images table 記錄 metadata（帶 owner, product_id）
      const uploadedPublicUrls = [];
      for (const file of images || []) {
        const filePath = `${userId}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadErr } = await supabase
          .storage
          .from('product-images')
          .upload(filePath, file, { upsert: false });

        if (uploadErr) {
          console.error('圖片上傳失敗', uploadErr);
          // 繼續處理其他檔案
          continue;
        }

        // 取得公開 URL（若 bucket 為 public）
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
        const publicUrl = urlData?.publicUrl ?? null;
        if (publicUrl) uploadedPublicUrls.push(publicUrl);

        // 若有 images metadata 資料表，插入時帶 owner 與 product_id（避免 RLS 拒絕）
        try {
          const { error: imgInsertErr } = await supabase
            .from('images')
            .insert([{
              product_id: prodId,
              url: publicUrl,
              owner: userId,
            }]);
          if (imgInsertErr) {
            console.error('images 表插入失敗', imgInsertErr);
          }
        } catch (err) {
          console.error('images 插入例外', err);
        }
      }

      // 若有新上傳的 url，更新 products.image_urls（合併 existingUrls）
      // 合併現有與新上傳的 url，確保 DB 與 parent callback 一致
      const finalImageUrls = [...(existingUrls || []), ...uploadedPublicUrls];
      try {
        const { error: upImgErr } = await supabase
          .from('products')
          .update({ image_urls: finalImageUrls })
          .eq('id', prodId);
        if (upImgErr) console.error('更新 product.image_urls 失敗', upImgErr);
      } catch (err) {
        console.error('更新 product.image_urls 例外', err);
      }

      // callback（帶入 image_urls，避免 parent 顯示不一致）
      if (isEdit) {
        onProductUpdated && onProductUpdated({ id: prodId, name, description, price, featured, image_urls: finalImageUrls });
      } else {
        onProductAdded && onProductAdded({ id: prodId, name, description, price, featured, image_urls: finalImageUrls });
      }

      onClose && onClose();
    } catch (err) {
      console.error('提交失敗', err);
      alert(err?.message || '提交發生錯誤');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? '編輯商品' : '新增商品'}</DialogTitle>
      <DialogContent>
        <TextField
          label="商品名稱"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="商品描述"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="價格"
          type="number"
          fullWidth
          margin="normal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <FormControlLabel
          control={
            <Switch
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
          }
          label="是否展示在主頁"
        />

        <Box mt={2}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            圖片（最多 5 張）
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<AddPhotoAlternateIcon />}
            disabled={existingUrls.length + images.length >= 5}
          >
            上傳圖片
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
            {existingUrls.map((url, index) => (
              <Box key={`existing-${index}`} sx={{ position: 'relative', mr: 2 }}>
                <img
                  src={url}
                  alt={`existing-${index}`}
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: 0, right: 0 }}
                  onClick={() => handleRemoveExisting(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            {images.map((img, index) => (
              <Box key={`new-${index}`} sx={{ position: 'relative', mr: 2 }}>
                <img
                  src={URL.createObjectURL(img)}
                  alt={`new-${index}`}
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: 0, right: 0 }}
                  onClick={() => handleRemoveNew(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleSubmit}
          disabled={uploading}
        >
          {uploading ? '儲存中...' : isEdit ? '更新商品' : '儲存商品'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}