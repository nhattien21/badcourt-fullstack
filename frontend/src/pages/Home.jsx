import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  Search, Heart, Share2, ArrowLeft, Star, MapPin, 
  Clock, Phone, Copy, Check, SlidersHorizontal, RotateCcw, ChevronDown,
  Calendar as CalendarIcon, Navigation
} from 'lucide-react';

const PROVINCES = [
  'Tất cả khu vực', 'TP Hà Nội', 'TP Hồ Chí Minh', 'Cần Thơ', 'Đà Nẵng', 
  'Hải Phòng', 'Bắc Ninh', 'Bình Dương', 'Đồng Nai', 'An Giang'
];

const DISTRICTS_MAP = {
  'TP Hồ Chí Minh': [
    'Tất cả Phường/Xã', 'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 
    'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12', 'Gò Vấp', 
    'Bình Thạnh', 'Tân Bình', 'Bình Tân', 'Phú Nhuận', 'TP. Thủ Đức'
  ],
  'TP Hà Nội': [
    'Tất cả Phường/Xã', 'Đống Đa', 'Ba Đình', 'Cầu Giấy', 'Hai Bà Trưng', 
    'Tây Hồ', 'Thanh Xuân', 'Hoàn Kiếm', 'Hà Đông', 'Hoàng Mai', 
    'Long Biên', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Thanh Trì'
  ],
  'Đà Nẵng': ['Tất cả Phường/Xã', 'Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Cẩm Lệ'],
  'Hải Phòng': ['Tất cả Phường/Xã', 'Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An'],
  'Cần Thơ': ['Tất cả Phường/Xã', 'Ninh Kiều', 'Bình Thủy', 'Cái Răng'],
  'Bình Dương': ['Tất cả Phường/Xã', 'Thủ Dầu Một', 'Dĩ An', 'Thuận An', 'Bến Cát'],
  'Đồng Nai': ['Tất cả Phường/Xã', 'Biên Hòa', 'Long Khánh', 'Nhơn Trạch'],
  'Bắc Ninh': ['Tất cả Phường/Xã', 'TP Bắc Ninh', 'Từ Sơn', 'Tiên Du'],
  'An Giang': ['Tất cả Phường/Xã', 'Long Xuyên', 'Châu Đốc']
};

const removeAccents = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

const CITY_ALIASES = {
  'TP Hồ Chí Minh': ['hồ chí minh', 'ho chi minh', 'tp.hcm', 'tphcm', 'hcm', 'sài gòn', 'sai gon'],
  'TP Hà Nội': ['hà nội', 'ha noi', 'hn'],
  'Đà Nẵng': ['đà nẵng', 'da nang'],
  'Hải Phòng': ['hải phòng', 'hai phong'],
  'Cần Thơ': ['cần thơ', 'can tho'],
  'Bắc Ninh': ['bắc ninh', 'bac ninh'],
  'Bình Dương': ['bình dương', 'binh duong'],
  'Đồng Nai': ['đồng nai', 'dong nai'],
  'An Giang': ['an giang']
};

const getCourtRating = (court) => {
  if (!court) return '5.0';
  let sum = 0;
  for (let i = 0; i < court.name.length; i++) sum += court.name.charCodeAt(i);
  return ((40 + (sum % 11)) / 10).toFixed(1);
};

const getCourtDistance = (court) => {
  if (!court) return 2.5;
  let sum = 0;
  for (let i = 0; i < court.name.length; i++) sum += court.name.charCodeAt(i);
  return Number(((sum % 150) / 10 + 1.2).toFixed(1));
};

