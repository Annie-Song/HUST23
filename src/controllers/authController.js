const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ErrorResponse } = require('../middlewares/errorHandler');
const config = require('../config/config');
const logger = require('../utils/logger');

// 模拟用户数据，实际应用中应该使用数据库
let users = [
  {
    id: '1',
    name: '测试用户',
    email: 'test@example.com',
    password: '$2a$10$X7t/3d8QUgXkWFkx3c1y8OfA/Ys0TXSLjHd9Z.XP5gf7.xrDPY1uy', // 'password123'
    company: '某某科技有限公司',
    role: 'advertiser',
    createdAt: '2023-01-01T00:00:00Z'
  }
];

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * @desc    注册用户
 * @route   POST /api/v1/auth/register
 * @access  公开
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, company } = req.body;

    // 检查用户是否已存在
    if (users.find(user => user.email === email)) {
      return next(new ErrorResponse('该邮箱已被注册', 400));
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
      password: hashedPassword,
      company,
      role: 'advertiser',
      createdAt: new Date().toISOString()
    };

    // 保存用户
    users.push(newUser);

    // 生成令牌
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: '用户注册成功',
      token,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        company: newUser.company,
        role: newUser.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    用户登录
 * @route   POST /api/v1/auth/login
 * @access  公开
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 验证邮箱和密码是否存在
    if (!email || !password) {
      return next(new ErrorResponse('请提供邮箱和密码', 400));
    }

    // 检查用户是否存在
    const user = users.find(user => user.email === email);
    if (!user) {
      return next(new ErrorResponse('无效的凭据', 401));
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorResponse('无效的凭据', 401));
    }

    // 生成令牌
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: '用户登录成功',
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    获取当前用户信息
 * @route   GET /api/v1/auth/me
 * @access  私有
 */
exports.getMe = async (req, res, next) => {
  try {
    // 模拟从JWT解析用户ID
    // 实际应用中应该使用中间件处理认证并将用户添加到req对象中
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new ErrorResponse('未授权访问', 401));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = users.find(u => u.id === decoded.id);
      
      if (!user) {
        return next(new ErrorResponse('用户不存在', 404));
      }

      res.status(200).json({
        success: true,
        message: '获取用户信息成功',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      return next(new ErrorResponse('未授权访问', 401));
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    忘记密码
 * @route   POST /api/v1/auth/forgotpassword
 * @access  公开
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // 检查用户是否存在
    const user = users.find(user => user.email === email);
    if (!user) {
      return next(new ErrorResponse('该邮箱对应的用户不存在', 404));
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // 模拟保存重置令牌到用户记录
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10分钟后过期

    // 模拟发送重置密码邮件
    logger.info(`发送重置密码邮件，令牌: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: '重置密码链接已发送到邮箱'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    重置密码
 * @route   PUT /api/v1/auth/resetpassword/:resettoken
 * @access  公开
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { resettoken } = req.params;

    // 查找具有给定重置令牌的用户
    const user = users.find(
      u => u.resetPasswordToken === resettoken && u.resetPasswordExpire > Date.now()
    );

    if (!user) {
      return next(new ErrorResponse('无效的令牌', 400));
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, 10);
    
    // 清除重置令牌字段
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // 生成新的JWT令牌
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: '密码重置成功',
      token
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    更新密码
 * @route   PUT /api/v1/auth/updatepassword
 * @access  私有
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 模拟从JWT解析用户ID
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new ErrorResponse('未授权访问', 401));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = users.find(u => u.id === decoded.id);
      
      if (!user) {
        return next(new ErrorResponse('用户不存在', 404));
      }

      // 检查当前密码是否正确
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return next(new ErrorResponse('当前密码不正确', 401));
      }

      // 加密并更新密码
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, 10);

      // 生成新的JWT令牌
      const newToken = generateToken(user.id);

      res.status(200).json({
        success: true,
        message: '密码更新成功',
        token: newToken
      });
    } catch (error) {
      return next(new ErrorResponse('未授权访问', 401));
    }
  } catch (err) {
    next(err);
  }
};

// 为了测试目的导出用户数组
exports._users = users;
