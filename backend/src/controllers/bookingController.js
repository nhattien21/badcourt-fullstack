const Booking = require('../models/Booking');
const Court = require('../models/Court');

// Hàm chuyển đổi format "HH:mm" thành số phút để dễ so sánh
// Ví dụ: "07:30" => 450 phút
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Hàm tự động cập nhật các đơn CONFIRMED/PENDING đã qua thời gian sử dụng sang COMPLETED
const autoUpdateExpiredBookings = async (queryFilter = {}) => {
  try {
    const now = new Date();
    // Lấy ngày và giờ theo múi giờ địa phương Việt Nam (YYYY-MM-DD và HH:mm)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDateStr = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentHourStr = `${hours}:${minutes}`;

    await Booking.updateMany(
      {
        ...queryFilter,
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
    console.error('Lỗi khi tự động cập nhật đơn hết hạn:', error);
  }
};

// @desc    Lấy danh sách các khung giờ còn trống của 1 sân theo ngày
// @route   GET /api/v1/bookings/available-slots
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { courtId, date } = req.query;

    if (!courtId || !date) {
      return res.status(400).json({ message: 'Vui lòng cung cấp courtId và date (YYYY-MM-DD)' });
    }

    // Tự động cập nhật các đơn hết hạn
    await autoUpdateExpiredBookings({ court: courtId, bookingDate: date });

    // Lấy các lịch đã đặt hợp lệ trong ngày (bỏ qua các đơn CANCELLED)
    const bookedSlots = await Booking.find({
      court: courtId,
      bookingDate: date,
      status: { $in: ['PENDING', 'CONFIRMED', 'COMPLETED'] }
    }).select('startTime endTime status');

    res.json({
      success: true,
      courtId,
      date,
      bookedSlots,
      operatingHours: { open: "06:00", close: "22:00" }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Đặt sân mới (Có chống trùng giờ và tính tiền tự động)
// @route   POST /api/v1/bookings
// @access  Private (Customer hoặc Admin đặt hộ)
exports.createBooking = async (req, res) => {
  try {
    const { courtId, bookingDate, startTime, endTime, note, targetUserId } = req.body;

    // Kiểm tra sân có tồn tại và đang hoạt động không
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Sân không tồn tại' });
    }
    if (court.status === 'MAINTENANCE') {
      return res.status(400).json({ message: 'Sân đang bảo trì, không thể đặt' });
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      return res.status(400).json({ message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu' });
    }

    // Tự động cập nhật các đơn hết hạn trước khi kiểm tra trùng lịch
    await autoUpdateExpiredBookings({ court: courtId, bookingDate });

    // 1. CHỐNG RACE CONDITION / TRÙNG LỊCH:
    // Hai khoảng thời gian [A, B] và [C, D] trùng nhau khi: A < D && B > C
    const conflictingBooking = await Booking.findOne({
      court: courtId,
      bookingDate,
      status: { $in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
      $expr: {$and: [
          { $lt: [startTime, "$endTime"] },
          { $gt: [endTime, "$startTime"] }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(409).json({
        message: 'Khung giờ này đã có người đặt trước. Vui lòng chọn giờ khác!'
      });
    }

    // 2. TỰ ĐỘNG TÍNH TIỀN:
    const durationHours = (endMinutes - startMinutes) / 60;
    const totalPrice = Math.round(durationHours * court.pricePerHour);

    // Xác định người đặt: nếu Admin truyền targetUserId thì đặt hộ, còn lại là chính user đăng nhập
    let bookedBy = req.user._id;
    if (req.user.role === 'ADMIN' && targetUserId) {
      bookedBy = targetUserId;
    }

    const booking = await Booking.create({
      user: bookedBy,
      court: courtId,
      bookingDate,
      startTime,
      endTime,
      durationHours,
      totalPrice,
      note,
      status: 'CONFIRMED'
    });

    res.status(201).json({
      success: true,
      message: 'Đặt sân thành công!',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xem lịch sử đặt sân của cá nhân (Tự động COMPLETED nếu đã qua giờ)
// @route   GET /api/v1/bookings/my-bookings
// @access  Private (Customer)
exports.getMyBookings = async (req, res) => {
  try {
    // Tự động quét và hoàn tất các đơn quá hạn của user này
    await autoUpdateExpiredBookings({ user: req.user._id });

    const bookings = await Booking.find({ user: req.user._id })
      .populate('court', 'name type pricePerHour images')
      .sort({ bookingDate: -1, startTime: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin xem danh sách tất cả lịch đặt (Tự động COMPLETED nếu đã qua giờ)
// @route   GET /api/v1/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const { date, courtId, status } = req.query;

    // Tự động cập nhật toàn bộ các đơn quá hạn trong hệ thống
    await autoUpdateExpiredBookings();

    const filter = {};
    if (date) filter.bookingDate = date;
    if (courtId) filter.court = courtId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('user', 'fullName phoneNumber email')
      .populate('court', 'name type pricePerHour')
      .sort({ bookingDate: -1, startTime: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Khách hàng hủy lịch (Có điều kiện: trước giờ đánh ít nhất 2 tiếng)
// @route   PATCH /api/v1/bookings/:id/cancel
// @access  Private (Customer)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy lịch đặt' });
    }

    // Đảm bảo chỉ chính chủ hoặc Admin mới được hủy
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Bạn không có quyền hủy lịch này' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Lịch này đã được hủy trước đó' });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Trận đấu đã kết thúc, không thể hủy lịch' });
    }

    // Kiểm tra điều kiện thời gian hủy đối với Customer: trước giờ bắt đầu tối thiểu 2 tiếng
    if (req.user.role !== 'ADMIN') {
      const bookingDateTime = new Date(`${booking.bookingDate}T${booking.startTime}:00`);
      const now = new Date();
      const diffHours = (bookingDateTime - now) / (1000 * 60 * 60);

      if (diffHours < 2) {
        return res.status(400).json({
          message: 'Chỉ được phép hủy lịch trước giờ chơi ít nhất 2 tiếng. Vui lòng liên hệ ban quản lý!'
        });
      }
    }

    booking.status = 'CANCELLED';
    await booking.save();

    res.json({ success: true, message: 'Đã hủy lịch đặt thành công', data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin cập nhật trạng thái lịch đặt (PENDING, CONFIRMED, COMPLETED, CANCELLED)
// @route   PATCH /api/v1/bookings/:id/status
// @access  Private (Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy lịch đặt' });
    }

    res.json({ success: true, message: 'Cập nhật trạng thái thành công', data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};