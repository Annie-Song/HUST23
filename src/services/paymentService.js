const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/config');
const logger = require('../utils/logger');
const Payment = require('../models/Payment');
const User = require('../models/User');

/**
 * 支付服务类 - 处理不同支付渠道的交互
 */
class PaymentService {
  /**
   * 创建支付订单
   * @param {Object} paymentData - 支付数据
   * @param {string} paymentData.userId - 用户ID
   * @param {number} paymentData.amount - 支付金额
   * @param {string} paymentData.paymentMethod - 支付方式
   * @returns {Promise<Object>} - 支付链接或二维码等信息
   */
  static async createPayment(paymentData) {
    try {
      // 验证基本数据
      const { userId, amount, paymentMethod } = paymentData;
      
      if (!userId || !amount || amount <= 0 || !paymentMethod) {
        throw new Error('支付信息不完整或金额无效');
      }
      
      // 根据支付方式调用不同的支付处理方法
      let paymentInfo;
      
      switch (paymentMethod) {
        case 'alipay':
          paymentInfo = await this.processAlipayPayment(paymentData);
          break;
        case 'wechat_pay':
          paymentInfo = await this.processWechatPayment(paymentData);
          break;
        case 'credit_card':
          paymentInfo = await this.processCreditCardPayment(paymentData);
          break;
        default:
          throw new Error(`不支持的支付方式: ${paymentMethod}`);
      }
      
      // 创建支付记录
      const payment = await Payment.create({
        user: userId,
        amount,
        type: 'deposit',
        status: 'pending',
        paymentMethod,
        paymentDetails: {
          transactionId: paymentInfo.transactionId,
          provider: paymentMethod
        },
        createdAt: Date.now()
      });
      
      return {
        paymentId: payment._id,
        ...paymentInfo
      };
    } catch (error) {
      logger.error(`创建支付失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 处理支付宝支付
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>} - 支付链接或二维码等信息
   */
  static async processAlipayPayment(paymentData) {
    try {
      // 这里应该集成实际的支付宝API
      // 以下为模拟实现
      
      const { amount } = paymentData;
      const outTradeNo = `ALI${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      logger.info(`发起支付宝支付请求: ${outTradeNo}, 金额: ${amount}`);
      
      // 模拟API请求
      // 在实际应用中，应该使用支付宝SDK或直接调用支付宝API
      /*
      const result = await axios.post('https://openapi.alipay.com/gateway.do', {
        app_id: config.payment.alipay.appId,
        method: 'alipay.trade.page.pay',
        charset: 'utf-8',
        sign_type: 'RSA2',
        timestamp: new Date().toISOString(),
        version: '1.0',
        notify_url: 'https://www.your-server.com/api/v1/payments/notify/alipay',
        biz_content: JSON.stringify({
          out_trade_no: outTradeNo,
          product_code: 'FAST_INSTANT_TRADE_PAY',
          total_amount: amount,
          subject: '广告平台充值',
          body: `账户充值 ${amount} 元`
        })
      });
      */
      
      // 模拟返回支付URL
      return {
        transactionId: outTradeNo,
        paymentUrl: `https://example.com/simulate/alipay?outTradeNo=${outTradeNo}&amount=${amount}`,
        qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAB9JREFUaN7twQENAAAAwiD7p34PBwwAAAAAAAAAAAAbBiZGAAFjjDY3AAAAAElFTkSuQmCC`
      };
    } catch (error) {
      logger.error(`处理支付宝支付失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 处理微信支付
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>} - 支付链接或二维码等信息
   */
  static async processWechatPayment(paymentData) {
    try {
      // 这里应该集成实际的微信支付API
      // 以下为模拟实现
      
      const { amount } = paymentData;
      const outTradeNo = `WX${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      logger.info(`发起微信支付请求: ${outTradeNo}, 金额: ${amount}`);
      
      // 模拟API请求
      // 在实际应用中，应该使用微信支付SDK或直接调用微信支付API
      /*
      const result = await axios.post('https://api.mch.weixin.qq.com/pay/unifiedorder', {
        appid: config.payment.wechat.appId,
        mch_id: config.payment.wechat.mchId,
        nonce_str: crypto.randomBytes(16).toString('hex'),
        body: '广告平台充值',
        out_trade_no: outTradeNo,
        total_fee: amount * 100, // 微信支付以分为单位
        spbill_create_ip: '127.0.0.1',
        notify_url: 'https://www.your-server.com/api/v1/payments/notify/wechat',
        trade_type: 'NATIVE' // 扫码支付
      });
      */
      
      // 模拟返回支付二维码
      return {
        transactionId: outTradeNo,
        codeUrl: `weixin://wxpay/bizpayurl?pr=${outTradeNo}`,
        qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAB9JREFUaN7twQENAAAAwiD7p34PBwwAAAAAAAAAAAAbBiZGAAFjjDY3AAAAAElFTkSuQmCC`
      };
    } catch (error) {
      logger.error(`处理微信支付失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 处理信用卡支付
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>} - 支付结果
   */
  static async processCreditCardPayment(paymentData) {
    try {
      // 这里应该集成实际的信用卡支付处理服务如Stripe
      // 以下为模拟实现
      
      const { amount, cardDetails } = paymentData;
      
      if (!cardDetails) {
        throw new Error('缺少信用卡信息');
      }
      
      const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = cardDetails;
      
      // 验证卡信息
      if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
        throw new Error('信用卡信息不完整');
      }
      
      // 模拟交易ID
      const chargeId = `CC${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      logger.info(`处理信用卡支付: ${chargeId}, 金额: ${amount}`);
      
      // 模拟信用卡处理
      // 在实际应用中，应该使用Stripe、PayPal或其他支付处理服务
      
      return {
        transactionId: chargeId,
        status: 'success',
        last4: cardNumber.slice(-4),
        cardType: this.getCardType(cardNumber)
      };
    } catch (error) {
      logger.error(`处理信用卡支付失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 验证支付通知
   * @param {Object} notificationData - 支付通知数据
   * @param {string} paymentMethod - 支付方式
   * @returns {Promise<boolean>} - 验证结果
   */
  static async verifyPaymentNotification(notificationData, paymentMethod) {
    try {
      switch (paymentMethod) {
        case 'alipay':
          return this.verifyAlipayNotification(notificationData);
        case 'wechat_pay':
          return this.verifyWechatNotification(notificationData);
        default:
          throw new Error(`不支持的支付通知类型: ${paymentMethod}`);
      }
    } catch (error) {
      logger.error(`验证支付通知失败: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 验证支付宝通知
   * @param {Object} notificationData - 通知数据
   * @returns {Promise<boolean>} - 验证结果
   */
  static async verifyAlipayNotification(notificationData) {
    // 这里应该实现支付宝通知签名验证
    // 暂时返回true作为示例
    return true;
  }
  
  /**
   * 验证微信支付通知
   * @param {Object} notificationData - 通知数据
   * @returns {Promise<boolean>} - 验证结果
   */
  static async verifyWechatNotification(notificationData) {
    // 这里应该实现微信支付通知签名验证
    // 暂时返回true作为示例
    return true;
  }
  
  /**
   * 处理支付完成
   * @param {string} paymentId - 支付记录ID
   * @param {string} transactionId - 支付平台交易ID
   * @returns {Promise<Object>} - 更新后的支付记录
   */
  static async completePayment(paymentId, transactionId) {
    try {
      // 查找支付记录
      const payment = await Payment.findById(paymentId);
      
      if (!payment) {
        throw new Error(`未找到支付记录: ${paymentId}`);
      }
      
      if (payment.status === 'completed') {
        logger.warn(`支付已经完成: ${paymentId}`);
        return payment;
      }
      
      // 更新支付状态
      payment.status = 'completed';
      payment.completedAt = Date.now();
      
      if (transactionId) {
        payment.paymentDetails.transactionId = transactionId;
      }
      
      await payment.save();
      
      // 更新用户余额
      if (payment.type === 'deposit') {
        const user = await User.findById(payment.user);
        
        if (user) {
          user.balance += payment.amount;
          await user.save();
          
          logger.info(`用户 ${user._id} 余额已更新: +${payment.amount}, 新余额: ${user.balance}`);
        }
      }
      
      logger.info(`支付已完成: ${paymentId}`);
      
      return payment;
    } catch (error) {
      logger.error(`完成支付失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 识别信用卡类型
   * @param {string} cardNumber - 信用卡号
   * @returns {string} - 卡类型
   */
  static getCardType(cardNumber) {
    // 简化的信用卡类型识别
    if (!cardNumber) return 'unknown';
    
    // 去除空格和破折号
    const cn = cardNumber.replace(/[\s-]/g, '');
    
    // 基本卡类型识别
    if (/^4/.test(cn)) return 'visa';
    if (/^5[1-5]/.test(cn)) return 'mastercard';
    if (/^3[47]/.test(cn)) return 'amex';
    if (/^6(?:011|5)/.test(cn)) return 'discover';
    if (/^35(?:2[89]|[3-8])/.test(cn)) return 'jcb';
    
    return 'unknown';
  }
}

module.exports = PaymentService;
