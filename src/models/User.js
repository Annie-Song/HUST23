const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请提供姓名']
  },
  email: {
    type: String,
    required: [true, '请提供电子邮箱'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      '请提供有效的电子邮箱'
    ]
  },
  phone: {
    type: String,
    match: [
      /^1[3-9]\d{9}$/,
      '请提供有效的手机号码'
    ]
  },
  password: {
    type: String,
    required: [true, '请提供密码'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'advertiser', 'admin'],
    default: 'advertiser'
  },
  company: {
    name: String,
    position: String,
    industry: String
  },
  balance: {
    type: Number,
    default: 0
  },
  // 用户状态
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  // 默认发票信息
  defaultInvoiceInfo: {
    title: String,
    type: {
      type: String,
      enum: ['普通发票', '增值税专用发票']
    },
    taxNumber: String,
    bankName: String,
    bankAccount: String,
    address: String,
    phone: String
  },
  // 用于密码重置
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // 用于邮箱验证
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// 密码加密
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 签署JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// 校验密码
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 生成重置密码的token
UserSchema.methods.getResetPasswordToken = function() {
  // 生成token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 哈希token并设置到resetPasswordToken字段
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 设置过期时间 - 1小时
  this.resetPasswordExpire = Date.now() + 3600000;

  return resetToken;
};

// 生成邮箱验证token
UserSchema.methods.getEmailVerificationToken = function() {
  // 生成token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // 哈希token并设置到emailVerificationToken字段
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  return verificationToken;
};

// 更新用户最后登录时间
UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
