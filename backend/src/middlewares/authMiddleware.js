const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực xem user đã đăng nhập chưa
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Người dùng không tồn tại' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Vui lòng đăng nhập để thực hiện chức năng này' });
  }
};

// Middleware phân quyền chỉ dành cho Quản trị viên (ADMIN)
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ message: 'Chỉ quản trị viên mới có quyền thực hiện thao tác này' });
};

module.exports = { protect, authorizeAdmin };