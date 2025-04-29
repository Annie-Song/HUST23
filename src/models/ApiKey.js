const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'API密钥必须关联用户']
  },
  key: {
    type: String,
    required: [true, '请提供API密钥'],
    unique: true,
    index: true
  },
  active: {
    type: Boolean,
    default: true
  },
  callCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 不允许导出敏感密钥信息
ApiKeySchema.methods.toJSON = function() {
  const obj = this.toObject();
  // 屏蔽完整密钥，只显示一部分
  if (obj.key) {
    obj.key = obj.key.substring(0, 8) + '...' + obj.key.substring(obj.key.length - 4);
  }
  return obj;
};

module.exports = mongoose.model('ApiKey', ApiKeySchema); 