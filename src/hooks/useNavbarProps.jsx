import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { supabase } from '../supabase/client';

export default function useNavbarProps() {
  const { user, setShowLoginModal } = useAuth(); // ✅ 加入 setShowLoginModal
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const isLoggedIn = !!user;
  const cartCount = cartItems?.length ?? 0;

  const onLoginClick = () => {
    setShowLoginModal(true); // ✅ 改為開啟登入視窗，不導向 /login
  };

  const onLogoutClick = async () => {
    await supabase.auth.signOut();
    navigate('/'); // ✅ 登出後導向首頁
  };

  const onSearch = (term) => {
    const trimmed = term.trim();
    if (trimmed) {
      navigate(`/search?term=${encodeURIComponent(trimmed)}`);
    }
  };

  return {
    isLoggedIn,
    user,
    cartCount,
    onLoginClick,
    onLogoutClick,
    onSearch,
    searchTerm,
    setSearchTerm,
  };
}