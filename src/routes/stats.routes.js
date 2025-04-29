const express = require('express');
const router = express.Router();
const { 
  getAdStats, 
  getOverallStats,
  recordImpression,
  recordClick,
  recordConversion
} = require('../controllers/statsController');

// 中间件导入
const { protect } = require('../middlewares/auth');

// 公开路由 - 广告统计记录
router.post('/impression', recordImpression);
router.post('/click', recordClick);
router.post('/conversion', recordConversion);

// 保护路由 - 需要身份验证
router.use(protect);

// 获取单个广告的统计数据
router.get('/ads/:id', getAdStats);

// 获取整体统计数据
router.get('/overall', getOverallStats);

module.exports = router; 