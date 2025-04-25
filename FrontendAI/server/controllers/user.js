const User = require('../models/user');
const { generateToken } = require('../middleware/auth');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

// 用户注册
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, company, contact } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ValidationError('用户名或邮箱已存在');
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password,
      company,
      contact
    });

    await user.save();

    // 生成令牌
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

// 用户登录
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    // 检查用户状态
    if (!user.isActive) {
      throw new UnauthorizedError('账户已被禁用');
    }

    // 生成令牌
    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

// 获取用户信息
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// 更新用户信息
exports.updateProfile = async (req, res, next) => {
  try {
    const { email, company, contact } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { email, company, contact },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
}; 