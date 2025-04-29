const { ErrorResponse } = require('../middlewares/errorHandler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const { _users } = require('./authController'); // 导入用户数据

/**
 * @desc    获取所有用户
 * @route   GET /api/v1/users
 * @access  私有/管理员
 */
exports.getUsers = async (req, res, next) => {
  try {
    // 模拟从JWT解析用户ID和角色
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new ErrorResponse('未授权访问', 401));
    }
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const currentUser = _users.find(u => u.id === decoded.id);
      
      // 检查是否为管理员
      if (!currentUser || currentUser.role !== 'admin') {
        return next(new ErrorResponse('无权访问此资源', 403));
      }
      
      // 为了安全起见，不返回密码
      const usersWithoutPasswords = _users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.status(200).json({
        success: true,
        message: '获取用户列表成功',
        count: usersWithoutPasswords.length,
        data: usersWithoutPasswords
      });
    } catch (error) {
      return next(new ErrorResponse('未授权访问', 401));
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    获取单个用户
 * @route   GET /api/v1/users/:id
 * @access  私有/管理员
 */
exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 查找用户
    const user = _users.find(user => user.id === id);
    
    if (!user) {
      return next(new ErrorResponse(`未找到ID为${id}的用户`, 404));
    }
    
    // 模拟从JWT解析用户ID和角色
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new ErrorResponse('未授权访问', 401));
    }
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const currentUser = _users.find(u => u.id === decoded.id);
      
      // 检查权限 - 只有管理员或用户本人可以查看
      if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== id)) {
        return next(new ErrorResponse('无权访问此资源', 403));
      }
      
      // 为了安全起见，不返回密码
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({
        success: true,
        message: '获取用户详情成功',
        data: userWithoutPassword
      });
    } catch (error) {
      return next(new ErrorResponse('未授权访问', 401));
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    更新用户信息
 * @route   PUT /api/v1/users/:id
 * @access  私有
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 查找用户
    const userIndex = _users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return next(new ErrorResponse(`未找到ID为${id}的用户`, 404));
    }
    
    // 模拟从JWT解析用户ID
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new ErrorResponse('未授权访问', 401));
    }
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const currentUser = _users.find(u => u.id === decoded.id);
      
      // 检查权限 - 只有用户本人可以更新自己的信息
      if (!currentUser || currentUser.id !== id) {
        return next(new ErrorResponse('无权更新此用户信息', 403));
      }
      
      // 不允许更新某些字段
      const { password, role, id: userId, ...updateData } = req.body;
      
      // 更新用户
      const updatedUser = {
        ..._users[userIndex],
        ...updateData
      };
      
      // 保存更新后的用户
      _users[userIndex] = updatedUser;
      
      // 为了安全起见，不返回密码
      const { password: userPassword, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json({
        success: true,
        message: '用户信息更新成功',
        data: userWithoutPassword
      });
    } catch (error) {
      return next(new ErrorResponse('未授权访问', 401));
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    删除用户
 * @route   DELETE /api/v1/users/:id
 * @access  私有/管理员
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 查找用户
    const userIndex = _users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return next(new ErrorResponse(`未找到ID为${id}的用户`, 404));
    }
    
    // 模拟从JWT解析用户ID和角色
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new ErrorResponse('未授权访问', 401));
    }
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const currentUser = _users.find(u => u.id === decoded.id);
      
      // 检查权限 - 只有管理员可以删除用户
      if (!currentUser || currentUser.role !== 'admin') {
        return next(new ErrorResponse('无权删除用户', 403));
      }
      
      // 删除用户
      _users.splice(userIndex, 1);
      
      res.status(200).json({
        success: true,
        message: '用户删除成功'
      });
    } catch (error) {
      return next(new ErrorResponse('未授权访问', 401));
    }
  } catch (err) {
    next(err);
  }
};
