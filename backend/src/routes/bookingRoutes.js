const express = require('express');
const {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, authorizeAdmin } = require('../middlewares/authMiddleware');
const Booking = require('../models/Booking');

const router = express.Router();

// ==========================================
// 1. PUBLIC ROUTES (Không cần đăng nhập)
// ==========================================

// Xem khung giờ trống
router.get('/available-slots', getAvailableSlots);

// Lấy danh sách giờ đã đặt của một sân cụ thể để bôi đỏ lên bảng lịch
router.get('/court/:courtId', async (req, res) => {
  try {
    const { courtId } = req.params;
    const { date } = req.query;

    const query = {
      court: courtId,
      status: { $ne: 'CANCELLED' } // Không bôi đỏ các đơn đã bị HỦY
    };

    if (date) {
      query.bookingDate = date;
    }

    const bookings = await Booking.find(query).select('bookingDate startTime endTime note status');
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. USER ROUTES (Yêu cầu đăng nhập)
// ==========================================

// Đặt sân
router.post('/', protect, createBooking);

// Xem lịch sử đặt sân của tôi
router.get('/my-bookings', protect, getMyBookings);

// Hủy lịch đặt (Hỗ trợ cả PUT và PATCH để tránh lỗi method ở Frontend)
router.put('/:id/cancel', protect, cancelBooking);
router.patch('/:id/cancel', protect, cancelBooking);

// ==========================================
// 3. ADMIN ROUTES (Quyền Quản trị viên)
// ==========================================

// Xem toàn bộ lịch đặt
router.get('/', protect, authorizeAdmin, getAllBookings);

// Cập nhật trạng thái đơn đặt (Hỗ trợ cả PUT và PATCH)
router.put('/:id/status', protect, authorizeAdmin, updateBookingStatus);
router.patch('/:id/status', protect, authorizeAdmin, updateBookingStatus);

module.exports = router;