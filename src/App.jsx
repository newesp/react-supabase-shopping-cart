import React, { useState, Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductGrid from './components/ProductGrid';
import AuthDialog from './components/AuthDialog';
import OrderSuccess from './components/OrderSuccess';
import MyOrders from './pages/MyOrders.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import AdminLogin from './admin/Login.jsx';
import Footer from './components/Footer';
import { Box } from '@mui/material';
import 'keen-slider/keen-slider.min.css';
import 'yet-another-react-lightbox/styles.css';

// Lazy-loaded components
const AdminRoute = lazy(() => import('./admin/AdminRoute.jsx'));
const SearchResults = lazy(() => import('./components/SearchResults.jsx'));

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('App Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return <p>很抱歉，發生了一些錯誤，請稍後再試。</p>;
    }
    return this.props.children;
  }
}

const MainContent = () => {
  const { user, loading, signOut } = useAuth();
  const { totalCount } = useCart();
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (term) => {
    if (term.trim()) {
      navigate(`/search?term=${encodeURIComponent(term.trim())}`);
    }
  };

  const handleLoginClick = () => setAuthOpen(true);
  const handleAuthClose = () => setAuthOpen(false);
  const handleLogoutClick = async () => await signOut();

  if (loading) return <p>載入中...</p>;

  return (
    <>
      <Navbar
        isLoggedIn={!!user}
        user={user}
        cartCount={totalCount}
        onSearch={handleSearch}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogoutClick}
      />
      <HeroSection />
      <ProductGrid />
      <AuthDialog open={authOpen} onClose={handleAuthClose} />
    </>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      {!isAdminRoute && <Footer />}
    </Box>
  );
};

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Suspense fallback={<p>頁面載入中...</p>}>
            <Routes>
              {/* 前台 routes 包在 AppLayout */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<MainContent />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/products/:id" element={<ProductDetail />} />
              </Route>

              {/* 後台 routes 不包 AppLayout */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/*" element={<AdminRoute />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;