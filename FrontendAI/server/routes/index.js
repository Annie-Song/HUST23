const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// 广告相关路由
router.get('/ads', require('../controllers/ad').getAds);
router.get('/ads/:id', require('../controllers/ad').getAdById);
router.post('/ads', auth, upload.single('file'), require('../controllers/ad').createAd);
router.put('/ads/:id', auth, upload.single('file'), require('../controllers/ad').updateAd);
router.delete('/ads/:id', auth, require('../controllers/ad').deleteAd);

// 广告数据统计路由
router.get('/analytics/:id', auth, require('../controllers/analytics').getAnalytics);
router.post('/analytics/impression', require('../controllers/analytics').recordImpression);
router.post('/analytics/click', require('../controllers/analytics').recordClick);
router.post('/analytics/view', require('../controllers/analytics').recordViewTime);

// 广告策略路由
router.get('/strategy/:id', auth, require('../controllers/strategy').getStrategy);
router.post('/strategy', auth, require('../controllers/strategy').updateStrategy);

// 广告审核路由
router.get('/review/:id', auth, require('../controllers/review').getReview);
router.post('/review', auth, require('../controllers/review').submitReview);
router.put('/review/:id', auth, require('../controllers/review').updateReview);

// 用户相关路由
router.post('/register', require('../controllers/user').register);
router.post('/login', require('../controllers/user').login);
router.get('/profile', auth, require('../controllers/user').getProfile);
router.put('/profile', auth, require('../controllers/user').updateProfile);

// 支付相关路由
router.post('/payment/create', auth, require('../controllers/payment').createPayment);
router.post('/payment/callback', require('../controllers/payment').handleCallback);

module.exports = router; 