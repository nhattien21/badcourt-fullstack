const User = require('../models/User');
const Booking = require('../models/Booking');

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
          { bookingDate: { $lt: currentDateStr } },
          {
            bookingDate: currentDateStr,
            endTime: { $lte: currentHourStr }
          }
        ]
      },
      { $set: { status: 'COMPLETED' } }
    );
  } catch (error) {
    console.error('Lỗi khi tự động cập nhật đơn hết hạn trong Admin:', error);
  }
};

// @desc    Lấy danh sách tất cả tài khoản khách hàng
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'CUSTOMER' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Khóa hoặc mở khóa tài khoản khách hàng
// @route   PATCH /api/v1/admin/users/:id/status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.status = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    await user.save();

    res.json({
      success: true,
      message: `Đã đổi trạng thái tài khoản sang ${user.status}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Thống kê tổng quan (Dashboard overview)
// @route   GET /api/v1/admin/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Tự động quét cập nhật đơn quá hạn trước khi thống kê
    await autoUpdateExpiredBookings();

    const totalUsers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalBookings = await Booking.countDocuments();
    
    // Tổng doanh thu từ các đơn hoàn thành hoặc đã xác nhận
    const revenueResult = await Booking.aggregate([
      { $match: { status: {$in: ['CONFIRMED', 'COMPLETED'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Thống kê doanh thu và số lượt đặt theo ngày / tháng
// @route   GET /api/v1/admin/revenue-stats
// @access  Private/Admin
exports.getRevenueStats = async (req, res) => {
  try {
    await autoUpdateExpiredBookings();

    const { startDate, endDate, groupBy } = req.query; 
    // groupBy: 'day' (mặc định) hoặc 'month'

    const matchQuery = {
      status: { $in: ['CONFIRMED', 'COMPLETED'] }
    };

    if (startDate && endDate) {
      matchQuery.bookingDate = { $gte: startDate,$lte: endDate };
    }

    // Định dạng nhóm ngày: YYYY-MM-DD hoặc theo tháng YYYY-MM
    const dateSubstringLength = groupBy === 'month' ? 7 : 10;

    const stats = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $substr: ['$bookingDate', 0, dateSubstringLength] },
          totalRevenue: { $sum: '$totalPrice' },
          totalBookings: { $sum: 1 }         }       },       {$sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};