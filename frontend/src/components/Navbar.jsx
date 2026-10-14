import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Shield } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Xử lý bấm Logo hoặc Danh Sách Sân: reset ô tìm kiếm & bộ lọc
  const handleLogoOrHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.dispatchEvent(new Event('resetHomeSearch'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-[#1b6b3e] text-white shadow-md sticky top-0 z-40 border-b border-emerald-800/40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO BỌC KHUNG TRÒN TINH TẾ */}
        <Link 
          to="/" 
          onClick={handleLogoOrHomeClick} 
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-white/25 transition">
            <span className="text-xl select-none">🏸</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-white group-hover:text-amber-300 transition">
            BADCourt
          </span>
        </Link>

        {/* CÁC NÚT ĐIỀU HƯỚNG VÀ TÀI KHOẢN */}
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            onClick={handleLogoOrHomeClick}
            className="hidden sm:inline-block text-xs font-semibold px-3 py-2 rounded-lg hover:bg-white/10 text-emerald-100 hover:text-white transition cursor-pointer"
          >
            Danh Sách Sân
          </Link>

          {token && user ? (
            <>
              {user.role === 'ADMIN' ? (
                <Link
                  to="/admin"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 border border-emerald-600 shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5" /> Quản Trị
                </Link>
              ) : (
                <Link
                  to="/my-bookings"
                  className="text-xs font-semibold px-3 py-2 rounded-lg hover:bg-white/10 text-emerald-100 hover:text-white transition"
                >
                  Lịch Của Tôi
                </Link>
              )}

              <div className="flex items-center gap-2 bg-[#124d2c] px-3 py-1.5 rounded-full border border-emerald-700 text-xs font-semibold">
                <User className="w-3.5 h-3.5 text-amber-300" />
                <span className="max-w-[120px] truncate">{user.fullName || 'Người dùng'}</span>
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Đăng Xuất
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-bold px-4 py-2 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                className="bg-[#e69b24] hover:bg-[#cf8819] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition"
              >
                Đăng Ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}