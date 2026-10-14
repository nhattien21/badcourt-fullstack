const express = require('express');
const {
  getCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt
} = require('../controllers/courtController');
const { protect, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Khách hàng và Admin đều có thể xem danh sách & chi tiết sân
router.get('/', getCourts);
router.get('/:id', getCourtById);

// Chỉ Admin mới được thêm, sửa, xóa sân
router.post('/', protect, authorizeAdmin, createCourt);
router.put('/:id', protect, authorizeAdmin, updateCourt);
router.delete('/:id', protect, authorizeAdmin, deleteCourt);

module.exports = router;