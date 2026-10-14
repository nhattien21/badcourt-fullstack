const Court = require('../models/Court');

// @desc    Lấy danh sách sân (Có lọc theo type, status)
// @route   GET /api/v1/courts
// @access  Public
exports.getCourts = async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;

    const courts = await Court.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: courts.length, data: courts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy chi tiết 1 sân
// @route   GET /api/v1/courts/:id
// @access  Public
exports.getCourtById = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }
    res.json({ success: true, data: court });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tạo sân mới
// @route   POST /api/v1/courts
// @access  Private/Admin
exports.createCourt = async (req, res) => {
  try {
    const court = await Court.create(req.body);
    res.status(201).json({ success: true, data: court });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cập nhật thông tin sân
// @route   PUT /api/v1/courts/:id
// @access  Private/Admin
exports.updateCourt = async (req, res) => {
  try {
    const court = await Court.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }
    res.json({ success: true, data: court });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Xóa sân
// @route   DELETE /api/v1/courts/:id
// @access  Private/Admin
exports.deleteCourt = async (req, res) => {
  try {
    const court = await Court.findByIdAndDelete(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }
    res.json({ success: true, message: 'Đã xóa sân thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};