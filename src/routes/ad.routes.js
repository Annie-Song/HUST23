const express = require('express');
const router = express.Router();
const { 
  getAds, 
  getAd, 
  createAd, 
  updateAd, 
  deleteAd, 
  uploadAdMedia,
  submitForReview,
  approveAd,
  rejectAd,
  pauseAd,
  resumeAd
} = require('../controllers/adController');

// 路由定义
// 获取所有广告
router.get('/', getAds);

// 获取单个广告
router.get('/:id', getAd);

// 创建广告
router.post('/', createAd);

// 更新广告
router.put('/:id', updateAd);

// 删除广告
router.delete('/:id', deleteAd);

// 上传广告媒体
router.post('/:id/media', uploadAdMedia);

// 提交审核
router.put('/:id/review', submitForReview);

// 批准广告（只有管理员或审核员）
router.put('/:id/approve', approveAd);

// 拒绝广告（只有管理员或审核员）
router.put('/:id/reject', rejectAd);

// 暂停广告
router.put('/:id/pause', pauseAd);

// 恢复广告
router.put('/:id/resume', resumeAd);

module.exports = router; 