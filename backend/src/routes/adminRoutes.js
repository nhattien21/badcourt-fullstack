const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, authorizeAdmin } = require('../middlewares/authMiddleware');

// Hàm tự động cập nhật các đơn CONFIRMED/PENDING đã qua thời gian sử dụng sang COMPLETED
const autoUpdateExpiredBookings = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDateStr = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentHourStr = `${hours}:${minutes}`;

    await Booking.updateMany(
      {
        status: { $in: ['PENDING', 'CONFIRMED'] },$or: [
          { bookingDate: { $lt: currentDateStr } }, // Đã qua những ngày trước đó
          {
            bookingDate: currentDateStr,
            endTime: { $lte: currentHourStr } // Trong ngày hôm nay nhưng đã qua giờ kết thúc
          }
        ]
      },
      { $set: { status: 'COMPLETED' } }
    );
  } catch (error) {
    console.error('Lỗi khi tự động cập nhật đơn hết hạn trong Admin:', error);
  }
};

// ==========================================
// BẢO MẬT: BẮT BUỘC ĐĂNG NHẬP & PHẢI LÀ ADMIN
// ==========================================
router.use(protect, authorizeAdmin);

// ==========================================
// 1. THỐNG KÊ DOANH THU & SỐ LƯỢNG (STATS)
// ==========================================
// GET /api/v1/admin/stats
router.get('/stats', async (req, res) => {
  try {
    // Quét và chốt trạng thái các đơn đã xong trước khi tính tiền
    await autoUpdateExpiredBookings();

    const totalUsers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalBookings = await Booking.countDocuments();

    const revenueResult = await Booking.aggregate([
      { $match: { status: {$ne: 'CANCELLED' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Lỗi lấy stats:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. QUẢN LÝ TẤT CẢ ĐƠN ĐẶT SÂN (BOOKINGS)
// ==========================================
// GET /api/v1/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    // Tự động chuyển các đơn đã qua giờ sang COMPLETED
    await autoUpdateExpiredBookings();

    const bookings = await Booking.find()
      .populate('user', 'fullName phoneNumber email')
      .populate('court', 'name pricePerHour')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách bookings:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật trạng thái booking (Hỗ trợ cả PUT và PATCH)
// PUT /api/v1/admin/bookings/:id/status
// PATCH /api/v1/admin/bookings/:id/status
const handleUpdateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt' });
    }

    return res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công', data: booking });
  } catch (error) {
    console.error('Lỗi cập nhật status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.put('/bookings/:id/status', handleUpdateBookingStatus);
router.patch('/bookings/:id/status', handleUpdateBookingStatus);

// ==========================================
// 3. QUẢN LÝ TÀI KHOẢN KHÁCH HÀNG (USERS)
// ==========================================
// GET /api/v1/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'CUSTOMER' })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('Lỗi lấy danh sách users:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Khóa hoặc mở khóa tài khoản khách hàng
// PATCH /api/v1/admin/users/:id/status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    user.status = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Đã đổi trạng thái tài khoản sang ${user.status}`,
      data: user
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái user:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;