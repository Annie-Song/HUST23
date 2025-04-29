const express = require('express');
const router = express.Router();
const { 
  getAd, 
  getBannerAd,
  getPopupAd,
  getVideoAd,
  getTextAd,
  getNativeAd,
  getAdScript,
  trackImpression, 
  trackClick,
  getApiKey,
  regenerateApiKey,
  getStats
} = require('../controllers/apiController');

// 中间件导入
const { protect } = require('../middlewares/auth');

// 公开路由
// 获取广告接口
router.get('/ads', getAd);

// 获取特定类型广告接口
router.get('/ads/banner', getBannerAd);
router.get('/ads/popup', getPopupAd);
router.get('/ads/video', getVideoAd);
router.get('/ads/text', getTextAd);
router.get('/ads/native', getNativeAd);

// 广告脚本
router.get('/ads/script/:key', getAdScript);

// 广告展示追踪
router.post('/track/impression/:adId', trackImpression);

// 广告点击追踪
router.post('/track/click/:adId', trackClick);

// 保护的路由 - 需要身份验证
router.use(protect);

// 获取API密钥
router.get('/keys', getApiKey);

// 重新生成API密钥
router.post('/keys/regenerate', regenerateApiKey);

// 获取API调用统计
router.get('/stats', getStats);

module.exports = router; 