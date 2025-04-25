const logger = require('./logger');

// �������м��
const errorHandler = (err, req, res, next) => {
  // ��¼������־
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // ���ݴ������ͷ��ز�ͬ����Ӧ
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      message: '�����������',
      errors: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      code: 401,
      message: 'δ��Ȩ����'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      code: 403,
      message: '��ֹ����'
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      code: 404,
      message: '��Դ������'
    });
  }

  // Ĭ�ϴ�����Ӧ
  res.status(500).json({
    code: 500,
    message: '�������ڲ�����'
  });
};

// 404�����м��
const notFoundHandler = (req, res, next) => {
  const err = new Error('Not Found');
  err.name = 'NotFoundError';
  next(err);
};

// �첽�������װ��
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
}; 