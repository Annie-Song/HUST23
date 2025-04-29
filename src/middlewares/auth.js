const jwt = require('jsonwebtoken');
const { ErrorResponse } = require('./errorHandler');
const User = require('../models/User');
const config = require('../config/config');

/**
 * 保护路由 - 需要登录
 */
exports.protect = async (req, res, next) => {
  let token;
  
  // 从请求头或cookie中获取token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // 从Bearer token获取
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // 从cookie获取
    token = req.cookies.token;
  }
  
  // 确保token存在
  if (!token) {
    return next(new ErrorResponse('未授权访问，请登录', 401));
  }
  
  try {
    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 获取用户信息
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return next(new ErrorResponse('找不到关联此令牌的用户', 401));
    }
    
    // 检查用户是否被禁用
    if (req.user.status === 'suspended') {
      return next(new ErrorResponse('账户已被禁用，请联系管理员', 403));
    }
    
    next();
  } catch (err) {
    return next(new ErrorResponse('未授权访问，请登录', 401));
  }
};

/**
 * 角色授权
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('未授权访问，请登录', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`用户角色 ${req.user.role} 无权访问此资源`, 403));
    }
    
    next();
  };
}; 