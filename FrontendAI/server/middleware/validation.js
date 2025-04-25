const { ValidationError } = require('../utils/errors');

// ��֤������
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const err = new ValidationError('����������֤ʧ��');
      err.errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(err);
    }

    next();
  };
};

// ��֤��ѯ����
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const err = new ValidationError('��ѯ������֤ʧ��');
      err.errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(err);
    }

    next();
  };
};

// ��֤·������
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const err = new ValidationError('·��������֤ʧ��');
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