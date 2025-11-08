import { useAuth } from '../hooks/useAuth';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';

export default function AdminIndex() {
  const { user, loading } = useAuth();

  if (loading) return <div>載入中...</div>;
  if (!user) return <div>請先登入後台</div>;

  return <AdminLayout><Dashboard /></AdminLayout>;
}