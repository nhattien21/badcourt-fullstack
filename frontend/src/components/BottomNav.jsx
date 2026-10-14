import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 py-1.5 shadow-lg select-none">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {/* 1. Trang chủ */}
        <button
          onClick={() => navigate('/')}
          className={`flex-1 flex flex-col items-center py-1 transition cursor-pointer ${
            isActive('/') ? 'text-[#00a84e] font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Trang chủ</span>
        </button>

        {/* 2. Khám phá (Nút tròn to xanh lá nổi bật ở giữa) */}
        <div className="flex-1 flex flex-col items-center relative -top-4">
          <button
            onClick={() => navigate('/explore')}
            className={`w-13 h-13 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer border-4 border-white ${
              isActive('/explore')
                ? 'bg-[#00a84e] text-white ring-2 ring-emerald-400 ring-offset-1'
                : 'bg-[#00a84e] text-white'
            }`}
          >
            <Compass className="w-7 h-7" />
          </button>
          <span
            className={`text-[11px] mt-0.5 font-bold transition ${
              isActive('/explore') ? 'text-[#00a84e]' : 'text-gray-500'
            }`}
          >
            Khám phá
          </span>
        </div>

        {/* 3. Tài khoản */}
        <button
          onClick={() => navigate('/my-bookings')}
          className={`flex-1 flex flex-col items-center py-1 transition cursor-pointer ${
            isActive('/my-bookings') ? 'text-[#00a84e] font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Tài khoản</span>
        </button>
      </div>
    </div>
  );
}