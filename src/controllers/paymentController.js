const { ErrorResponse } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');
const Payment = require('../models/Payment');
const User = require('../models/User');
const crypto = require('crypto');
const axios = require('axios');
const config = require('../config/config');

/**
 * @desc    获取所有充值记录
 * @route   GET /api/v1/payments
 * @access  私有
 */
exports.getPayments = async (req, res, next) => {
  try {
    // 构建查询条件
    const queryObj = { user: req.user.id };
    
    // 获取查询参数
    const { status, startDate, endDate, minAmount, maxAmount } = req.query;
    
    // 根据参数添加过滤条件
    if (status) {
      queryObj.status = status;
    }
    
    if (startDate) {
      queryObj.createdAt = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      if (!queryObj.createdAt) queryObj.createdAt = {};
      queryObj.createdAt.$lte = new Date(endDate);
    }
    
    if (minAmount) {
      queryObj.amount = { $gte: Number(minAmount) };
    }
    
    if (maxAmount) {
      if (!queryObj.amount) queryObj.amount = {};
      queryObj.amount.$lte = Number(maxAmount);
    }
    
    // 查询并排序支付记录
    const payments = await Payment.find(queryObj).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      message: '获取充值记录成功',
      count: payments.length,
      data: payments
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    获取单个充值记录
 * @route   GET /api/v1/payments/:id
 * @access  私有
 */
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return next(new ErrorResponse(`未找到ID为${req.params.id}的充值记录`, 404));
    }
    
    // 确保用户只能查看自己的充值记录
    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('无权查看此充值记录', 403));
    }
    
    res.status(200).json({
      success: true,
      message: '获取充值记录详情成功',
      data: payment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    创建充值记录（发起支付）
 * @route   POST /api/v1/payments
 * @access  私有
 */
exports.createPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    if (!amount || amount <= 0) {
      return next(new ErrorResponse('请提供有效的充值金额', 400));
    }
    
    if (!paymentMethod || !['alipay', 'wechat', 'creditcard', 'banktransfer'].includes(paymentMethod)) {
      return next(new ErrorResponse('请提供有效的支付方式', 400));
    }
    
    // 生成订单ID
    const orderId = `ord_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // 创建支付记录
    const payment = await Payment.create({
      user: req.user.id,
      amount,
      status: 'pending',
      paymentMethod,
      orderId,
      description: req.body.description || '广告账户充值'
    });
    
    // 生成支付信息（实际项目中应对接具体支付平台API）
    let paymentData = {
      paymentUrl: '',
      qrCode: '',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30分钟有效期
    };
    
    // 根据支付方式生成支付信息
    switch(paymentMethod) {
      case 'alipay':
        // 这里应该是调用支付宝开放平台API获取支付链接
        paymentData.paymentUrl = `https://example.com/pay/alipay/${orderId}`;
        paymentData.qrCode = `https://example.com/qrcode/alipay/${orderId}`;
        break;
      case 'wechat':
        // 这里应该是调用微信支付API获取支付二维码
        paymentData.paymentUrl = `https://example.com/pay/wechat/${orderId}`;
        paymentData.qrCode = `https://example.com/qrcode/wechat/${orderId}`;
        break;
      case 'creditcard':
        // 这里应该是调用信用卡支付页面
        paymentData.paymentUrl = `https://example.com/pay/creditcard/${orderId}`;
        break;
      case 'banktransfer':
        // 银行转账提供账号信息
        paymentData = {
          accountName: '广告平台账户',
          accountNumber: '6222000000000000000',
          bankName: '示例银行',
          reference: orderId, // 转账备注，用于识别
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时有效期
        };
        break;
    }
    
    // 只用于模拟支付成功回调，实际项目中应通过异步通知接收支付结果
    // 模拟在10秒后支付成功
    if (config.environment === 'development') {
      setTimeout(async () => {
        try {
          // 查找支付记录
          const paymentToUpdate = await Payment.findById(payment._id);
          if (paymentToUpdate && paymentToUpdate.status === 'pending') {
            // 更新支付状态
            await paymentToUpdate.updateStatus('completed', {
              transactionId: `tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
            });
            
            logger.info(`用户${req.user.id}充值${amount}元成功(模拟支付)`);
          }
        } catch (err) {
          logger.error(`模拟支付更新失败: ${err.message}`);
        }
      }, 10000);
    }
    
    res.status(201).json({
      success: true,
      message: '支付请求已创建',
      data: {
        payment: {
          id: payment._id,
          amount: payment.amount,
          status: payment.status,
          orderId: payment.orderId,
          createdAt: payment.createdAt
        },
        paymentInfo: paymentData
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    查询支付状态
 * @route   GET /api/v1/payments/:id/status
 * @access  私有
 */
exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return next(new ErrorResponse(`未找到ID为${req.params.id}的支付记录`, 404));
    }
    
    // 确保用户只能查询自己的支付状态
    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('无权查询此支付状态', 403));
    }
    
    // 如果支付处于待支付状态，可以查询第三方支付平台（模拟）
    if (payment.status === 'pending') {
      // 这里实际项目中应调用第三方支付平台API查询状态
      // 模拟随机状态变化（仅开发环境使用）
      if (config.environment === 'development' && Math.random() > 0.7) {
        await payment.updateStatus('completed', {
          transactionId: `tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: '获取支付状态成功',
      data: {
        status: payment.status,
        orderId: payment.orderId,
        amount: payment.amount,
        completedAt: payment.completedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    模拟支付回调（仅用于测试）
 * @route   POST /api/v1/payments/callback/:method
 * @access  公开
 */
exports.paymentCallback = async (req, res, next) => {
  try {
    const { method } = req.params;
    const { orderId, amount, status, transactionId, signature } = req.body;
    
    // 实际项目中需要验证签名确保回调真实性
    // 这里简单验证一下必要参数
    if (!orderId || !amount || !status) {
      return next(new ErrorResponse('回调参数不完整', 400));
    }
    
    // 查找对应的支付记录
    const payment = await Payment.findOne({ orderId });
    
    if (!payment) {
      return next(new ErrorResponse(`未找到订单号为${orderId}的支付记录`, 404));
    }
    
    // 防止重复处理
    if (payment.status !== 'pending') {
      return res.status(200).json({ success: true, message: '支付已处理' });
    }
    
    // 验证金额
    if (Number(amount) !== payment.amount) {
      logger.error(`支付金额不匹配: 期望${payment.amount}, 收到${amount}`);
      return next(new ErrorResponse('支付金额不匹配', 400));
    }
    
    // 处理支付结果
    if (status === 'success') {
      await payment.updateStatus('completed', {
        transactionId: transactionId || `tx_${Date.now()}`,
        paymentProof: req.body
      });
      
      logger.info(`订单${orderId}支付成功（回调通知）`);
    } else if (status === 'failed') {
      await payment.updateStatus('failed');
      logger.info(`订单${orderId}支付失败（回调通知）`);
    }
    
    // 根据支付平台要求返回不同的成功响应
    switch(method) {
      case 'alipay':
        return res.status(200).send('success');
      case 'wechat':
        return res.status(200).json({ code: 'SUCCESS', message: 'OK' });
      default:
        return res.status(200).json({ success: true, message: '回调处理成功' });
    }
  } catch (err) {
    // 记录错误但总是返回成功（防止支付平台重复通知）
    logger.error(`支付回调处理错误: ${err.message}`);
    return res.status(200).json({ success: true, message: '已收到通知' });
  }
};

/**
 * @desc    获取充值统计
 * @route   GET /api/v1/payments/stats
 * @access  私有
 */
exports.getPaymentStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // 构建匹配条件
    const matchStage = { user: req.user._id };
    
    if (startDate) {
      if (!matchStage.createdAt) matchStage.createdAt = {};
      matchStage.createdAt.$gte = new Date(startDate);
    }
    
    if (endDate) {
      if (!matchStage.createdAt) matchStage.createdAt = {};
      matchStage.createdAt.$lte = new Date(endDate);
    }
    
    // 聚合统计
    const stats = await Payment.aggregate([
      { $match: matchStage },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // 计算总的统计数据
    const totalStats = await Payment.aggregate([
      { $match: matchStage },
      { $group: {
        _id: null,
        totalCount: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' }
      }}
    ]);
    
    res.status(200).json({
      success: true,
      message: '获取充值统计成功',
      data: {
        byStatus: stats,
        summary: totalStats[0] || {
          totalCount: 0,
          totalAmount: 0,
          avgAmount: 0,
          minAmount: 0,
          maxAmount: 0
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = exports;
