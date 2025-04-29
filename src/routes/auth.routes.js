const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  updatePassword 
} = require('../controllers/authController');

// 路由定义
// 注册
router.post('/register', register);

// 登录
router.post('/login', login);

// 获取当前用户信息
router.get('/me', getMe);

// 忘记密码
router.post('/forgotpassword', forgotPassword);

// 重置密码
router.put('/resetpassword/:resettoken', resetPassword);

// 更新密码
router.put('/updatepassword', updatePassword);

module.exports = router; 