const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请提供广告名称'],
    trim: true,
    maxlength: [100, '广告名称不能超过100个字符']
  },
  type: {
    type: String,
    required: [true, '请提供广告类型'],
    enum: ['banner', 'popup', 'video', 'text', 'native', 'overlay']
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'active', 'paused', 'rejected', 'completed', 'archived'],
    default: 'draft'
  },
  content: {
    type: String,
    required: [true, '请提供广告内容']
  },
  mediaUrl: {
    type: String
  },
  targetUrl: {
    type: String,
    required: [true, '请提供广告目标URL']
  },
  startDate: {
    type: Date,
    required: [true, '请提供广告开始日期']
  },
  endDate: {
    type: Date,
    required: [true, '请提供广告结束日期']
  },
  budget: {
    type: Number,
    required: [true, '请提供广告预算']
  },
  spent: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, '广告必须关联用户']
  },
  audience: {
    ageRange: [String],
    gender: [String],
    interests: [String],
    location: [String]
  },
  pricing: {
    model: {
      type: String,
      enum: ['CPC', 'CPM', 'CPA'],
      required: [true, '请提供定价模型']
    },
    value: {
      type: Number,
      required: [true, '请提供单价']
    }
  },
  review: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    feedback: String,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 索引用于提高查询性能
AdSchema.index({ user: 1, status: 1 });
AdSchema.index({ startDate: 1, endDate: 1 });

// 保存前验证
AdSchema.pre('save', function(next) {
  if (new Date(this.startDate) > new Date(this.endDate)) {
    return next(new Error('开始日期不能晚于结束日期'));
  }
  next();
});

// 更新时自动更新updatedAt字段
AdSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// 方法：提交审核
AdSchema.methods.submitForReview = function() {
  if (this.status !== 'draft') {
    throw new Error('只有草稿状态的广告可以提交审核');
  }
  
  this.status = 'pending_review';
  this.review.status = 'pending';
  this.updatedAt = Date.now();
  return this.save();
};

// 方法：计算广告剩余预算
AdSchema.methods.getRemainingBudget = function() {
  return this.budget - this.spent;
};

// 方法：暂停广告
AdSchema.methods.pause = function() {
  if (this.status !== 'active') {
    throw new Error('只有活跃状态的广告可以暂停');
  }
  
  this.status = 'paused';
  this.updatedAt = Date.now();
  return this.save();
};

// 方法：恢复广告
AdSchema.methods.resume = function() {
  if (this.status !== 'paused') {
    throw new Error('只有暂停状态的广告可以恢复');
  }
  
  this.status = 'active';
  this.updatedAt = Date.now();
  return this.save();
};

// 静态方法：获取用户的所有广告
AdSchema.statics.getUserAds = function(userId) {
  return this.find({ user: userId }).sort('-createdAt');
};

module.exports = mongoose.model('Ad', AdSchema);
