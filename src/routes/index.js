const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');

// 导入各模块路由
const authRoutes = require('./auth.routes');
const adRoutes = require('./ad.routes');
const userRoutes = require('./user.routes');
const paymentRoutes = require('./payment.routes');
const invoiceRoutes = require('./invoice.routes');
const statsRoutes = require('./stats.routes');
const apiRoutes = require('./api.routes');

// 使用路由
router.use('/auth', authRoutes);
router.use('/ads', protect, adRoutes);
router.use('/users', protect, userRoutes);
router.use('/payments', protect, paymentRoutes);
router.use('/invoices', protect, invoiceRoutes);
router.use('/stats', protect, statsRoutes);
router.use('/api', apiRoutes); // API接口部分路由需要密钥，部分需要JWT认证

// API健康检查
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '广告平台API服务运行正常'
  });
});

module.exports = router; 