const getGoogleMapUrl = (court) => {
  if (!court) return '#';
  const query = encodeURIComponent(`${court.name}, ${court.description || ''}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

const getCourtOperatingHours = (court) => {
  if (court.openTime && court.closeTime) {
    return `${court.openTime} - ${court.closeTime}`;
  }
  const isUni = court.name.toLowerCase().includes('đh') || court.name.toLowerCase().includes('trường');
  const isClub = court.name.toLowerCase().includes('club') || court.name.toLowerCase().includes('vip') || court.name.toLowerCase().includes('sport');
  
  if (isUni) return '07:00 - 21:30';
  if (isClub) return '05:00 - 23:00';
  return '05:30 - 22:30';
};

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getThreeNearestDates = () => {
  const dates = [];
  const now = new Date();
  for (let i = 0; i < 3; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
};

// Sinh vé xé theo trình độ thực tế dạng chữ
const generateCourtTickets = (court) => {
  if (!court) return [];
  const dates = getThreeNearestDates();
  let sum = 0;
  for (let i = 0; i < court.name.length; i++) sum += court.name.charCodeAt(i);

  const priceBase = court.pricePerHour === 0 
    ? 0 
    : Math.round((court.pricePerHour * 0.8) / 10000) * 10000;
  
  const count = 2 + (sum % 2);

  const templates = [
    { 
      title: '[Xé vé] - Khá 3-6 tháng', 
      level: 'Khá 3-6 tháng', 
      time: '14:00 - 17:00', 
      price: Math.max(50000, priceBase), 
      max: 8, 
      joined: sum % 5 
    },
    { 
      title: '[Xé vé] - Pro 6 tháng - 1 năm+', 
      level: 'Pro 6 tháng - 1 năm+', 
      time: '18:30 - 21:30', 
      price: Math.max(60000, priceBase + 20000), 
      max: 12, 
      joined: (sum * 3) % 9 
    },
    { 
      title: '[Xé vé] - Trên 1 năm+', 
      level: 'Trên 1 năm+', 
      time: '09:00 - 11:30', 
      price: Math.max(40000, priceBase - 10000), 
      max: 8, 
      joined: (sum * 7) % 6 
    }
  ];

  return templates.slice(0, count).map((t, idx) => ({
    id: `${court._id}_t${idx + 1}`,
    code: `${10000 + ((sum * (idx + 7) * 19) % 89999)}`,
    title: t.title,
    level: t.level,
    time: t.time,
    date: dates[idx % dates.length],
    price: court.pricePerHour === 0 ? 0 : t.price,
    maxCount: t.max,
    joinedCount: t.joined,
    note: 'Giá vé bao gồm 1 nước suối/người và cầu thi đấu Yonex/Ba Sao tiêu chuẩn.'
  }));
};

const getAvailableSubCourtsCount = (court) => {
  if (!court) return 2;
  let sum = 0;
  for (let i = 0; i < court.name.length; i++) sum += court.name.charCodeAt(i);
  return 1 + (sum % 4);
};

// Con lăn bánh xe chọn giờ 24h
const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES_WHEEL = ['00', '15', '30', '45'];
const ITEM_HEIGHT = 44;

function TimeWheelPickerModal({ isOpen, initialTime = '13:30', onCancel, onDone }) {
  const [initH, initM] = initialTime.split(':');
  const [selectedH, setSelectedH] = useState(initH || '13');
  const [selectedM, setSelectedM] = useState(initM || '30');

  const hourRef = useRef(null);
  const minRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const hIdx = HOURS_24.indexOf(selectedH);
      const mIdx = MINUTES_WHEEL.indexOf(selectedM);
      if (hourRef.current && hIdx !== -1) {
        hourRef.current.scrollTop = hIdx * ITEM_HEIGHT;
      }
      if (minRef.current && mIdx !== -1) {
        minRef.current.scrollTop = mIdx * ITEM_HEIGHT;
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleHourScroll = () => {
    if (!hourRef.current) return;
    const idx = Math.round(hourRef.current.scrollTop / ITEM_HEIGHT);
    if (HOURS_24[idx] && HOURS_24[idx] !== selectedH) {
      setSelectedH(HOURS_24[idx]);
    }
  };

  const handleMinScroll = () => {
    if (!minRef.current) return;
    const idx = Math.round(minRef.current.scrollTop / ITEM_HEIGHT);
    if (MINUTES_WHEEL[idx] && MINUTES_WHEEL[idx] !== selectedM) {
      setSelectedM(MINUTES_WHEEL[idx]);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-end justify-center bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <button onClick={onCancel} className="text-sky-500 font-semibold text-base hover:text-sky-600 cursor-pointer">
            Cancel
          </button>
          <span className="font-bold text-gray-800 text-sm">Chọn giờ (24h)</span>
          <button onClick={() => onDone(`${selectedH}:${selectedM}`)} className="text-sky-500 font-bold text-base hover:text-sky-600 cursor-pointer">
            Done
          </button>
        </div>

        <div className="relative h-[220px] flex items-center justify-center my-4 overflow-hidden select-none">
          <div className="absolute left-6 right-6 top-[88px] h-[44px] bg-gray-100/80 rounded-xl pointer-events-none border-y border-gray-200" />

          {/* Cột 24h */}
          <div 
            ref={hourRef}
            onScroll={handleHourScroll}
            className="w-24 h-full overflow-y-scroll scroll-smooth snap-y snap-mandatory scrollbar-none z-10 text-center"
            style={{ padding: `${ITEM_HEIGHT * 2}px 0` }}
          >
            {HOURS_24.map((h) => (
              <div 
                key={h} 
                className={`h-[44px] flex items-center justify-center snap-center cursor-pointer transition-all ${
                  selectedH === h ? 'font-bold text-gray-900 text-2xl scale-110' : 'text-gray-400 font-normal text-lg'
                }`}
                onClick={() => {
                  setSelectedH(h);
                  if (hourRef.current) hourRef.current.scrollTop = HOURS_24.indexOf(h) * ITEM_HEIGHT;
                }}
              >
                {h}
              </div>
            ))}
          </div>

          <div className="text-xl font-bold text-gray-400 z-10 px-2">:</div>

          {/* Cột Phút */}
          <div 
            ref={minRef}
            onScroll={handleMinScroll}
            className="w-24 h-full overflow-y-scroll scroll-smooth snap-y snap-mandatory scrollbar-none z-10 text-center"
            style={{ padding: `${ITEM_HEIGHT * 2}px 0` }}
          >
            {MINUTES_WHEEL.map((m) => (
              <div 
                key={m} 
                className={`h-[44px] flex items-center justify-center snap-center cursor-pointer transition-all ${
                  selectedM === m ? 'font-bold text-gray-900 text-2xl scale-110' : 'text-gray-400 font-normal text-lg'
                }`}
                onClick={() => {
                  setSelectedM(m);
                  if (minRef.current) minRef.current.scrollTop = MINUTES_WHEEL.indexOf(m) * ITEM_HEIGHT;
                }}
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [courts, setCourts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [activeTab, setActiveTab] = useState('dichvu'); 
  const [copied, setCopied] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState('all'); 
  const [filterDate, setFilterDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState('13:30');
  const [endTime, setEndTime] = useState('18:30');
  const [pickerTarget, setPickerTarget] = useState(null);

  const [filterMode, setFilterMode] = useState('khuvuc');
  const [selectedCity, setSelectedCity] = useState('Tất cả khu vực');
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả Phường/Xã');
  const [distance, setDistance] = useState(15);

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [tempCity, setTempCity] = useState('Tất cả khu vực');

  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [tempDistrict, setTempDistrict] = useState('Tất cả Phường/Xã');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const res = await axiosClient.get('/courts');
        setCourts(res.data.data);
      } catch (err) {
        console.error('Lỗi lấy danh sách sân:', err);
      }
    };
    fetchCourts();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/book/${selectedCourt?._id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetFilter = () => {
    setScheduleType('all');
    setFilterDate(getTodayDateString());
    setStartTime('13:30');
    setEndTime('18:30');
    setFilterMode('khuvuc');
    setSelectedCity('Tất cả khu vực');
    setSelectedDistrict('Tất cả Phường/Xã');
    setDistance(20);
    setSearchTerm('');
  };

  useEffect(() => {
    const handleResetEvent = () => handleResetFilter();
    window.addEventListener('resetHomeSearch', handleResetEvent);
    return () => window.removeEventListener('resetHomeSearch', handleResetEvent);
  }, []);

  const handleBackClick = () => {
    handleResetFilter();
    navigate('/');
  };

  const filteredCourts = courts.filter((court) => {
    const rawSearch = removeAccents(searchTerm.trim());
    const courtContent = removeAccents(`${court.name} ${court.description || ''}`);

    if (rawSearch) {
      const isSearchHCM = ['tphcm', 'tp.hcm', 'hcm', 'ho chi minh'].some(k => rawSearch.includes(k));
      const hasCourtHCM = ['tphcm', 'tp.hcm', 'hcm', 'ho chi minh', 'sai gon'].some(k => courtContent.includes(k));
      const matchKeyword = courtContent.includes(rawSearch) || (isSearchHCM && hasCourtHCM);
      if (!matchKeyword) return false;
    }

    if (scheduleType === 'san_trong' && court.status === 'MAINTENANCE') return false;
    if (scheduleType === 'su_kien' && court.pricePerHour === 0) return false;

    if (filterMode === 'khuvuc' && selectedCity !== 'Tất cả khu vực') {
      const aliases = CITY_ALIASES[selectedCity] || [removeAccents(selectedCity.replace('TP ', ''))];
      const matchCity = aliases.some((alias) => courtContent.includes(removeAccents(alias)));
      if (!matchCity) return false;

      if (selectedDistrict !== 'Tất cả Phường/Xã') {
        const distKey = removeAccents(selectedDistrict);
        const matchDistrict = courtContent.includes(distKey);
        if (!matchDistrict) return false;
      }
    }

    if (filterMode === 'khoangcach') {
      const dist = getCourtDistance(court);
      if (dist > parseFloat(distance)) return false;
    }

    return true;
  });

  const basePrice = selectedCourt ? selectedCourt.pricePerHour : 100000;
  const isFreeCourt = basePrice === 0;
  const peakPrice = isFreeCourt ? 0 : basePrice + 20000;
  const offPeakPrice = isFreeCourt ? 0 : Math.max(50000, basePrice - 20000);
  const fixedPrice = isFreeCourt ? 0 : basePrice;

  const currentRating = selectedCourt ? getCourtRating(selectedCourt) : '5.0';
  const availableDistricts = DISTRICTS_MAP[selectedCity] || ['Tất cả Phường/Xã'];

  return (
    <div className="min-h-screen bg-[#1b5e20]/10 pb-12 relative overflow-x-hidden">
      {/* 1. Header tìm kiếm */}
      <div className="bg-[#1b6b3e] text-white px-4 py-3 shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button onClick={handleBackClick} className="p-1 hover:bg-white/10 rounded-full cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-base font-semibold text-white">Tìm kiếm ({filteredCourts.length} sân)</h1>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition cursor-pointer"
            title="Bộ lọc tìm kiếm"
          >
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Nhập tên sân, địa chỉ, quận huyện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200 outline-none focus:border-emerald-500 text-sm placeholder-gray-400"
          />
        </div>

        {filteredCourts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-500 shadow-sm border border-gray-100">
            <p className="text-base font-semibold">Không tìm thấy sân phù hợp với bộ lọc!</p>
            <button 
              onClick={handleResetFilter} 
              className="mt-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer"
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourts.map((court) => {
              const isFree = court.pricePerHour === 0;
              const rating = getCourtRating(court);
              const dist = getCourtDistance(court);
              const isTicketMode = scheduleType === 'su_kien';
              const isAvailableSlotMode = scheduleType === 'san_trong';
              const tickets = isTicketMode ? generateCourtTickets(court) : [];
              const availableSubCount = getAvailableSubCourtsCount(court);

              return (
                <div 
                  key={court._id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col group"
                >
                  <div 
                    className="relative h-44 w-full bg-gray-200 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedCourt(court)}
                  >
                    <img 
                      src={court.images?.[0] || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600'} 
                      alt={court.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="flex items-center gap-1 bg-black/60 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {rating}
                      </span>
                      <span className={`text-white text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isFree ? 'bg-orange-500 font-bold' : 'bg-emerald-600'
                      }`}>
                        {isFree ? 'Miễn phí HSSV' : 'Đơn ngày'}
                      </span>
                      {isTicketMode && (
                        <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500">
                          Sự kiện
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:text-red-500 shadow">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:text-blue-500 shadow">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 flex items-center justify-between gap-3 border-b border-gray-100">
                    <div 
                      className="flex items-center gap-3 min-w-0 cursor-pointer"
                      onClick={() => setSelectedCourt(court)}
                    >
                      <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                        <img 
                          src={court.images?.[0] || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600'} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="truncate">
                        <h3 className="font-bold text-sm text-gray-800 truncate">{court.name}</h3>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          <span className="text-red-500 font-semibold">[{dist}km]</span> {court.description}
                        </p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {getCourtOperatingHours(court)}
                          {!isTicketMode && (
                            <> | <span className="font-semibold text-emerald-600">{isFree ? '0 đ' : `${court.pricePerHour.toLocaleString('vi-VN')} đ/h`}</span></>
                          )}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/book/${court._id}`);
                      }}
                      className="bg-[#e69b24] hover:bg-[#cf8819] text-white text-xs font-bold px-3.5 py-2 rounded-lg flex-shrink-0 shadow-sm cursor-pointer"
                    >
                      ĐẶT LỊCH
                    </button>
                  </div>

                  {/* Khi chọn Sân trống: Thanh xanh lá */}
                  {isAvailableSlotMode && (
                    <div className="p-3 bg-gray-50/50">
                      <div 
                        onClick={() => navigate(`/book/${court._id}`)}
                        className="bg-[#ecfdf5] border border-emerald-300 hover:border-emerald-500 hover:bg-[#e1f9ee] p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-900 cursor-pointer shadow-xs transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{availableSubCount} Sân trống • {startTime} - {endTime}</span>
                        </div>
                        <span className="text-emerald-700 text-sm">&gt;&gt;</span>
                      </div>
                    </div>
                  )}

                  {/* Khi chọn Sự kiện / Xé vé: Hiển thị các vé xé */}
                  {isTicketMode && (
                    <div className="p-3 bg-gray-50/70 space-y-2">
                      {tickets.map((t) => (
                        <div 
                          key={t.id}
                          onClick={() => {
                            sessionStorage.setItem(`ticket_${t.id}`, JSON.stringify({ ticket: t, court }));
                            navigate(`/ticket/${t.id}`, { state: { ticket: t, court } });
                          }}
                          className="bg-white p-2.5 rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-xs transition cursor-pointer flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                            <span className="truncate pr-2">#{t.code}: {t.title}</span>
                            <span className="text-gray-400 text-[11px] flex-shrink-0">
                              {t.time} | {t.date.split('-').reverse().slice(0, 2).join('/')} &gt;
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                                {t.level}
                              </span>
                              <span className="text-amber-700 bg-amber-50 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                                {t.price === 0 ? 'Miễn phí' : `${t.price.toLocaleString('vi-VN')} đ/vé`}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                {t.joinedCount}/{t.maxCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal bộ lọc */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/40">
          <div className="w-full max-w-lg bg-[#ebfbee] h-full flex flex-col justify-between overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div>
              <div className="px-4 py-3 flex items-center justify-between">
                <button onClick={() => setIsFilterOpen(false)} className="p-1.5 hover:bg-black/5 rounded-full cursor-pointer">
                  <ArrowLeft className="w-6 h-6 text-emerald-700" />
                </button>
                <h2 className="text-lg font-bold text-emerald-800">Tìm kiếm</h2>
                <button onClick={handleResetFilter} className="p-1.5 hover:bg-black/5 rounded-full cursor-pointer" title="Đặt lại">
                  <RotateCcw className="w-5 h-5 text-emerald-700" />
                </button>
              </div>

              <div className="p-4">
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-emerald-100 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Loại lịch</h3>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        onClick={() => setScheduleType(scheduleType === 'san_trong' ? 'all' : 'san_trong')}
                        className={`py-2.5 px-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                          scheduleType === 'san_trong'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold shadow-xs'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        Sân trống
                      </button>
                      <button
                        onClick={() => setScheduleType(scheduleType === 'su_kien' ? 'all' : 'su_kien')}
                        className={`py-2.5 px-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                          scheduleType === 'su_kien'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold shadow-xs'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        Sự kiện / Xé vé
                      </button>
                      <button
                        onClick={() => setScheduleType(scheduleType === 'ghep_doi' ? 'all' : 'ghep_doi')}
                        className={`py-2.5 px-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                          scheduleType === 'ghep_doi'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold shadow-xs'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        Ghép đội
                      </button>
                    </div>
                  </div>

                  {scheduleType === 'san_trong' && (
                    <div className="space-y-4 pt-2 border-t border-gray-100 animate-in fade-in duration-150">
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Chọn ngày</h4>
                        <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                          <input 
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none cursor-pointer"
                          />
                          <CalendarIcon className="w-4 h-4 text-emerald-600 pointer-events-none absolute right-4" />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Khung giờ (24h)</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium block mb-1">Từ</span>
                            <div 
                              onClick={() => setPickerTarget('start')}
                              className="flex items-center justify-between bg-white border border-gray-200 hover:border-emerald-500 rounded-xl px-3.5 py-2.5 cursor-pointer shadow-xs transition"
                            >
                              <span className="text-sm font-bold text-gray-800">{startTime}</span>
                              <Clock className="w-4 h-4 text-emerald-600" />
                            </div>
                          </div>
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium block mb-1">Đến</span>
                            <div 
                              onClick={() => setPickerTarget('end')}
                              className="flex items-center justify-between bg-white border border-gray-200 hover:border-emerald-500 rounded-xl px-3.5 py-2.5 cursor-pointer shadow-xs transition"
                            >
                              <span className="text-sm font-bold text-gray-800">{endTime}</span>
                              <Clock className="w-4 h-4 text-emerald-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div 
                      className="flex items-center gap-2.5 cursor-pointer mb-3"
                      onClick={() => setFilterMode('khuvuc')}
                    >
                      <input 
                        type="radio" 
                        name="filterType" 
                        checked={filterMode === 'khuvuc'} 
                        onChange={() => setFilterMode('khuvuc')}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span className="text-sm font-bold text-gray-800">Khu vực</span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setTempCity(selectedCity);
                          setIsCityModalOpen(true);
                        }}
                        className="flex-1 flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-700 hover:border-emerald-500 bg-white cursor-pointer"
                      >
                        <span className="font-semibold text-emerald-800 truncate">{selectedCity}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>

                      <button 
                        disabled={selectedCity === 'Tất cả khu vực'}
                        onClick={() => {
                          setTempDistrict(selectedDistrict);
                          setIsDistrictModalOpen(true);
                        }}
                        className={`flex-1 flex items-center justify-between border rounded-xl px-4 py-3 text-xs transition cursor-pointer ${
                          selectedCity === 'Tất cả khu vực'
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-500'
                        }`}
                      >
                        <span className="font-semibold text-emerald-800 truncate">{selectedDistrict}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div 
                      className="flex items-center gap-2.5 cursor-pointer mb-3"
                      onClick={() => setFilterMode('khoangcach')}
                    >
                      <input 
                        type="radio" 
                        name="filterType" 
                        checked={filterMode === 'khoangcach'} 
                        onChange={() => setFilterMode('khoangcach')}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span className="text-sm font-bold text-gray-800">
                        Khoảng cách <span className="text-gray-500 font-medium">({distance} km)</span>
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>1 km</span>
                      <span>20 km</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={distance}
                      disabled={filterMode !== 'khoangcach'}
                      onChange={(e) => setDistance(e.target.value)}
                      className="w-full accent-emerald-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/80 border-t border-emerald-100">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-[#00a84e] hover:bg-[#008f42] text-white font-bold py-3.5 rounded-xl shadow transition text-sm cursor-pointer"
              >
                Áp dụng kết quả ({filteredCourts.length} sân)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup chọn giờ con lăn bánh xe */}
      <TimeWheelPickerModal
        isOpen={pickerTarget !== null}
        initialTime={pickerTarget === 'start' ? startTime : endTime}
        onCancel={() => setPickerTarget(null)}
        onDone={(time) => {
          if (pickerTarget === 'start') setStartTime(time);
          if (pickerTarget === 'end') setEndTime(time);
          setPickerTarget(null);
        }}
      />

      {/* Modal Chọn Tỉnh/Thành */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
            <div className="p-3 bg-gray-50 border-b border-gray-100 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-6 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm tỉnh/thành..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-gray-200 text-xs outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {PROVINCES.filter(p => p.toLowerCase().includes(citySearch.toLowerCase())).map((city, idx) => (
                <div
                  key={idx}
                  onClick={() => setTempCity(city)}
                  className={`py-3.5 text-center text-sm font-medium cursor-pointer transition ${
                    tempCity === city 
                      ? 'text-emerald-700 font-bold bg-emerald-50' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {city}
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setTempCity('Tất cả khu vực')}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-white font-bold text-xs rounded-lg transition cursor-pointer"
              >
                XÓA
              </button>
              <button
                onClick={() => {
                  setSelectedCity(tempCity);
                  setSelectedDistrict('Tất cả Phường/Xã');
                  setIsCityModalOpen(false);
                }}
                className="px-8 py-2 bg-[#e69b24] hover:bg-[#cf8819] text-white font-bold text-xs rounded-lg shadow transition cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chọn Phường/Xã */}
      {isDistrictModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
            <div className="p-3 bg-gray-50 border-b border-gray-100 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-6 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Tìm kiếm tại ${selectedCity}...`}
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-gray-200 text-xs outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {availableDistricts
                .filter(d => d.toLowerCase().includes(districtSearch.toLowerCase()))
                .map((dist, idx) => (
                  <div
                    key={idx}
                    onClick={() => setTempDistrict(dist)}
                    className={`py-3.5 text-center text-sm font-medium cursor-pointer transition ${
                      tempDistrict === dist 
                        ? 'text-emerald-700 font-bold bg-emerald-50' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {dist}
                  </div>
                ))}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setTempDistrict('Tất cả Phường/Xã')}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-white font-bold text-xs rounded-lg transition cursor-pointer"
              >
                XÓA
              </button>
              <button
                onClick={() => {
                  setSelectedDistrict(tempDistrict);
                  setIsDistrictModalOpen(false);
                }}
                className="px-8 py-2 bg-[#e69b24] hover:bg-[#cf8819] text-white font-bold text-xs rounded-lg shadow transition cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side panel chi tiết sân */}
      {selectedCourt && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs" 
            onClick={() => setSelectedCourt(null)} 
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="relative h-56 bg-gray-900 flex-shrink-0">
                <img 
                  src={selectedCourt.images?.[0] || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600'} 
                  alt="" 
                  className="w-full h-full object-cover opacity-90"
                />
                
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedCourt(null)} 
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-800 shadow cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={getGoogleMapUrl(selectedCourt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex flex-col items-center"
                      title="Xem vị trí trên Google Maps"
                    >
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-emerald-700 hover:text-emerald-800 shadow transition hover:scale-105">
                        <Navigation className="w-5 h-5 fill-emerald-600 text-emerald-600" />
                      </div>
                      <span className="mt-1 px-1.5 py-0.2 bg-black/60 text-white text-[9px] font-bold rounded-xs tracking-tight">
                        Map
                      </span>
                    </a>

                    <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 hover:text-red-500 shadow">
                      <Heart className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={() => navigate(`/book/${selectedCourt._id}`)}
                      className="bg-[#e69b24] hover:bg-[#cf8819] text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow cursor-pointer transition"
                    >
                      Đặt lịch
                    </button>
                  </div>
                </div>

                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#00a86b] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                  <Star className="w-3.5 h-3.5 fill-white" /> {currentRating} (Đánh giá cao)
                </div>
              </div>

              <div className="p-5 pt-7 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                    <img 
                      src={selectedCourt.images?.[0] || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600'} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{selectedCourt.name}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-full px-2.5 py-0.5">
                        🏸 Cầu lông
                      </span>
                      {isFreeCourt && (
                        <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-300 rounded-full px-2 py-0.5">
                          🎓 Miễn Phí HSSV
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <a 
                    href={getGoogleMapUrl(selectedCourt)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-start gap-2 text-gray-700 hover:text-emerald-700 transition group"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition" />
                    <span className="underline-offset-2 hover:underline">{selectedCourt.description}</span>
                  </a>

                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {getCourtOperatingHours(selectedCourt)}
                  </p>
                  <p className="flex items-center gap-2 text-emerald-600 font-medium">
                    <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    Liên hệ: 09{Math.floor(10000000 + (selectedCourt.name.length * 823456) % 89999999)}
                  </p>
                </div>
              </div>

              {/* 5 Tab */}
              <div className="sticky top-0 bg-white z-20 border-b border-gray-200 text-xs font-semibold overflow-x-auto px-4 scrollbar-none shadow-xs">
                <div className="flex min-w-max">
                  {['thongtin', 'goihoivien', 'dichvu', 'hinhanh', 'dieukhoan'].map((t) => (
                    <button 
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`py-3 px-3 whitespace-nowrap border-b-2 transition cursor-pointer capitalize ${
                        activeTab === t ? 'border-[#00a86b] text-[#00a86b]' : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {t === 'thongtin' ? 'Thông tin' :
                       t === 'goihoivien' ? 'Gói hội viên' :
                       t === 'dichvu' ? 'Dịch vụ' :
                       t === 'hinhanh' ? 'Hình ảnh' : 'Điều khoản & quy định'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5">
                {activeTab === 'thongtin' && (
                  <div>
                    <h4 className="text-xs font-bold text-amber-600 uppercase mb-2">Link đặt lịch online</h4>
                    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4">
                      <span className="text-xs text-emerald-700 truncate mr-2">
                        {window.location.origin}/book/{selectedCourt._id}
                      </span>
                      <button onClick={handleCopyLink} className="text-gray-500 hover:text-emerald-600 cursor-pointer">
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Vị trí & Bản đồ</h4>
                    <a
                      href={getGoogleMapUrl(selectedCourt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-50 text-emerald-800 px-4 py-2.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition mb-4"
                    >
                      <Navigation className="w-4 h-4 text-emerald-600" />
                      Mở Google Maps chỉ đường đến sân
                    </a>

                    <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Mô tả sân</h4>
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {selectedCourt.description}
                    </p>
                  </div>
                )}

                {activeTab === 'goihoivien' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Gói ưu đãi tại {selectedCourt.name}</h4>
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-emerald-800">Gói Tháng Tiết Kiệm</h5>
                        <p className="text-[11px] text-gray-600">Đặt lịch từ 12 buổi/tháng (giảm 15%)</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">
                        {isFreeCourt ? '0 đ' : `${(basePrice * 10).toLocaleString('vi-VN')} đ`}
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'dichvu' && (
                  <div>
                    <h4 className="text-sm font-bold text-center text-[#064e2b] mb-1">Cầu Lông</h4>
                    {isFreeCourt && (
                      <p className="text-center text-xs text-orange-600 font-bold mb-3">
                        🎉 Sân áp dụng chương trình miễn phí 100% cho Học sinh - Sinh viên!
                      </p>
                    )}
                    <div className="border border-gray-200 rounded-xl overflow-hidden text-xs shadow-xs">
                      <table className="w-full text-center">
                        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                          <tr>
                            <th className="py-2.5 px-2 border-r border-gray-200 font-semibold">Thứ</th>
                            <th className="py-2.5 px-2 border-r border-gray-200 font-semibold">Khung giờ</th>
                            <th className="py-2.5 px-2 border-r border-gray-200 font-semibold">Cố định</th>
                            <th className="py-2.5 px-2 font-semibold">Vãng lai</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-600">
                          <tr>
                            <td className="py-2 px-2 border-r border-gray-200 font-medium" colSpan={2}>Mặc định</td>
                            <td className="py-2 px-2 border-r border-gray-200">{fixedPrice.toLocaleString('vi-VN')} đ</td>
                            <td className="py-2 px-2">{basePrice.toLocaleString('vi-VN')} đ</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-2 border-r border-gray-200 font-medium" rowSpan={2}>T2 - T6</td>
                            <td className="py-2.5 px-2 border-r border-gray-200">18h - 22h</td>
                            <td className="py-2.5 px-2 border-r border-gray-200">{fixedPrice.toLocaleString('vi-VN')} đ</td>
                            <td className="py-2.5 px-2 font-bold text-[#00a86b]">{peakPrice.toLocaleString('vi-VN')} đ</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-2 border-r border-gray-200">5h - 18h</td>
                            <td className="py-2.5 px-2 border-r border-gray-200">{Math.max(0, fixedPrice - 20000).toLocaleString('vi-VN')} đ</td>
                            <td className="py-2.5 px-2 font-bold text-[#00a86b]">{offPeakPrice.toLocaleString('vi-VN')} đ</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-2 border-r border-gray-200 font-medium" rowSpan={2}>T7 - CN</td>
                            <td className="py-2.5 px-2 border-r border-gray-200">18h - 22h</td>
                            <td className="py-2.5 px-2 border-r border-gray-200">{fixedPrice.toLocaleString('vi-VN')} đ</td>
                            <td className="py-2.5 px-2 font-bold text-[#00a86b]">{peakPrice.toLocaleString('vi-VN')} đ</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-2 border-r border-gray-200">6h - 18h</td>
                            <td className="py-2.5 px-2 border-r border-gray-200">{Math.max(0, fixedPrice - 10000).toLocaleString('vi-VN')} đ</td>
                            <td className="py-2.5 px-2 font-bold text-[#00a86b]">{offPeakPrice.toLocaleString('vi-VN')} đ</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => navigate(`/book/${selectedCourt._id}`)}
                        className="w-full bg-[#e69b24] hover:bg-[#cf8819] text-white font-bold py-3 rounded-xl shadow transition text-sm cursor-pointer"
                      >
                        TIẾP TỤC ĐẶT SÂN NÀY
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'hinhanh' && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 uppercase mb-3">
                      HÌNH ẢNH THỰC TẾ TẠI {selectedCourt.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {(selectedCourt.images && selectedCourt.images.length >= 4
                        ? selectedCourt.images.slice(0, 4)
                        : [
                            ...(selectedCourt.images || []),
                            'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600',
                            'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=600',
                            'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=600',
                            'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=600'
                          ].slice(0, 4)
                      ).map((imgUrl, i) => (
                        <div key={i} className="h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs">
                          <img 
                            src={imgUrl} 
                            alt={`Ảnh ${i + 1}`} 
                            className="w-full h-full object-cover hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'dieukhoan' && (
                  <div className="space-y-4 text-xs leading-relaxed text-gray-700">
                    <h5 className="font-bold text-gray-900">Quy định đặt sân tại {selectedCourt.name}</h5>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Thời gian đặt sân tối thiểu 30 phút</li>
                      <li>Huỷ lịch trước giờ chơi tối thiểu 2 tiếng sẽ được hoàn 100% tiền</li>
                      <li>Vui lòng mang giày đế cao su không để lại vệt đen lên mặt thảm</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}