const logger = require('./logger');

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // 根据错误类型返回不同的响应
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      message: '请求参数错误',
      errors: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      code: 401,
      message: '未授权访问'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      code: 403,
      message: '禁止访问'
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      code: 404,
      message: '资源不存在'
    });
  }

  // 默认错误响应
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
};

// 404处理中间件
const notFoundHandler = (req, res, next) => {
  const err = new Error('Not Found');
  err.name = 'NotFoundError';
  next(err);
};

// 异步错误处理包装器
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
}; 