const { ValidationError } = require('../utils/errors');

// 验证请求体
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const err = new ValidationError('请求数据验证失败');
      err.errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(err);
    }

    next();
  };
};

// 验证查询参数
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const err = new ValidationError('查询参数验证失败');
      err.errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(err);
    }

    next();
  };
};

// 验证路径参数
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const err = new ValidationError('路径参数验证失败');
      err.errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(err);
    }

    next();
  };
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams
}; 