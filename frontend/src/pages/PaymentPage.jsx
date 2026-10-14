import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ArrowLeft, CheckCircle2, Clock, Copy, Check, QrCode, Wallet, Banknote, ShieldCheck } from 'lucide-react';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState(() => {
    return location.state?.bookingData || JSON.parse(sessionStorage.getItem('pending_payment') || 'null');
  });

  const [paymentMethod, setPaymentMethod] = useState('vietqr'); // 'vietqr' | 'momo' | 'cash'
  const [copiedField, setCopiedField] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút đếm ngược

  // Cấu hình tài khoản ngân hàng nhận tiền
  const BANK_CONFIG = {
    bankId: 'TCB', // Techcombank (hoặc MB, VCB, ICB...)
    bankName: 'Techcombank (Ngân hàng Kỹ Thương)',
    accountNo: '5019205056249', // STK theo mẫu VietQR
    accountName: 'BADCOURT SYSTEM',
    template: 'compact2' // Template dạng ảnh 2
  };

  useEffect(() => {
    if (!bookingData) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Đã hết thời gian giữ chỗ thanh toán! Vui lòng đặt lại.');
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  const totalAmount = bookingData.totalPrice || 0;
  // Mã nội dung chuyển khoản gọn gàng
  const transferCode = bookingData.ticketCode 
    ? `XEVE ${bookingData.ticketCode}` 
    : `BAD ${String(bookingData.bookingId || Date.now()).slice(-6)}`;

  // TẠO LINK VIETQR CHUẨN THEO ĐÚNG CÚ PHÁP TÀI LIỆU QUICK LINK
  const vietQrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-${BANK_CONFIG.template}.png?amount=${totalAmount}&addInfo=${encodeURIComponent(transferCode)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCompletePayment = async () => {
    try {
      setSubmitting(true);
      if (bookingData.bookingId && !String(bookingData.bookingId).startsWith('TK')) {
        await axiosClient.put(`/bookings/${bookingData.bookingId}`, {
          paymentStatus: paymentMethod === 'cash' ? 'PENDING' : 'PAID',
          paymentMethod: paymentMethod,
        });
      }
      sessionStorage.removeItem('pending_payment');
      alert('🎉 Đã xác nhận thông tin thanh toán! Chúc bạn có buổi chơi vui vẻ.');
      navigate('/my-bookings');
    } catch (err) {
      console.warn(err);
      navigate('/my-bookings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Header */}
      <div className="bg-[#1b6b3e] text-white px-4 py-3.5 shadow sticky top-0 z-30 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-base font-bold uppercase tracking-wide">Thanh toán đơn hàng</h1>
        <div className="w-5"></div>
      </div>

      <div className="max-w-2xl mx-auto w-full p-4 space-y-4 flex-1">
        {/* Bộ đếm ngược thời gian */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Thời gian giữ vé còn lại:</span>
          </div>
          <span className="font-mono text-sm font-bold text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-lg">
            {formatTimer(timeLeft)}
          </span>
        </div>

        {/* Chi tiết đơn */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">
              {bookingData.ticketCode ? `Vé Sự Kiện #${bookingData.ticketCode}` : 'Chi Tiết Đặt Sân'}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Giữ chỗ tạm thời
            </span>
          </div>

          <div className="text-xs text-gray-600 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Địa điểm:</span>
              <span className="font-semibold text-gray-800 text-right">{bookingData.courtName}</span>
            </div>
            {bookingData.ticketTitle && (
              <div className="flex justify-between">
                <span className="text-gray-500">Nội dung kèo:</span>
                <span className="font-semibold text-gray-800 text-right">{bookingData.ticketTitle}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Ngày diễn ra:</span>
              <span className="font-semibold text-gray-800">{bookingData.bookingDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Khung giờ:</span>
              <span className="font-semibold text-emerald-700">{bookingData.timeRange}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="font-bold text-gray-700">Tổng tiền thanh toán:</span>
              <span className="text-base font-black text-emerald-700">{totalAmount.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>

        {/* Chọn phương thức thanh toán */}
        <div>
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">Phương thức thanh toán</h3>
          <div className="grid grid-cols-3 gap-2.5">
            <div
              onClick={() => setPaymentMethod('vietqr')}
              className={`p-3 rounded-xl border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                paymentMethod === 'vietqr'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <QrCode className="w-5 h-5 text-emerald-700" />
              <span className="text-xs">Chuyển khoản VietQR</span>
            </div>

            <div
              onClick={() => setPaymentMethod('momo')}
              className={`p-3 rounded-xl border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                paymentMethod === 'momo'
                  ? 'border-[#a50064] bg-pink-50 text-[#a50064] font-bold shadow-xs'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <Wallet className="w-5 h-5 text-[#a50064]" />
              <span className="text-xs">Ví MoMo</span>
            </div>

            <div
              onClick={() => setPaymentMethod('cash')}
              className={`p-3 rounded-xl border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                paymentMethod === 'cash'
                  ? 'border-amber-600 bg-amber-50 text-amber-800 font-bold shadow-xs'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <Banknote className="w-5 h-5 text-amber-600" />
              <span className="text-xs">Tại quầy sân</span>
            </div>
          </div>
        </div>

        {/* Khung hiển thị mã QR VietQR (Compact2) */}
        {paymentMethod === 'vietqr' && (
          <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs space-y-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Quét mã VietQR chuyển khoản tự động</span>
            </div>

            {/* Hiển thị QR VietQR Quick Link chuẩn */}
            <div className="flex justify-center py-1">
              <div className="p-3 border-2 border-dashed border-emerald-300 rounded-2xl bg-white shadow-xs">
                <img 
                  src={vietQrUrl} 
                  alt="VietQR Quick Link" 
                  className="w-64 max-w-full h-auto mx-auto rounded-lg"
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-500 italic">
              Mở App ngân hàng bất kỳ (Vietcombank, MB, Techcombank, VPBank...) quét mã để tự điền số tiền và nội dung.
            </p>

            {/* Thông tin chuyển khoản sao chép thủ công */}
            <div className="bg-gray-50 rounded-xl p-3.5 text-xs text-left space-y-2 border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Ngân hàng:</span>
                <span className="font-semibold text-gray-800">{BANK_CONFIG.bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{BANK_CONFIG.accountNo}</span>
                  <button onClick={() => handleCopy(BANK_CONFIG.accountNo, 'acc')} className="text-emerald-600 hover:text-emerald-700 cursor-pointer">
                    {copiedField === 'acc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Chủ tài khoản:</span>
                <span className="font-semibold text-gray-800">{BANK_CONFIG.accountName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Số tiền:</span>
                <span className="font-bold text-emerald-700 text-sm">{totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Nội dung CK:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">{transferCode}</span>
                  <button onClick={() => handleCopy(transferCode, 'code')} className="text-emerald-600 hover:text-emerald-700 cursor-pointer">
                    {copiedField === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'momo' && (
          <div className="bg-white rounded-2xl p-5 border border-pink-200 shadow-xs space-y-3 text-center">
            <h4 className="text-xs font-bold text-[#a50064] uppercase">Quét mã qua ví MoMo</h4>
            <div className="flex justify-center py-2">
              <div className="p-3 border-2 border-dashed border-pink-300 rounded-2xl bg-pink-50/40">
                <img src={vietQrUrl} alt="MoMo QR" className="w-56 h-auto mx-auto rounded-lg" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Mở ứng dụng MoMo và dùng tính năng "Quét mã" để hoàn tất giao dịch.</p>
          </div>
        )}

        {paymentMethod === 'cash' && (
          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 space-y-2 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold">💵 Thanh toán tiền mặt tại quầy lễ tân sân</p>
            <ul className="list-disc pl-4 space-y-1 text-gray-600">
              <li>Bạn có thể trả tiền mặt khi đến nhận sân hoặc check-in sự kiện.</li>
              <li>Vui lòng đọc đúng mã vé hoặc số điện thoại đã đặt khi đến sân.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Footer hoàn tất */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg sticky bottom-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 font-semibold">Tổng thanh toán:</span>
          <span className="text-lg font-black text-emerald-700">{totalAmount.toLocaleString('vi-VN')} đ</span>
        </div>
        <div className="max-w-2xl mx-auto">
          <button
            disabled={submitting}
            onClick={handleCompletePayment}
            className="w-full bg-[#1b6b3e] hover:bg-[#145330] text-white font-bold py-3.5 rounded-xl shadow transition text-sm uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            {submitting ? 'Đang hoàn tất đơn...' : 'TÔI ĐÃ HOÀN TẤT THANH TOÁN'}
          </button>
        </div>
      </div>
    </div>
  );
}