const jwt = require('jsonwebtoken');
const config = require('../config');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { User } = require('../models/user');

// ��֤JWT����
const authenticate = async (req, res, next) => {
  try {
    // ������ͷ��ȡ����
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      const err = new Error('δ�ṩ��֤����');
      err.name = 'UnauthorizedError';
      throw err;
    }

    // ��֤����
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // �����û�
    const user = await User.findById(decoded.userId);
    if (!user) {
      const err = new Error('�û�������');
      err.name = 'UnauthorizedError';
      throw err;
    }

    // ���û���Ϣ��ӵ��������
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      const err = new Error('��Ч������');
      err.name = 'UnauthorizedError';
      next(err);
    } else if (error.name === 'TokenExpiredError') {
      const err = new Error('�����ѹ���');
      err.name = 'UnauthorizedError';
      next(err);
    } else {
      next(error);
    }
  }
};

// ����û���ɫ
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      const err = new Error('δ��֤');
      err.name = 'UnauthorizedError';
      return next(err);
    }

    if (roles.length && !roles.includes(req.user.role)) {
      const err = new Error('Ȩ�޲���');
      err.name = 'ForbiddenError';
      return next(err);
    }

    next();
  };
};

// �����Դ����Ȩ
const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        throw new NotFoundError('��Դ������');
      }

      if (resource.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ForbiddenError('û��Ȩ�޲�������Դ');
      }

      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
};

// ����JWT����
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