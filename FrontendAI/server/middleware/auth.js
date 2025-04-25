const jwt = require('jsonwebtoken');
const config = require('../config');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { User } = require('../models/user');

// 验证JWT令牌
const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      const err = new Error('未提供认证令牌');
      err.name = 'UnauthorizedError';
      throw err;
    }

    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.userId);
    if (!user) {
      const err = new Error('用户不存在');
      err.name = 'UnauthorizedError';
      throw err;
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      const err = new Error('无效的令牌');
      err.name = 'UnauthorizedError';
      next(err);
    } else if (error.name === 'TokenExpiredError') {
      const err = new Error('令牌已过期');
      err.name = 'UnauthorizedError';
      next(err);
    } else {
      next(error);
    }
  }
};

// 检查用户角色
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      const err = new Error('未认证');
      err.name = 'UnauthorizedError';
      return next(err);
    }

    if (roles.length && !roles.includes(req.user.role)) {
      const err = new Error('权限不足');
      err.name = 'ForbiddenError';
      return next(err);
    }

    next();
  };
};

// 检查资源所有权
const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        throw new NotFoundError('资源不存在');
      }

      if (resource.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ForbiddenError('没有权限操作此资源');
      }

      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
};

// 生成JWT令牌
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  authenticate,
  authorize,
  checkOwnership,
  generateToken
}; 