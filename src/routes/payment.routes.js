const express = require('express');
const router = express.Router();
const { 
  getPayments, 
  getPayment, 
  createPayment,
  checkPaymentStatus,
  paymentCallback,
  getPaymentStats
} = require('../controllers/paymentController');

// 中间件导入
const { protect, authorize } = require('../middlewares/auth');

// 保护路由
router.use(protect);

// 路由定义
// 获取所有充值记录
router.get('/', getPayments);

// 获取充值统计
router.get('/stats', getPaymentStats);

// 获取单个充值记录
router.get('/:id', getPayment);

// 检查支付状态
router.get('/:id/status', checkPaymentStatus);

// 创建充值记录
router.post('/', createPayment);

// 公开路由 - 支付回调
router.post('/callback/:method', paymentCallback);

module.exports = router; 