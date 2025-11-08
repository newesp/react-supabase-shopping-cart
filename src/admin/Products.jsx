import { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Paper,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../supabase/client';
import ProductFormDialog from './ProductFormDialog';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('載入商品失敗', error);
    } else {
      setProducts(data);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductAdded = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleDelete = async (id) => {
    const confirmDel = window.confirm('確定要刪除這個商品嗎？');
    if (!confirmDel) return;

    try {
      // 1) 先從 images table 取出與此商品關聯的圖片記錄（如果有這個 table）
      const { data: imgRows, error: imgFetchErr } = await supabase
        .from('images')
        .select('id, url')
        .eq('product_id', id);

      if (imgFetchErr) {
        console.error('取得 images 表失敗', imgFetchErr);
      }

      // 2) 從 url 抽出 storage path（針對 Supabase public url pattern）
      const extractPath = (url) => {
        if (!url) return null;
        try {
          const u = new URL(url);
          // pathname 例如: /storage/v1/object/public/product-images/<path>
          const marker = '/product-images/';
          const idx = u.pathname.indexOf(marker);
          if (idx === -1) return null;
          return decodeURIComponent(u.pathname.slice(idx + marker.length));
        } catch (e) {
          return null;
        }
      };

      const pathsToRemove = [];

      // 優先用 images table 的 url
      if (Array.isArray(imgRows) && imgRows.length > 0) {
        for (const r of imgRows) {
          const p = extractPath(r.url);
          if (p) pathsToRemove.push(p);
        }
      } else {
        // fallback: 若 products.image_urls 有資料，使用 products 裡的 url
        const { data: prodData } = await supabase.from('products').select('image_urls').eq('id', id).single();
        const urls = prodData?.image_urls ?? [];
        for (const u of urls) {
          const p = extractPath(u);
          if (p) pathsToRemove.push(p);
        }
      }

      // 3) 刪除 storage 中的檔案（若有）
      if (pathsToRemove.length > 0) {
        const { data: delData, error: delErr } = await supabase
          .storage
          .from('product-images')
          .remove(pathsToRemove);

        if (delErr) {
          console.error('刪除 storage 檔案失敗', delErr);
        } else {
          console.log('已從 storage 刪除檔案', delData);
        }
      }

      // 4) 刪除 images table 的 metadata（若存在）
      if (Array.isArray(imgRows) && imgRows.length > 0) {
        const { error: imgDelErr } = await supabase
          .from('images')
          .delete()
          .eq('product_id', id);

        if (imgDelErr) {
          console.error('刪除 images 表記錄失敗', imgDelErr);
        } else {
          console.log('已刪除 images 表記錄');
        }
      }

      // 5) 最後刪除 product 本身
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('刪除商品失敗', error);
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('刪除流程例外', err);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">商品管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingProduct(null);
            setDialogOpen(true);
          }}
        >
          新增商品
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>商品名稱</TableCell>
              <TableCell>價格</TableCell>
              <TableCell>主頁展示</TableCell>
              <TableCell>圖片數量</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>${p.price}</TableCell>
                <TableCell>{p.featured ? '✅' : '❌'}</TableCell>
                <TableCell>{p.image_urls?.length || 0}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => {
                      setEditingProduct(p);
                      setDialogOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(p.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <ProductFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onProductAdded={handleProductAdded}
        onProductUpdated={handleProductUpdated}
        editingProduct={editingProduct}
      />
    </Box>
  );
}