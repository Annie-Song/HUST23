const logger = require('../utils/logger');

/**
 * 自定义错误响应类
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * 错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // 记录错误日志
  logger.error(`${err.name}: ${err.message}`, err);
  
  // Mongoose 错误处理
  
  // 处理 ObjectID 错误
  if (err.name === 'CastError') {
    const message = '未找到相关资源';
    error = new ErrorResponse(message, 404);
  }
  
  // 处理 Mongoose 重复字段错误
  if (err.code === 11000) {
    const message = '输入的值已存在';
    error = new ErrorResponse(message, 400);
  }
  
  // 处理 Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }
  
  // 处理 JWT 错误
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('无效的令牌，请重新登录', 401);
  }
  
  // 处理 JWT 过期错误
  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('令牌已过期，请重新登录', 401);
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器错误'
  });
};

module.exports = errorHandler;
module.exports.ErrorResponse = ErrorResponse; 