const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, '发票必须关联用户']
  },
  // 发票抬头
  title: {
    type: String,
    required: [true, '请提供发票抬头'],
    trim: true
  },
  // 税号（增值税专用发票必填）
  taxNumber: {
    type: String,
    trim: true
  },
  // 开户行（增值税专用发票必填）
  bankName: {
    type: String,
    trim: true
  },
  // 银行账号（增值税专用发票必填）
  bankAccount: {
    type: String,
    trim: true
  },
  // 单位地址（增值税专用发票必填）
  companyAddress: {
    type: String,
    trim: true
  },
  // 联系电话（增值税专用发票必填）
  companyPhone: {
    type: String,
    trim: true
  },
  // 发票类型
  type: {
    type: String,
    enum: ['普通发票', '增值税专用发票'],
    default: '普通发票',
    required: true
  },
  // 发票金额
  amount: {
    type: Number,
    required: [true, '请提供发票金额'],
    min: [0.01, '发票金额必须大于0']
  },
  // 发票内容
  content: {
    type: String,
    default: '技术服务费'
  },
  // 收件人信息
  recipientInfo: {
    name: {
      type: String,
      required: [true, '请提供收件人姓名']
    },
    phone: {
      type: String,
      required: [true, '请提供收件人电话']
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        '请提供有效的邮箱'
      ]
    },
    address: {
      type: String,
      required: [true, '请提供收件地址']
    },
    postalCode: {
      type: String
    }
  },
  // 关联的支付记录ID
  payments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Payment'
  }],
  // 发票状态
  status: {
    type: String,
    enum: ['pending', 'processing', 'issued', 'mailed', 'received', 'rejected', 'cancelled'],
    default: 'pending'
  },
  // 发票号码（开具后填写）
  invoiceNumber: {
    type: String,
    trim: true
  },
  // 发票代码（开具后填写）
  invoiceCode: {
    type: String,
    trim: true
  },
  // 开票日期（开具后填写）
  issuedAt: {
    type: Date
  },
  // 快递信息（邮寄后填写）
  shipmentInfo: {
    carrier: String,
    trackingNumber: String,
    shippedAt: Date
  },
  // 电子发票下载链接
  downloadUrl: {
    type: String
  },
  // 备注
  notes: {
    type: String,
    maxlength: [500, '备注不能超过500个字符']
  },
  // 申请时间
  requestedAt: {
    type: Date,
    default: Date.now
  },
  // 最后更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时自动更新updatedAt字段
InvoiceSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// 保存前验证增值税专用发票必填信息
InvoiceSchema.pre('save', function(next) {
  if (this.type === '增值税专用发票') {
    if (!this.taxNumber) {
      return next(new Error('增值税专用发票必须提供税号'));
    }
    if (!this.bankName || !this.bankAccount) {
      return next(new Error('增值税专用发票必须提供开户行和银行账号'));
    }
    if (!this.companyAddress) {
      return next(new Error('增值税专用发票必须提供单位地址'));
    }
    if (!this.companyPhone) {
      return next(new Error('增值税专用发票必须提供单位电话'));
    }
  }
  next();
});

// 方法：更新发票状态
InvoiceSchema.methods.updateStatus = function(status, details = {}) {
  this.status = status;
  
  // 根据状态更新相关字段
  switch (status) {
    case 'issued':
      this.issuedAt = details.issuedAt || Date.now();
      this.invoiceNumber = details.invoiceNumber;
      this.invoiceCode = details.invoiceCode;
      this.downloadUrl = details.downloadUrl;
      break;
    case 'mailed':
      this.shipmentInfo = {
        carrier: details.carrier,
        trackingNumber: details.trackingNumber,
        shippedAt: details.shippedAt || Date.now()
      };
      break;
    case 'rejected':
      this.notes = details.notes || this.notes;
      break;
  }
  
  this.updatedAt = Date.now();
  return this.save();
};

// 静态方法：获取用户所有发票
InvoiceSchema.statics.getUserInvoices = function(userId) {
  return this.find({ user: userId }).sort('-requestedAt');
};

module.exports = mongoose.model('Invoice', InvoiceSchema); 