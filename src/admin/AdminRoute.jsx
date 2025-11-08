import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import Users from './Users';
import Products from './Products';
import Orders from './Orders';

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin';

  if (loading) return <p>載入中...</p>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
      </Route>
    </Routes>
  );
}