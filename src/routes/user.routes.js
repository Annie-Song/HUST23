const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser
} = require('../controllers/userController');

// 路由定义
// 获取所有用户
router.get('/', getUsers);

// 获取当前用户信息
router.get('/me', getUser);

// 获取单个用户
router.get('/:id', getUser);

// 更新用户信息
router.put('/:id', updateUser);

// 删除用户
router.delete('/:id', deleteUser);

module.exports = router;