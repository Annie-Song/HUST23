const { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } = require('../utils/errors');
const logger = require('./logger');

// �������м��
const errorHandler = (err, req, res, next) => {
  // ��¼������־
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

  // ���ݴ������ͷ��ز�ͬ����Ӧ
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

  // ����JWT����
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: '��Ч����֤����'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: '��֤�����ѹ���'
      }
    });
  }

  // �������ݿ����
  if (err.name === 'MongoError') {
    if (err.code === 11000) {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_KEY',
          message: '�����Ѵ���'
        }
      });
    }
  }

  // ������������
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '�������ڲ�����'
    }
  });
};

// 404�����м��
const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`δ�ҵ� ${req.method} ${req.url}`));
};

module.exports = {
  errorHandler,
  notFoundHandler
}; 