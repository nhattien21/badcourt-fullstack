import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ArrowLeft, Share2, DollarSign, Calendar, MapPin, FileText, Users, Minus, Plus } from 'lucide-react';

export default function TicketDetail() {
  const { ticketId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(location.state?.ticket || null);
  const [court, setCourt] = useState(location.state?.court || null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ticket) {
      const cached = sessionStorage.getItem(`ticket_${ticketId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setTicket(parsed.ticket);
        setCourt(parsed.court);
      } else {
        navigate('/');
      }
    }
  }, [ticketId]);

  if (!ticket || !court) {
    return <div className="p-8 text-center text-gray-500">Đang tải thông tin sự kiện...</div>;
  }

  const unitPrice = ticket.price || 80000;
  const totalPrice = unitPrice * quantity;

  const handleBookingTicket = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!token || !user) {
      alert('Vui lòng đăng nhập để đặt vé xé vé!');
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosClient.post('/bookings', {
        courtId: court._id,
        bookingDate: ticket.date,
        startTime: ticket.time.split(' - ')[0],
        endTime: ticket.time.split(' - ')[1],
        totalPrice: totalPrice,
        note: `[XÉ VÉ #${ticket.code}] ${ticket.title} - Số lượng: ${quantity} vé - Khách: ${user.fullName} (${user.phoneNumber})`
      });

      const createdBooking = res.data?.data;

      const paymentData = {
        bookingId: createdBooking?._id || `TK${Date.now()}`,
        courtName: court.name,
        bookingDate: ticket.date,
        timeRange: `${ticket.time} (${quantity} vé)`,
        totalPrice: totalPrice,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        ticketCode: ticket.code,
        ticketTitle: ticket.title
      };

      sessionStorage.setItem('pending_payment', JSON.stringify(paymentData));
      navigate('/payment', { state: { bookingData: paymentData } });
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi đặt vé, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div className="bg-[#1b6b3e] text-white px-4 py-3 shadow sticky top-0 z-30 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-white/10 rounded-full cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-base font-bold tracking-wide">Thông tin sự kiện</h1>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Đã sao chép link sự kiện!');
          }} 
          className="p-1.5 hover:bg-white/10 rounded-full cursor-pointer"
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto w-full p-4 space-y-4 flex-1">
        {/* Thông tin sân */}
        <div>
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Thông tin sân</h2>
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
              <img 
                src={court.images?.[0] || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400'} 
                alt="" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm text-gray-800">{court.name}</h3>
              <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>{court.description || 'Hà Nội'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Khung vé sự kiện */}
        <div>
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Thông tin sự kiện</h2>
          <div className="bg-[#ecfdf5] border-2 border-emerald-400/80 rounded-2xl p-4 relative shadow-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed border-emerald-300">
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                #{ticket.code}
              </span>
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
                🏸 Cầu lông
              </span>
              {/* Badge Trình độ theo chữ */}
              <span className="text-[11px] font-bold text-white bg-blue-600 px-3 py-0.5 rounded-full shadow-xs">
                {ticket.level}
              </span>
            </div>

            <h3 className="font-bold text-sm text-gray-900 mb-3">{ticket.title}</h3>

            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Giá vé
                </span>
                <span className="font-bold text-gray-900 text-sm">{unitPrice.toLocaleString('vi-VN')} đ</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-emerald-600" /> Ngày
                </span>
                <span className="font-bold text-gray-800">{ticket.date.split('-').reverse().join('/')}</span>
              </div>

              <div className="flex items-start justify-between">
                <span className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Sân & Thời gian
                </span>
                <div className="text-right">
                  <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                    {ticket.time} | Sân 1
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-emerald-200">
                <p className="flex items-start gap-1.5 text-gray-500 text-[11px] leading-relaxed">
                  <FileText className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Ghi chú:</strong> {ticket.note || 'Giá vé bao gồm 1 nước suối/người và cầu thi đấu tiêu chuẩn.'}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-emerald-600" /> Người tham gia
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {ticket.joinedCount}/{ticket.maxCount} &gt;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bộ chọn số lượng */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">Số lượng vé muốn đặt</span>
          <div className="flex items-center gap-3">
            <button 
              disabled={quantity <= 1}
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-base w-6 text-center text-gray-900">{quantity}</span>
            <button 
              disabled={quantity >= (ticket.maxCount - ticket.joinedCount)}
              onClick={() => setQuantity(q => q + 1)}
              className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer xác nhận */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg sticky bottom-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-600">Tổng ({quantity} Vé)</span>
          <span className="text-lg font-black text-emerald-700">{totalPrice.toLocaleString('vi-VN')} đ</span>
        </div>
        <div className="max-w-2xl mx-auto">
          <button 
            disabled={submitting}
            onClick={handleBookingTicket}
            className="w-full bg-[#1b6b3e] hover:bg-[#145330] text-white font-bold py-3.5 rounded-xl shadow transition text-sm uppercase tracking-wider cursor-pointer"
          >
            {submitting ? 'Đang chuyển sang thanh toán...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
}