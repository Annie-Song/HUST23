const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, '支付记录必须关联用户']
  },
  amount: {
    type: Number,
    required: [true, '请提供支付金额'],
    min: [0.01, '支付金额必须大于0']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['alipay', 'wechat', 'creditcard', 'banktransfer'],
    required: [true, '请提供支付方式']
  },
  orderId: {
    type: String,
    unique: true,
    required: [true, '请提供订单号']
  },
  description: {
    type: String,
    default: '广告账户充值'
  },
  // 外部支付系统的交易ID
  transactionId: {
    type: String
  },
  // 支付凭证（如回调数据）
  paymentProof: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  // 是否已开发票
  invoiced: {
    type: Boolean,
    default: false
  }
});

// 创建索引
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });

// 更新支付状态方法
PaymentSchema.methods.updateStatus = async function(status, details = {}) {
  this.status = status;
  
  if (status === 'completed') {
    this.completedAt = details.completedAt || Date.now();
    this.transactionId = details.transactionId || this.transactionId;
    
    // 如果支付成功，更新用户余额
    if (this.user) {
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(this.user, {
        $inc: { balance: this.amount }
      });
    }
  }
  
  return this.save();
};

module.exports = mongoose.model('Payment', PaymentSchema);
