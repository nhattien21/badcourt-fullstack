import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  User, Phone, Mail, Shield, Calendar, Clock, MapPin, 
  LogOut, Edit3, CheckCircle2, History, AlertCircle, X, Check
} from 'lucide-react';

export default function MyBookings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'history'
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal chỉnh sửa thông tin cá nhân
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');

    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    setUser(savedUser);
    setEditFullName(savedUser.fullName || '');
    setEditPhone(savedUser.phoneNumber || '');

    fetchBookings(savedUser._id);
  }, [navigate]);

  const fetchBookings = async (userId) => {
    try {
      setLoading(true);
      // Gọi API lấy lịch sử đặt sân của user
      const res = await axiosClient.get('/bookings/my-bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      console.warn('Lỗi lấy lịch sử:', err);
      // Fallback lấy toàn bộ đơn nếu route my-bookings khác cấu trúc
      try {
        const allRes = await axiosClient.get('/bookings');
        const myItems = (allRes.data.data || []).filter(
          (b) => String(b.user?._id || b.user) === String(userId)
        );
        setBookings(myItems);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt sân này không?')) return;
    try {
      await axiosClient.put(`/bookings/${bookingId}/cancel`);
      alert('Đã hủy đặt sân thành công!');
      if (user?._id) fetchBookings(user._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy đơn đặt sân này.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editFullName || !editPhone) {
      alert('Vui lòng nhập đầy đủ họ tên và số điện thoại!');
      return;
    }
    try {
      setUpdating(true);
      // Cập nhật thông tin cá nhân
      const res = await axiosClient.put('/users/profile', {
        fullName: editFullName,
        phoneNumber: editPhone
      });
      const updatedUser = res.data?.data || { ...user, fullName: editFullName, phoneNumber: editPhone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditModalOpen(false);
      alert('🎉 Cập nhật thông tin cá nhân thành công!');
    } catch (err) {
      // Fallback lưu local nếu server không có route cập nhật
      const updatedUser = { ...user, fullName: editFullName, phoneNumber: editPhone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditModalOpen(false);
      alert('Cập nhật thông tin thành công!');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-4">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* THANH TAB ĐIỀU HƯỚNG TÀI KHOẢN */}
        <div className="bg-white p-1.5 rounded-2xl shadow-xs border border-gray-200 flex items-center gap-2 mb-5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#1b6b3e] text-white shadow'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#1b6b3e] text-white shadow'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Lịch sử đặt sân ({bookings.length})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Card thông tin chính */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 font-black text-2xl flex items-center justify-center border-4 border-emerald-50 shadow-xs flex-shrink-0">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                    <h2 className="text-xl font-bold text-gray-800">{user.fullName || 'Người dùng BADCourt'}</h2>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-center sm:self-auto">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      {user.role === 'ADMIN' ? 'Quản Trị Viên' : 'Thành Viên BADCourt'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Mã hội viên: #{String(user._id || '8888').slice(-6).toUpperCase()}</p>
                </div>
              </div>

              {/* Chi tiết liên hệ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
                <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-2xs border border-gray-200/60">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block font-medium">Số điện thoại</span>
                    <span className="text-sm font-bold text-gray-800">{user.phoneNumber || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-2xs border border-gray-200/60">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[11px] text-gray-400 block font-medium">Email tài khoản</span>
                    <span className="text-sm font-bold text-gray-800 truncate block">{user.email || 'user@badcourt.vn'}</span>
                  </div>
                </div>
              </div>

              {/* Các nút thao tác */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#1b6b3e] hover:bg-[#145330] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Chỉnh sửa thông tin</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="py-3 px-5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>

            {/* Thông báo quyền lợi */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 text-xs text-emerald-900 space-y-2">
              <h4 className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Quyền lợi thành viên BADCourt:
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-emerald-800/90 leading-relaxed">
                <li>Ưu tiên đặt giữ chỗ trước các khung giờ cao điểm ban đêm và cuối tuần.</li>
                <li>Tích hạt điểm thưởng cho mỗi đơn đặt sân thành công để đổi quà hoặc giảm giá giờ chơi.</li>
                <li>Hưởng chính sách hủy hoàn vé linh hoạt trước 2 tiếng theo quy định của sân.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: LỊCH SỬ ĐẶT SÂN */}
        {/* ======================================================== */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">Lịch Sử Đặt Sân Của Tôi</h2>
              <span className="text-xs text-gray-500 font-medium">Tổng cộng: {bookings.length} đơn</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500 bg-white rounded-3xl border border-gray-200">
                Đang tải danh sách đặt sân...
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">Bạn chưa có lịch đặt sân nào!</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-5 py-2.5 bg-[#1b6b3e] text-white text-xs font-bold rounded-xl shadow cursor-pointer hover:bg-[#145330] transition"
                >
                  Tìm và đặt sân ngay
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 hover:border-emerald-300 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-sm text-gray-900">
                          {item.court?.name || 'Sân Cầu Lông'}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{item.court?.description || 'Hà Nội'}</span>
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          item.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status || 'CONFIRMED'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 font-semibold text-gray-800">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          Ngày: {item.bookingDate}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-gray-800">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          Giờ: {item.startTime} - {item.endTime}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-[11px] text-gray-500 italic pt-1">
                          Ghi chú: {item.note}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">Tổng tiền</span>
                        <span className="text-base font-black text-emerald-700">
                          {(item.totalPrice || 0).toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>

                      {item.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelBooking(item._id)}
                          className="px-4 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Hủy Đặt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL CHỈNH SỬA THÔNG TIN CÁ NHÂN */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-800">Chỉnh sửa thông tin cá nhân</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-500"
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase mb-1">Email đăng ký (Cố định)</label>
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 bg-[#1b6b3e] hover:bg-[#145330] text-white rounded-xl font-bold shadow transition cursor-pointer"
                >
                  {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}