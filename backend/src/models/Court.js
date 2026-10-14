const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên sân'],
      trim: true,
      unique: true
    },
    type: {
      type: String,
      enum: ['STANDARD', 'VIP'],
      default: 'STANDARD'
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Vui lòng nhập giá thuê mỗi giờ'],
      min: 0
    },
    images: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'MAINTENANCE'],
      default: 'AVAILABLE'
    },
    description: {
      type: String,
      default: ''
    },
    // Giờ mở cửa & Giờ đóng cửa của từng sân
    openTime: {
      type: String,
      default: '06:00',
      trim: true
    },
    closeTime: {
      type: String,
      default: '22:00',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Court', courtSchema);