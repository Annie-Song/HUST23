const { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } = require('../utils/errors');
const logger = require('./logger');

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  logger.error({
    message: err.message,
    stack: err.stack,
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user
    }
  });

  // 根据错误类型返回不同的响应
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details
      }
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: err.message
      }
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: err.message
      }
    });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: err.message
      }
    });
  }

  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: '无效的认证令牌'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: '认证令牌已过期'
      }
    });
  }

  // 处理数据库错误
  if (err.name === 'MongoError') {
    if (err.code === 11000) {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_KEY',
          message: '数据已存在'
        }
      });
    }
  }

  // 处理其他错误
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误'
    }
  });
};

// 404处理中间件
const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`未找到 ${req.method} ${req.url}`));
};

module.exports = {
  errorHandler,
  notFoundHandler
}; 