const mongoose = require('mongoose');

const ImpressionSchema = new mongoose.Schema({
  ad: {
    type: mongoose.Schema.ObjectId,
    ref: 'Ad',
    required: [true, '展示记录必须关联广告']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  referer: {
    type: String
  },
  // 按日期统计的字段
  date: {
    type: Date,
    index: true
  },
  count: {
    type: Number,
    default: 1
  }
});

// 创建索引以提高查询性能
ImpressionSchema.index({ ad: 1, timestamp: 1 });
ImpressionSchema.index({ ad: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Impression', ImpressionSchema); 