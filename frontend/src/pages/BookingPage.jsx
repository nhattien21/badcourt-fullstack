import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ArrowLeft, Calendar as CalendarIcon, X } from 'lucide-react';

// Chuyển chuỗi "HH:mm" thành số phút trong ngày
const timeStrToMinutes = (tStr) => {
  const [h, m] = tStr.split(':').map(Number);
  return h * 60 + (m || 0);
};

// Chuyển số phút thành định dạng "H:mm" hoặc "HH:mm"
const minutesToTimeStr = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${m === 0 ? '00' : m}`;
};

// Hàm băm sinh số cố định theo ID sân
const getCourtHash = (court) => {
  if (!court) return 0;
  let hash = 0;
  const str = court._id || court.name || 'court_seed';
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
};

// Tạo danh sách các mốc thời gian 30 phút theo giờ mở/đóng cửa
const getCourtTimeSlots = (court) => {
  let openH = 5;
  let closeH = 22;

  if (court) {
    const isUni = court.name.toLowerCase().includes('đh') || court.name.toLowerCase().includes('trường');
    const isClub = court.name.toLowerCase().includes('club') || court.name.toLowerCase().includes('vip') || court.name.toLowerCase().includes('sport');
    const hash = getCourtHash(court);

    if (isUni) {
      openH = 7;
      closeH = 21;
    } else if (isClub) {
      openH = 5;
      closeH = 23;
    } else {
      openH = 5 + (hash % 2);
      closeH = 22 + (hash % 2);
    }
  }

  const slots = [];
  for (let h = openH; h <= closeH; h++) {
    slots.push(`${h}:00`);
    if (h < closeH) {
      slots.push(`${h}:30`);
    }
  }
  return { openH, closeH, slots };
};

// Số lượng thảm con
const getCourtSubCourts = (court) => {
  if (!court) return [{ id: '1', name: 'Sân 1' }, { id: '2', name: 'Sân 2' }];
  const hash = getCourtHash(court);
  const count = 4 + (hash % 4); // 4 -> 7 sân

  return Array.from({ length: count }, (_, idx) => ({
    id: `${idx + 1}`,
    name: `Sân ${idx + 1}`
  }));
};

export default function BookingPage() {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const dateInputRef = useRef(null);

  const [step, setStep] = useState(1);
  // Mặc định vào ngày 11/10/2026
  const [date, setDate] = useState('2026-10-11');
  const [currentClub, setCurrentClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  const [subCourts, setSubCourts] = useState([]);
  const [timeSlotsData, setTimeSlotsData] = useState({ openH: 5, closeH: 22, slots: [] });
  const [bookedMap, setBookedMap] = useState({});
  const [selectedSlotKeys, setSelectedSlotKeys] = useState({});

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCourtAndBookings = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      const clubRes = await axiosClient.get(`/courts/${courtId}`);
      const clubData = clubRes.data.data;
      setCurrentClub(clubData);

      const subs = getCourtSubCourts(clubData);
      setSubCourts(subs);

      const tData = getCourtTimeSlots(clubData);
      setTimeSlotsData(tData);

      // Tải các đơn đặt từ backend để bôi đỏ
      let realBookings = [];
      try {
        const bookRes = await axiosClient.get(`/bookings/court/${courtId}?date=${date}`);
        realBookings = bookRes.data.data || [];
      } catch (e) {
        try {
          const allRes = await axiosClient.get('/admin/bookings');
          realBookings = (allRes.data.data || []).filter(
            (b) =>
              String(b.court?._id || b.court) === String(courtId) &&
              b.bookingDate === date &&
              b.status !== 'CANCELLED'
          );
        } catch (err) {
          console.warn(err);
        }
      }

      // Đánh dấu các mốc 30 phút đã bị đặt
      const newBookedMap = {};
      realBookings.forEach((b) => {
        if (b.status === 'CANCELLED') return;
        const startMin = timeStrToMinutes(b.startTime || '08:00');
        const endMin = timeStrToMinutes(b.endTime || '09:00');

        let matchedSubId = '1';
        if (b.note) {
          const match = b.note.match(/Sân\s*(\d+)/i);
          if (match && match[1]) matchedSubId = match[1];
        }

        for (let m = startMin; m < endMin; m += 30) {
          const slotStr = minutesToTimeStr(m);
          newBookedMap[`sub_${matchedSubId}_time_${slotStr}`] = true;
        }
      });

      setBookedMap(newBookedMap);

      const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (savedUser) {
        setFullName(savedUser.fullName || '');
        setPhoneNumber(savedUser.phoneNumber || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedSlotKeys({});
    fetchCourtAndBookings();

    const interval = setInterval(() => {
      fetchCourtAndBookings(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [courtId, date]);

  // LOGIC GIÁ CỐ ĐỊNH TỰ ĐỘNG CHO TẤT CẢ CÁC SÂN
  const basePricePerHour = currentClub ? currentClub.pricePerHour : 0;
  const isFree = basePricePerHour === 0;

  // Xác định ngày đang chọn là Thứ mấy:
  // new Date(date).getDay() trả về: 0 = Chủ Nhật, 6 = Thứ Bảy
  const selectedDayOfWeek = new Date(date + 'T00:00:00').getDay();
  const isWeekend = selectedDayOfWeek === 0 || selectedDayOfWeek === 6; // T7 hoặc CN

  // 1. Khung giờ tối (18h - 22h): Cả tuần giữ nguyên giá mặc định niêm yết
  const fixedPeakPricePerHour = isFree ? 0 : basePricePerHour;

  // 2. Khung giờ ban ngày (trước 18h):
  // - T7 - CN: Giảm 10.000 đ/h so với giá mặc định
  // - T2 - T6: Giảm 20.000 đ/h so với giá mặc định
  const fixedOffPeakPricePerHour = isFree
    ? 0
    : isWeekend
      ? Math.max(0, basePricePerHour - 10000)
      : Math.max(0, basePricePerHour - 20000);

  // Tính giá mỗi ô 30 phút theo bảng Cố Định
  const getSlotPrice = (slotTimeStr) => {
    if (isFree) return 0;
    const hour = parseInt(slotTimeStr.split(':')[0], 10);
    const hourlyRate = hour >= 18 ? fixedPeakPricePerHour : fixedOffPeakPricePerHour;
    return Math.round(hourlyRate / 2); // Mỗi slot 30 phút = 1/2 giá 1 giờ
  };

  const getSlotKey = (subId, slotTimeStr) => `sub_${subId}_time_${slotTimeStr}`;

  // KIỂM TRA THỜI GIAN THỰC ĐỂ KHÓA VÀ BÔI XÁM
  const isSlotPastRealTime = (slotTimeStr) => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (date < todayStr) return true;

    if (date === todayStr) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const slotMinutes = timeStrToMinutes(slotTimeStr);
      return slotMinutes <= currentMinutes;
    }

    return false;
  };

  // Trạng thái ô
  const getSlotState = (subId, slotTimeStr) => {
    const key = getSlotKey(subId, slotTimeStr);
    if (selectedSlotKeys[key]) return 'selected';
    if (isSlotPastRealTime(slotTimeStr)) return 'locked';
    if (bookedMap[key]) return 'booked';
    return 'available';
  };

  const handleToggleSlot = (subId, slotTimeStr) => {
    const state = getSlotState(subId, slotTimeStr);
    if (state === 'locked' || state === 'booked') return;

    const key = getSlotKey(subId, slotTimeStr);
    setSelectedSlotKeys((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  };

  const activeKeys = Object.keys(selectedSlotKeys).filter((k) => selectedSlotKeys[k]);
  const totalSlotsCount = activeKeys.length;
  const totalHoursFloat = totalSlotsCount * 0.5;

  const totalPrice = activeKeys.reduce((sum, key) => {
    const timeStr = key.split('_time_')[1];
    return sum + getSlotPrice(timeStr);
  }, 0);

  // Gom các slot 30 phút liên tiếp thành khoảng thời gian
  const getSelectedSummary = () => {
    const groups = {};
    activeKeys.forEach((key) => {
      const parts = key.split('_time_');
      const subId = parts[0].replace('sub_', '');
      const timeStr = parts[1];
      const subName = subCourts.find((s) => s.id === subId)?.name || `Sân ${subId}`;
      if (!groups[subName]) groups[subName] = [];
      groups[subName].push(timeStrToMinutes(timeStr));
    });

    return Object.entries(groups).map(([subName, minuteList]) => {
      minuteList.sort((a, b) => a - b);
      const timeRanges = [];
      let start = minuteList[0];
      let prev = minuteList[0];

      for (let i = 1; i < minuteList.length; i++) {
        if (minuteList[i] === prev + 30) {
          prev = minuteList[i];
        } else {
          timeRanges.push(`${minutesToTimeStr(start)} - ${minutesToTimeStr(prev + 30)}`);
          start = minuteList[i];
          prev = minuteList[i];
        }
      }
      timeRanges.push(`${minutesToTimeStr(start)} - ${minutesToTimeStr(prev + 30)}`);

      const subPrice = minuteList.reduce((s, m) => s + getSlotPrice(minutesToTimeStr(m)), 0);
      const firstMin = minuteList[0];
      const lastMin = minuteList[minuteList.length - 1] + 30;

      return {
        subName,
        ranges: timeRanges.join(', '),
        hoursCount: (minuteList.length * 0.5).toFixed(1),
        price: subPrice,
        startTime: minutesToTimeStr(firstMin),
        endTime: minutesToTimeStr(lastMin)
      };
    });
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) {
      alert('Vui lòng nhập đầy đủ Tên và Số điện thoại!');
      return;
    }

    try {
      setSubmitting(true);
      const summaryList = getSelectedSummary();

      const bookingPromises = summaryList.map((item) => {
        const payload = {
          courtId: currentClub?._id,
          bookingDate: date,
          startTime: item.startTime,
          endTime: item.endTime,
          durationHours: parseFloat(item.hoursCount),
          totalPrice: item.price,
          note: `Khách: ${fullName} - SĐT: ${phoneNumber} [${item.subName}: ${item.ranges}]`
        };
        return axiosClient.post('/bookings', payload);
      });

      const responses = await Promise.all(bookingPromises);
      const firstCreated = responses[0]?.data?.data;

      // Chuẩn bị dữ liệu để chuyển sang trang Thanh toán
      const paymentData = {
        bookingId: firstCreated?._id,
        courtName: currentClub?.name,
        bookingDate: date,
        timeRange: summaryList.map(s => `${s.subName} (${s.ranges})`).join(', '),
        totalPrice: totalPrice,
        fullName,
        phoneNumber
      };

      sessionStorage.setItem('pending_payment', JSON.stringify(paymentData));
      navigate('/payment', { state: { bookingData: paymentData } });
    } catch (err) {
      alert(err.response?.data?.message || 'Khung giờ này đã có người đặt trước!');
      fetchCourtAndBookings(true);
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-white font-medium">Đang tải bảng lịch trực quan...</div>;
  }

  const summary = getSelectedSummary();

  return (
    <div className="min-h-screen bg-[#064e2b] text-white flex flex-col justify-between select-none">
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Header thanh điều hướng */}
            <div className="px-4 py-3 border-b border-emerald-800/60 flex items-center justify-between">
              <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-full cursor-pointer">
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>

              <div className="text-center">
                <h1 className="text-base font-bold text-white uppercase tracking-wide">
                  ĐẶT LỊCH THEO SÂN - TRỰC QUAN (NỬA GIỜ)
                </h1>
                <p className="text-xs text-amber-300 font-semibold">
                  {currentClub?.name} ({subCourts.length} sân) • Mở cửa: {timeSlotsData.openH}:00 - {timeSlotsData.closeH}:00
                </p>
              </div>

              {/* Nút chọn ngày */}
              <div 
                onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.focus()}
                className="relative flex items-center bg-[#25734c] hover:bg-[#2d885a] px-3 py-1.5 rounded-lg cursor-pointer transition shadow"
              >
                <span className="text-xs font-bold text-white tracking-wider mr-2">
                  {date.split('-').reverse().join('/')}
                </span>
                <CalendarIcon className="w-4 h-4 text-white" />
                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            {/* Chú thích màu sắc */}
            <div className="px-4 py-2.5 bg-[#043b20] flex items-center gap-4 text-xs font-semibold flex-wrap">
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 bg-white border border-gray-300 rounded-xs"></span><span>Trống</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 bg-[#ff6b6b] rounded-xs"></span><span>Đã đặt</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 bg-[#9ca3af] rounded-xs"></span><span>Đã qua giờ (Khoá)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-4 bg-[#d4edda] border border-gray-900 rounded-xs"></span><span>Đang chọn</span></div>

              <button onClick={() => setIsPriceModalOpen(true)} className="underline text-emerald-300 ml-auto hover:text-white cursor-pointer font-bold">
                Xem bảng giá chi tiết
              </button>
            </div>

            <div className="bg-[#e8f5e9] text-[#b45309] text-xs py-2 px-4 text-center font-medium">
              <span className="font-bold">Lưu ý:</span> Mỗi ô tương ứng 30 phút. Bạn có thể chọn lẻ 30 phút hoặc chọn nhiều ô liên tiếp để đặt 1h, 1h30, 2h...
            </div>

            {/* BẢNG LƯỚI KHUNG GIỜ NỬA TIẾNG (30 PHÚT) */}
            <div className="overflow-x-auto bg-[#e8f5e9] border-b border-emerald-900 scrollbar-thin">
              <div className="min-w-[1650px]">
                {/* Dòng mốc thời gian */}
                <div className="flex border-b border-emerald-300 bg-[#c8e6c9] text-[11px] text-gray-700 font-semibold py-1.5">
                  <div className="w-20 flex-shrink-0 text-center font-bold">Thảm</div>
                  {timeSlotsData.slots.map((slot) => (
                    <div key={slot} className="w-12 flex-shrink-0 text-center border-l border-emerald-300/80">
                      {slot}
                    </div>
                  ))}
                </div>

                {/* Các dòng thảm con */}
                {subCourts.map((court) => (
                  <div key={court.id} className="flex border-b border-gray-300 items-stretch h-10">
                    <div className="w-20 flex-shrink-0 bg-[#dcfce7] text-gray-800 text-xs font-bold flex items-center justify-center border-r border-gray-300">
                      {court.name}
                    </div>

                    {timeSlotsData.slots.map((slot) => {
                      const state = getSlotState(court.id, slot);
                      let cellClass = 'bg-white hover:bg-emerald-50 cursor-pointer border-r border-gray-300';
                      if (state === 'locked') cellClass = 'bg-[#a3a3a3] border-r border-gray-400 cursor-not-allowed';
                      if (state === 'booked') cellClass = 'bg-[#ff6b6b] border-r border-red-300 cursor-not-allowed pointer-events-none';
                      if (state === 'selected') cellClass = 'bg-[#d4edda] text-emerald-900 border-2 border-gray-900 cursor-pointer font-bold';

                      return (
                        <div
                          key={slot}
                          onClick={() => handleToggleSlot(court.id, slot)}
                          title={`${court.name}: ${slot} (${state})`}
                          className={`w-12 flex-shrink-0 transition-colors ${cellClass}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Thanh tổng kết dưới đáy */}
          <div className="bg-[#043b20] border-t border-emerald-800 shadow-xl">
            <div className="flex justify-between items-center px-6 py-2.5 text-sm font-bold">
              <div>
                Tổng thời gian: <span className="text-white text-base">{totalHoursFloat} tiếng</span> ({totalSlotsCount} ô / {summary.length} sân)
              </div>
              <div>
                Tổng tiền: <span className="text-white text-base">{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div className="px-4 pb-3">
              <button
                disabled={totalSlotsCount === 0}
                onClick={() => setStep(2)}
                className={`w-full py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider shadow transition ${
                  totalSlotsCount > 0
                    ? 'bg-[#e69b24] hover:bg-[#cf8819] text-white cursor-pointer'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                TIẾP THEO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BƯỚC 2: XÁC NHẬN VÀ THANH TOÁN */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 border-b border-emerald-800 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="p-1 hover:bg-white/10 rounded-full cursor-pointer">
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-base font-bold uppercase tracking-wide">XÁC NHẬN THÔNG TIN ĐẶT SÂN</h1>
              <div className="w-6"></div>
            </div>

            <div className="p-4 max-w-2xl mx-auto space-y-4">
              <div className="bg-[#033b20] p-4 rounded-xl border border-emerald-800 space-y-3">
                <h3 className="font-bold text-amber-300 text-sm">🏟️ {currentClub?.name}</h3>
                <p className="text-xs text-gray-300">Địa chỉ: {currentClub?.description}</p>
                <p className="text-xs text-gray-300">Ngày đặt: <span className="font-semibold text-white">{date}</span></p>

                <div className="pt-2 border-t border-emerald-900/80 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-300 uppercase">
                    <span>CHI TIẾT SỐ SÂN & KHUNG GIỜ ĐÃ CHỌN ({summary.length} sân):</span>
                  </div>

                  {summary.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-emerald-950/70 p-2.5 rounded-lg border border-emerald-800/60 shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span className="font-bold text-amber-300 text-sm">{item.subName}:</span>
                        <span className="text-white font-medium">{item.ranges} ({item.hoursCount}h)</span>
                      </div>
                      <span className="font-bold text-amber-300 text-sm">{item.price.toLocaleString('vi-VN')} đ</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-emerald-800 flex justify-between text-sm font-bold">
                  <span>Tổng thời gian: {totalHoursFloat} tiếng</span>
                  <span className="text-amber-400 text-base">{totalPrice.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <form onSubmit={handleConfirm} id="confirmForm" className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">TÊN CỦA BẠN</label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập họ và tên"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">SỐ ĐIỆN THOẠI</label>
                  <input
                    type="tel"
                    required
                    placeholder="Nhập số điện thoại"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-white text-gray-900 rounded-lg px-4 py-2.5 text-sm outline-none"
                  />
                </div>
              </form>

              <div className="bg-[#033b20] border border-emerald-700/60 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                  <span>⚠️ Lưu ý:</span>
                </div>
                <ul className="text-gray-200 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>Việc thanh toán được thực hiện trực tiếp giữa bạn và chủ sân.</li>
                  <li>BADCourt đóng vai trò kết nối, hỗ trợ bạn tìm và đặt sân dễ dàng hơn.</li>
                  <li>Mỗi sân có thể có quy định và chính sách riêng, hãy dành chút thời gian đọc kỹ để đảm bảo quyền lợi cho bạn nhé!</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#064e2b] max-w-2xl mx-auto w-full">
            <button
              type="submit"
              form="confirmForm"
              disabled={submitting}
              className="w-full bg-[#e69b24] hover:bg-[#cf8819] text-white py-3.5 rounded-lg font-bold text-sm uppercase shadow transition cursor-pointer"
            >
              {submitting ? 'ĐANG LƯU VÀO HỆ THỐNG...' : 'XÁC NHẬN & THANH TOÁN'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Bảng giá Cố Định đồng bộ 100% với Dịch Vụ */}
      {isPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white text-gray-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
            {/* Header Modal */}
            <div className="bg-[#1b6b3e] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Bảng Giá Đặt Cố Định</h3>
                <p className="text-xs text-emerald-100 font-medium">{currentClub?.name}</p>
              </div>
              <button 
                onClick={() => setIsPriceModalOpen(false)} 
                className="p-1.5 hover:bg-white/20 rounded-full cursor-pointer transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Nội dung bảng giá */}
            <div className="p-5 space-y-4">
              <div className="text-xs text-gray-600 flex items-center justify-between pb-2 border-b border-gray-100">
                <span>⏰ Giờ mở cửa: <strong className="text-emerald-700">{timeSlotsData.openH}:00 - {timeSlotsData.closeH}:00</strong></span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                  {isWeekend ? 'Đang chọn: Cuối tuần (T7, CN)' : 'Đang chọn: Trong tuần (T2 - T6)'}
                </span>
              </div>

              {isFree ? (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center space-y-1">
                  <p className="text-base font-bold text-orange-600">🎉 MIỄN PHÍ 100% HSSV</p>
                  <p className="text-xs text-orange-700">Chỉ cần xuất trình thẻ Học sinh - Sinh viên khi nhận sân.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden text-xs shadow-xs">
                  <table className="w-full text-center">
                    <thead className="bg-[#f0f9f4] text-emerald-900 font-bold border-b border-gray-200">
                      <tr>
                        <th className="py-2.5 px-2 border-r border-gray-200">Thứ</th>
                        <th className="py-2.5 px-3 text-left">Khung giờ</th>
                        <th className="py-2.5 px-2 border-l border-gray-200">Giá / 30 phút</th>
                        <th className="py-2.5 px-2 border-l border-gray-200">Giá / 1 giờ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* Dòng mặc định */}
                      <tr className="bg-gray-50/70">
                        <td colSpan={2} className="py-2 px-3 text-left font-bold text-gray-700">Mặc định</td>
                        <td className="py-2 px-2 border-l border-gray-200 font-semibold text-gray-700">
                          {Math.round(basePricePerHour / 2).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 border-l border-gray-200 font-bold text-gray-800">
                          {basePricePerHour.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>

                      {/* T2 - T6 */}
                      <tr className={!isWeekend ? 'bg-emerald-50/50 font-semibold' : ''}>
                        <td className="py-3 px-2 border-r border-gray-200 font-bold text-emerald-800" rowSpan={2}>T2 - T6</td>
                        <td className="py-2 px-3 text-left">18h - 22h</td>
                        <td className="py-2 px-2 border-l border-gray-200 font-semibold text-emerald-700">
                          {Math.round(basePricePerHour / 2).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 border-l border-gray-200 font-bold text-emerald-800">
                          {basePricePerHour.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                      <tr className={!isWeekend ? 'bg-emerald-50/50 font-semibold' : ''}>
                        <td className="py-2 px-3 text-left">5h - 18h</td>
                        <td className="py-2 px-2 border-l border-gray-200 font-semibold text-emerald-700">
                          {Math.round(Math.max(0, basePricePerHour - 20000) / 2).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 border-l border-gray-200 font-bold text-emerald-800">
                          {Math.max(0, basePricePerHour - 20000).toLocaleString('vi-VN')} đ
                        </td>
                      </tr>

                      {/* T7 - CN */}
                      <tr className={isWeekend ? 'bg-emerald-50/50 font-semibold' : ''}>
                        <td className="py-3 px-2 border-r border-gray-200 font-bold text-emerald-800" rowSpan={2}>T7 - CN</td>
                        <td className="py-2 px-3 text-left">18h - 22h</td>
                        <td className="py-2 px-2 border-l border-gray-200 font-semibold text-emerald-700">
                          {Math.round(basePricePerHour / 2).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 border-l border-gray-200 font-bold text-emerald-800">
                          {basePricePerHour.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                      <tr className={isWeekend ? 'bg-emerald-50/50 font-semibold' : ''}>
                        <td className="py-2 px-3 text-left">6h - 18h</td>
                        <td className="py-2 px-2 border-l border-gray-200 font-semibold text-emerald-700">
                          {Math.round(Math.max(0, basePricePerHour - 10000) / 2).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 border-l border-gray-200 font-bold text-emerald-800">
                          {Math.max(0, basePricePerHour - 10000).toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-1">
                <button 
                  onClick={() => setIsPriceModalOpen(false)} 
                  className="w-full bg-[#1b6b3e] hover:bg-[#155330] text-white font-bold text-xs py-3 rounded-xl shadow transition cursor-pointer"
                >
                  ĐÃ HIỂU & TIẾP TỤC ĐẶT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}