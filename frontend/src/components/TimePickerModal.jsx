import React, { useState, useRef, useEffect } from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const ITEM_HEIGHT = 44; // Chiều cao mỗi dòng (px)

export default function TimePickerModal({ isOpen, initialTime = '13:30', onCancel, onDone }) {
  const [initH, initM] = initialTime.split(':');
  const [selectedH, setSelectedH] = useState(initH || '13');
  const [selectedM, setSelectedM] = useState(initM || '30');

  const hourRef = useRef(null);
  const minRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const hIdx = HOURS.indexOf(selectedH);
      const mIdx = MINUTES.indexOf(selectedM);
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
    if (HOURS[idx] && HOURS[idx] !== selectedH) {
      setSelectedH(HOURS[idx]);
    }
  };

  const handleMinScroll = () => {
    if (!minRef.current) return;
    const idx = Math.round(minRef.current.scrollTop / ITEM_HEIGHT);
    if (MINUTES[idx] && MINUTES[idx] !== selectedM) {
      setSelectedM(MINUTES[idx]);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-end justify-center bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header: Cancel - Done */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <button 
            onClick={onCancel} 
            className="text-sky-500 font-semibold text-base hover:text-sky-600 cursor-pointer"
          >
            Cancel
          </button>
          <span className="font-bold text-gray-800 text-sm">Chọn giờ (24h)</span>
          <button 
            onClick={() => onDone(`${selectedH}:${selectedM}`)} 
            className="text-sky-500 font-bold text-base hover:text-sky-600 cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* Khung con lăn dạng bánh xe (Wheel Picker) */}
        <div className="relative h-[220px] flex items-center justify-center my-4 overflow-hidden select-none">
          {/* Vùng highlight ở giữa */}
          <div className="absolute left-6 right-6 top-[88px] h-[44px] bg-gray-100/80 rounded-xl pointer-events-none border-y border-gray-200" />

          {/* Cột Giờ (00 -> 23) */}
          <div 
            ref={hourRef}
            onScroll={handleHourScroll}
            className="w-24 h-full overflow-y-scroll scroll-smooth snap-y snap-mandatory scrollbar-none z-10 text-center"
            style={{ padding: `${ITEM_HEIGHT * 2}px 0` }}
          >
            {HOURS.map((h) => (
              <div 
                key={h} 
                className={`h-[44px] flex items-center justify-center snap-center text-xl cursor-pointer transition-all ${
                  selectedH === h ? 'font-bold text-gray-900 text-2xl scale-110' : 'text-gray-400 font-normal'
                }`}
                onClick={() => {
                  setSelectedH(h);
                  if (hourRef.current) hourRef.current.scrollTop = HOURS.indexOf(h) * ITEM_HEIGHT;
                }}
              >
                {h}
              </div>
            ))}
          </div>

          <div className="text-xl font-bold text-gray-400 z-10 px-2">:</div>

          {/* Cột Phút (00, 15, 30, 45) */}
          <div 
            ref={minRef}
            onScroll={handleMinScroll}
            className="w-24 h-full overflow-y-scroll scroll-smooth snap-y snap-mandatory scrollbar-none z-10 text-center"
            style={{ padding: `${ITEM_HEIGHT * 2}px 0` }}
          >
            {MINUTES.map((m) => (
              <div 
                key={m} 
                className={`h-[44px] flex items-center justify-center snap-center text-xl cursor-pointer transition-all ${
                  selectedM === m ? 'font-bold text-gray-900 text-2xl scale-110' : 'text-gray-400 font-normal'
                }`}
                onClick={() => {
                  setSelectedM(m);
                  if (minRef.current) minRef.current.scrollTop = MINUTES.indexOf(m) * ITEM_HEIGHT;
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