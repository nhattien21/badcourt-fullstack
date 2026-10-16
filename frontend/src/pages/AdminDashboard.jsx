import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Users, CalendarCheck, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Hàm tải dữ liệu Admin
  const fetchDashboardData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const [statsRes, bookingsRes] = await Promise.all([
        axiosClient.get('/admin/stats'),
        axiosClient.get('/admin/bookings')
      ]);

      setStats(statsRes.data.data);
      setBookings(bookingsRes.data.data);
    } catch (err) {
      console.error('Lỗi lấy dữ liệu Admin:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Tải dữ liệu ban đầu
    fetchDashboardData();

    // 2. Polling cập nhật mỗi 3 giây
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 3000);

    // 3. Tự cập nhật khi quay lại tab
    const handleFocus = () => fetchDashboardData(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Xử lý đổi trạng thái trực tiếp trên dropdown
  const handleStatusChange = async (bookingId, newStatus) => {
    const bIdStr = String(bookingId);
    const target = bookings.find((b) => String(b._id) === bIdStr);
    const oldStatus = target ? target.status : 'CONFIRMED';

    // Cập nhật UI ngay lập tức
    setBookings((prev) =>
      prev.map((item) => (String(item._id) === bIdStr ? { ...item, status: newStatus } : item))
    );

    // Điều chỉnh doanh thu tức thì
    setStats((prev) => {
      if (!target) return prev;
      let delta = 0;
      if (oldStatus !== 'CANCELLED' && newStatus === 'CANCELLED') {
        delta = -target.totalPrice;
      } else if (oldStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
        delta = target.totalPrice;
      }
      return {
        ...prev,
        totalRevenue: Math.max(0, prev.totalRevenue + delta),
      };
    });

    try {
      await axiosClient.put(`/admin/bookings/${bIdStr}/status`, { status: newStatus });
    } catch (err) {
      console.error('Lỗi cập nhật backend:', err);
      fetchDashboardData(true);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchDate = filterDate ? b.bookingDate === filterDate : true;
    const matchStatus = filterStatus !== 'ALL' ? b.status === filterStatus : true;
    return matchDate && matchStatus;
  });

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Đang tải dữ liệu quản trị...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Trang Quản Trị Hệ Thống</h1>

      {/* 3 Thẻ Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Khách Hàng</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Số Lượt Đặt Sân</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-2">{stats.totalBookings}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CalendarCheck className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Doanh Thu</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">
              {stats.totalRevenue.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Bảng Quản Lý Lịch Đặt Toàn Sân */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-800">Quản Lý Lịch Đặt Toàn Sân</h2>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Tài khoản đặt</th>
                <th className="py-3 px-4 text-left">Người đặt (Khách)</th>
                <th className="py-3 px-4 text-left">Sân</th>
                <th className="py-3 px-4 text-left">Ngày & Giờ</th>
                <th className="py-3 px-4 text-left">Tổng tiền</th>
                <th className="py-3 px-4 text-left">Trạng thái</th>
                <th className="py-3 px-4 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">
                    Không có đơn đặt sân nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  // Bóc tách tên khách và số điện thoại từ note nếu có
                  const guestMatch = b.note ? b.note.match(/Khách:\s*([^-\n]+)/i) : null;
                  const phoneMatch = b.note ? b.note.match(/SĐT:\s*([^\[\n]+)/i) : null;
                  const guestName = guestMatch ? guestMatch[1].trim() : (b.user?.fullName || 'Khách vãng lai');
                  const guestPhone = phoneMatch ? phoneMatch[1].trim() : (b.user?.phoneNumber || '');

                  // Bóc tách số thảm con từ note (ví dụ: Sân 1, Sân 4)
                  const subCourtMatch = b.note ? b.note.match(/\[(Sân\s*\d+)/i) : null;
                  const subCourtName = subCourtMatch ? subCourtMatch[1] : '';

                  return (
                    <tr key={String(b._id)} className="hover:bg-gray-50/60 transition">
                      {/* 1. Tài khoản đặt */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-gray-900">{b.user?.fullName || 'Khách vãng lai'}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{b.user?.phoneNumber || 'Chưa có SĐT'}</p>
                      </td>

                      {/* 2. Người đặt (Khách) */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-emerald-800">{guestName}</p>
                        {guestPhone && (
                          <p className="text-[11px] text-gray-500 mt-0.5">{guestPhone}</p>
                        )}
                      </td>

                      {/* 3. Sân & Thảm con */}
                      <td className="py-4 px-4 font-medium text-emerald-800">
                        <div>{b.court?.name || 'Sân Cầu Lông'}</div>
                        {subCourtName && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                            {subCourtName}
                          </span>
                        )}
                      </td>

                      {/* 4. Ngày & Giờ */}
                      <td className="py-4 px-4">
                        <span className="font-semibold">{b.bookingDate}</span> ({b.startTime} - {b.endTime})
                      </td>

                      {/* 5. Tổng tiền */}
                      <td className="py-4 px-4 font-bold text-emerald-700">
                        {b.totalPrice.toLocaleString('vi-VN')} đ
                      </td>

                      {/* 6. Trạng thái */}
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* 7. Hành động */}
                      <td className="py-4 px-4">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          className={`border rounded-lg px-2.5 py-1 text-xs outline-none font-semibold transition cursor-pointer ${
                            b.status === 'CANCELLED'
                              ? 'border-red-300 bg-red-50 text-red-700'
                              : b.status === 'COMPLETED'
                              ? 'border-blue-300 bg-blue-50 text-blue-700'
                              : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}