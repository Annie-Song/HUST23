const User = require('../models/user');
const { generateToken } = require('../middleware/auth');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

// �û�ע��
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, company, contact } = req.body;
    
    // ����û��Ƿ��Ѵ���
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ValidationError('�û����������Ѵ���');
    }

    // �������û�
    const user = new User({
      username,
      email,
      password,
      company,
      contact
    });

    await user.save();

    // ��������
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

// �û���¼
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // �����û�
    const user = await User.findOne({ username });
    if (!user) {
      throw new UnauthorizedError('�û������������');
    }

    // ��֤����
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('�û������������');
    }

    // ����û�״̬
    if (!user.isActive) {
      throw new UnauthorizedError('�˻��ѱ�����');
    }

    // ��������
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

// ��ȡ�û���Ϣ
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

// �����û���Ϣ
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