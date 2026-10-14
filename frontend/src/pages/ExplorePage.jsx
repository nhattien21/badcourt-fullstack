import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  Ticket, Award, Clock, Calendar, ChevronRight, Eye, Plus, Share2 
} from 'lucide-react';

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState('sukien'); // 'sukien' | 'goihoivien'
  const [courts, setCourts] = useState([]);
  const navigate = useNavigate();

  // Đồng hồ đếm ngược từng giây theo thời gian thực
  const [countdownSeconds, setCountdownSeconds] = useState(23 * 3600 + 17 * 60 + 38);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 24 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs) => {
    const h = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
    const s = String(totalSecs % 60).padStart(2, '0');
    return `Còn ${h}:${m}:${s}`;
  };

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const res = await axiosClient.get('/courts');
        setCourts(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourts();
  }, []);

  // DANH SÁCH SỰ KIỆN XÉ VÉ
  const eventList = [
    {
      id: 'ev1',
      courtName: 'Sân Cầu Lông Mai Dịch Cầu Giấy',
      address: 'Số 2 Phố Mai Dịch, Cầu Giấy, Hà Nội',
      timeText: '00:01 • 14/10/2026',
      postTag: '🔥 Sự kiện mới',
      hashtag: '#sukiensocial',
      code: '9539',
      title: 'Xé vé chiều - Khá 3-6 tháng',
      level: 'Khá 3-6 tháng',
      timeRange: '14:00 - 19:00',
      dateText: '15/10',
      subCourtName: 'Sân Cầu Lông 1',
      price: 50000,
      joinedCount: 2,
      maxCount: 8,
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600'
    },
    {
      id: 'ev2',
      courtName: 'Sân Cầu Lông Long Viên Quận 7',
      address: '414/13 Trần Xuân Soạn, Tân Hưng, Quận 7, TP.HCM',
      timeText: '06:00 • 15/10/2026',
      postTag: '🔥 Kèo tối hot',
      hashtag: '#keobadminton',
      code: '18777',
      title: 'Kèo giao lưu Pro 6 tháng - 1 năm+',
      level: 'Pro 6 tháng - 1 năm+',
      timeRange: '17:00 - 20:00',
      dateText: '15/10',
      subCourtName: 'Sân Cầu Lông 2',
      price: 79000,
      joinedCount: 5,
      maxCount: 12,
      image: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=600'
    },
    {
      id: 'ev3',
      courtName: 'Sân Cầu Lông Cẩm Nhung Gò Vấp',
      address: '92/2 Thống Nhất, Phường 10, Gò Vấp, TP.HCM',
      timeText: '08:30 • 16/10/2026',
      postTag: '🏸 Kèo sáng sớm',
      hashtag: '#caulongsaigon',
      code: '20412',
      title: 'Đánh đơn rèn thể lực & căn bản',
      level: 'Mới chơi 1-3 tháng',
      timeRange: '06:00 - 08:30',
      dateText: '16/10',
      subCourtName: 'Sân 3',
      price: 45000,
      joinedCount: 1,
      maxCount: 6,
      image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=600'
    },
    {
      id: 'ev4',
      courtName: 'Sân Cầu Lông Bông Sao Quận 8',
      address: 'Số 58/10 Bông Sao, Phường 5, Quận 8, TP.HCM',
      timeText: '12:00 • 16/10/2026',
      postTag: '🏆 Kèo đôi nam nữ',
      hashtag: '#giaoluucaulong',
      code: '31580',
      title: 'Kèo đôi cọ xát nâng cao trên 1 năm+',
      level: 'Trên 1 năm+',
      timeRange: '18:00 - 21:00',
      dateText: '16/10',
      subCourtName: 'Sân VIP 1',
      price: 85000,
      joinedCount: 4,
      maxCount: 10,
      image: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=600'
    }
  ];

  // DANH SÁCH NHIỀU SÂN KHÁC NHAU VỚI CÁC GÓI HỘI VIÊN ĐA DẠNG
  const membershipClubs = [
    // 1. CLB CẦU LÔNG TƯƠNG MAI
    {
      id: 'club_tm',
      courtName: 'CLB CẦU LÔNG TƯƠNG MAI',
      logo: 'TM',
      logoBg: 'bg-black text-amber-400',
      address: 'NGÕ 104 NGUYỄN AN NINH (CÁCH NHÀ THI ĐẤU TƯƠNG MAI 30M)',
      timeText: '09:15 • 18/05/2026',
      headline: 'Chơi thả ga với gói hội viên ưu đãi',
      hashtag: '#uudaigoihoivien',
      packages: [
        {
          num: 1,
          name: 'Thẻ hội viên',
          badgeText: 'XÉ VÉ CHIỀU 14H-17H : GIÁ 80K/VÉ',
          title: 'COMBO CHIỀU 14H-17H : 10 VÉ TẶNG 1 VÉ',
          openSale: '14/05/2026 - 31/12/2026',
          duration: '6 Tháng',
          freeTickets: 11,
          sportType: 'Cầu lông',
          price: 720000
        },
        {
          num: 2,
          name: 'Thẻ hội viên',
          badgeText: 'XÉ VÉ CHIỀU 14H-17H : GIÁ 80K/VÉ',
          title: 'COMBO CHIỀU 14H-17H : 20 VÉ TẶNG 2 VÉ',
          openSale: '14/05/2026 - 31/12/2026',
          duration: '6 Tháng',
          freeTickets: 22,
          sportType: 'Cầu lông',
          price: 1440000
        }
      ]
    },

    // 2. SÂN CẦU LÔNG LONG VIÊN QUẬN 7
    {
      id: 'club_lv',
      courtName: 'SÂN CẦU LÔNG LONG VIÊN QUẬN 7',
      logo: 'LV',
      logoBg: 'bg-emerald-800 text-white',
      address: '414/13 TRẦN XUÂN SOẠN, TÂN HƯNG, QUẬN 7, TP.HCM',
      timeText: '10:00 • 01/06/2026',
      headline: 'Hội viên VIP sân sàn gỗ thi đấu tiêu chuẩn BWF',
      hashtag: '#hoiVienLongVienQ7',
      packages: [
        {
          num: 1,
          name: 'Gói Tháng Cố Định',
          badgeText: 'ƯU TIÊN GIỮ THẢM GIỜ VÀNG 18H-21H',
          title: 'GÓI CỐ ĐỊNH THÁNG : 12 BUỔI TỐI TIẾT KIỆM',
          openSale: '01/06/2026 - 31/12/2026',
          duration: '1 Tháng',
          freeTickets: 12,
          sportType: 'Cầu lông',
          price: 1250000
        },
        {
          num: 2,
          name: 'Gói Quý Hội Viên',
          badgeText: 'TẶNG 3 HỘP CẦU THI ĐẤU + GIẢM 15% NƯỚC',
          title: 'COMBO QUÝ : 36 BUỔI ĐÁNH THOẢI MÁI',
          openSale: '01/06/2026 - 31/12/2026',
          duration: '3 Tháng',
          freeTickets: 36,
          sportType: 'Cầu lông',
          price: 3450000
        }
      ]
    },

    // 3. SÂN CẦU LÔNG MAI DỊCH CẦU GIẤY
    {
      id: 'club_md',
      courtName: 'SÂN CẦU LÔNG MAI DỊCH CẦU GIẤY',
      logo: 'MD',
      logoBg: 'bg-blue-700 text-white',
      address: 'SỐ 2 PHỐ MAI DỊCH, QUẬN CẦU GIẤY, HÀ NỘI',
      timeText: '14:20 • 15/06/2026',
      headline: 'Gói tập luyện & giao lưu nhóm câu lạc bộ sinh viên',
      hashtag: '#clbMaiDichCauGiay',
      packages: [
        {
          num: 1,
          name: 'Thẻ HSSV Ưu Đãi',
          badgeText: 'DÀNH RIÊNG HỌC SINH - SINH VIÊN GIỜ NGÀY',
          title: 'COMBO 10 VÉ RÈN THỂ LỰC (5H - 17H)',
          openSale: '01/01/2026 - 31/12/2026',
          duration: '3 Tháng',
          freeTickets: 10,
          sportType: 'Cầu lông',
          price: 490000
        },
        {
          num: 2,
          name: 'Thẻ Tập Tự Do',
          badgeText: 'KHÔNG GIỚI HẠN BUỔI SÁNG TẤT CẢ CÁC NGÀY',
          title: 'GÓI THÁNG BAN MAI (6H00 - 9H00 HÀNG NGÀY)',
          openSale: '01/01/2026 - 31/12/2026',
          duration: '1 Tháng',
          freeTickets: 30,
          sportType: 'Cầu lông',
          price: 750000
        }
      ]
    },

    // 4. SÂN CẦU LÔNG BÔNG SAO QUẬN 8
    {
      id: 'club_bs',
      courtName: 'SÂN CẦU LÔNG BÔNG SAO QUẬN 8',
      logo: 'BS',
      logoBg: 'bg-amber-600 text-white',
      address: 'SỐ 58/10 BÔNG SAO, PHƯỜNG 5, QUẬN 8, TP.HCM',
      timeText: '11:00 • 20/06/2026',
      headline: 'Gia nhập hội viên thân thiện, sân mát mẻ trần cao',
      hashtag: '#bongSaoQuan8',
      packages: [
        {
          num: 1,
          name: 'Thẻ Kèo Đôi',
          badgeText: 'XÉ VÉ GHÉP ĐÔI KHUNG GIỜ VÀNG TỐI',
          title: 'COMBO 15 VÉ GIAO LƯU CHIỀU TỐI TẶNG 2 VÉ',
          openSale: '01/06/2026 - 31/12/2026',
          duration: '4 Tháng',
          freeTickets: 17,
          sportType: 'Cầu lông',
          price: 1100000
        }
      ]
    },

    // 5. SÂN CẦU LÔNG CẨM NHUNG GÒ VẤP
    {
      id: 'club_cn',
      courtName: 'SÂN CẦU LÔNG CẨM NHUNG GÒ VẤP',
      logo: 'CN',
      logoBg: 'bg-rose-700 text-white',
      address: '92/2 THỐNG NHẤT, PHƯỜNG 10, GÒ VẤP, TP.HCM',
      timeText: '08:00 • 01/07/2026',
      headline: 'Thẻ hội viên tích hạt điểm & bảo lưu linh hoạt',
      hashtag: '#camNhungGoVap',
      packages: [
        {
          num: 1,
          name: 'Gói Năm Gold VIP',
          badgeText: 'GIẢM TRỰC TIẾP 30% KHI MUA NƯỚC VÀ PHỤ KIỆN',
          title: 'THẺ NĂM TOÀN NĂNG : 120 BUỔI + TẶNG 1 VỢT CAO CẤP',
          openSale: '01/01/2026 - 31/12/2026',
          duration: '12 Tháng',
          freeTickets: 120,
          sportType: 'Cầu lông',
          price: 5900000
        }
      ]
    }
  ];

  const handleBuyTicket = (ev) => {
    const matchedCourt = courts[0] || { _id: 'court_fallback', name: ev.courtName, description: ev.address };
    const ticketObj = {
      id: ev.id,
      code: ev.code,
      title: ev.title,
      level: ev.level,
      time: ev.timeRange,
      date: '2026-10-15',
      price: ev.price,
      maxCount: ev.maxCount,
      joinedCount: ev.joinedCount,
      note: 'Giá vé bao gồm 1 nước suối/người và cầu thi đấu Yonex/Ba Sao tiêu chuẩn.'
    };
    sessionStorage.setItem(`ticket_${ev.id}`, JSON.stringify({ ticket: ticketObj, court: matchedCourt }));
    navigate(`/ticket/${ev.id}`, { state: { ticket: ticketObj, court: matchedCourt } });
  };

  const handleRegisterMembership = (pkg, club) => {
    const paymentData = {
      bookingId: `MB${Date.now().toString().slice(-6)}`,
      courtName: club.courtName,
      bookingDate: '2026-10-14',
      timeRange: `Gói Hội Viên: ${pkg.title}`,
      totalPrice: pkg.price,
      ticketTitle: pkg.title
    };
    sessionStorage.setItem('pending_payment', JSON.stringify(paymentData));
    navigate('/payment', { state: { bookingData: paymentData } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 select-none">
      {/* Header trang Khám phá */}
      <div className="bg-white border-b border-gray-200 py-3 text-center sticky top-0 z-30 shadow-xs">
        <h1 className="text-base font-extrabold text-[#00a84e] uppercase tracking-wider">
          KHÁM PHÁ
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-3">
        {/* 2 TAB: SỰ KIỆN & GÓI HỘI VIÊN */}
        <div className="flex items-center gap-3 py-2 border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('sukien')}
            className={`flex-1 py-2 rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer text-xs font-bold ${
              activeTab === 'sukien' 
                ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xs ring-1 ring-purple-200' 
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Ticket className="w-4 h-4 text-purple-600" />
            <span>Sự kiện</span>
          </button>

          <button 
            onClick={() => setActiveTab('goihoivien')}
            className={`flex-1 py-2 rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer text-xs font-bold ${
              activeTab === 'goihoivien' 
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-200' 
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Gói hội viên</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: SỰ KIỆN XÉ VÉ (CÓ TIME CHẠY THẬT) */}
        {/* ======================================================== */}
        {activeTab === 'sukien' && (
          <div className="space-y-4 mt-3">
            {eventList.map((ev, index) => {
              const currentEventSecs = countdownSeconds - (index * 350);

              return (
                <div key={ev.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={ev.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-gray-900">{ev.courtName}</h3>
                        <p className="text-[11px] text-gray-500">{ev.address}</p>
                        <p className="text-[10px] text-gray-400">{ev.timeText}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-800">{ev.postTag}</p>
                    <p className="text-xs font-semibold text-emerald-600">{ev.hashtag}</p>
                  </div>

                  {/* Khung cuống vé */}
                  <div className="border border-emerald-300 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="flex">
                      <div className="w-24 bg-pink-50 p-2.5 flex flex-col justify-center items-center text-center border-r border-dashed border-gray-200">
                        <span className="text-xs font-black text-blue-600">{ev.timeRange.split(' - ')[0]}</span>
                        <div className="w-0.5 h-2 bg-gray-300 my-0.5"></div>
                        <span className="text-xs font-black text-blue-600">{ev.timeRange.split(' - ')[1]}</span>
                        <span className="text-[10px] text-gray-500 font-medium mt-1">{ev.dateText}</span>
                      </div>

                      <div className="flex-1 p-3 flex justify-between items-center relative">
                        <div className="space-y-1 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <Clock className="w-3 h-3 text-white" />
                              <span>{formatCountdown(currentEventSecs)}</span>
                            </span>

                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              Xé vé
                            </span>

                            <span className="text-[10px] font-semibold text-gray-400">
                              #{ev.code}
                            </span>
                          </div>

                          <h4 className="font-bold text-xs text-gray-900 mt-1">{ev.title}</h4>
                          <p className="text-[11px] text-emerald-700 font-medium">🏸 {ev.subCourtName}</p>
                          <p className="text-sm font-black text-amber-600">{ev.price.toLocaleString('vi-VN')} đ <span className="text-xs font-normal text-gray-500">/ vé</span></p>
                        </div>

                        <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0 relative">
                          <img src={ev.image} alt="" className="w-full h-full object-cover" />
                          <button className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-gray-600 absolute top-1 right-1 shadow">
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 bg-gray-50/80 border-t border-dashed border-gray-200 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {ev.joinedCount}/{ev.maxCount}
                      </span>
                      <span className="text-gray-400">Đã đăng ký</span>
                    </div>

                    <div className="p-2.5 bg-white border-t border-gray-100 flex items-center justify-between gap-3">
                      <button 
                        onClick={() => handleBuyTicket(ev)}
                        className="flex-1 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-50 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        <span>Xem chi tiết</span>
                      </button>
                      <button 
                        onClick={() => handleBuyTicket(ev)}
                        className="flex-1 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Mua vé</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: GÓI HỘI VIÊN (ĐẦY ĐỦ CÁC SÂN KHÁC NHAU) */}
        {/* ======================================================== */}
        {activeTab === 'goihoivien' && (
          <div className="space-y-5 mt-3">
            {membershipClubs.map((club) => (
              <div key={club.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
                {/* Header sân */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center font-black text-sm flex-shrink-0 ${club.logoBg}`}>
                    {club.logo}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-xs text-gray-900 uppercase truncate">{club.courtName}</h3>
                    <p className="text-[11px] text-gray-500 truncate">{club.address}</p>
                    <p className="text-[10px] text-gray-400">{club.timeText}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-800">{club.headline}</p>
                  <p className="text-xs font-semibold text-emerald-600">{club.hashtag}</p>
                </div>

                {/* Danh sách các gói combo của sân */}
                <div className="space-y-3">
                  {club.packages.map((pkg) => (
                    <div key={pkg.num} className="border border-emerald-300 rounded-2xl p-3.5 bg-white shadow-xs relative">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                          {pkg.num}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          {pkg.name}
                        </span>
                      </div>

                      <p className="text-[11px] font-bold text-emerald-700">{pkg.badgeText}</p>
                      <h4 className="text-xs font-extrabold text-gray-900 mt-0.5">{pkg.title}</h4>

                      <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Mở bán: {pkg.openSale}</span>
                      </p>

                      <div className="grid grid-cols-3 gap-2 py-2.5 mt-2 border-y border-dashed border-gray-200 text-center">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Thời hạn</span>
                          <span className="text-xs font-bold text-amber-600">{pkg.duration}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Miễn phí</span>
                          <span className="text-xs font-bold text-amber-600">{pkg.freeTickets}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Loại sân</span>
                          <span className="text-xs font-bold text-amber-600">{pkg.sportType}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="text-base font-black text-emerald-700">
                          {pkg.price.toLocaleString('vi-VN')} đ
                        </span>

                        <button 
                          onClick={() => handleRegisterMembership(pkg, club)}
                          className="bg-[#00a84e] hover:bg-[#008f42] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-xs transition cursor-pointer"
                        >
                          <span>Đăng ký</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}