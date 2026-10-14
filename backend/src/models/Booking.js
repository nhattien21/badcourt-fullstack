const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true
    },
    bookingDate: {
      type: String, // Format chuẩn YYYY-MM-DD (vd: "2026-10-15")
      required: [true, 'Vui lòng chọn ngày đặt sân']
    },
    startTime: {
      type: String, // Format HH:mm (vd: "17:00")
      required: [true, 'Vui lòng chọn giờ bắt đầu']
    },
    endTime: {
      type: String, // Format HH:mm (vd: "18:30")
      required: [true, 'Vui lòng chọn giờ kết thúc']
    },
    durationHours: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'CONFIRMED'
    },
    note: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Tạo index để tăng tốc độ truy vấn kiểm tra trùng lịch
bookingSchema.index({ court: 1, bookingDate: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);