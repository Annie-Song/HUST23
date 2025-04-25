const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 验证JWT令牌
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: '未提供认证令牌' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, error: '用户不存在' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: '无效的认证令牌' });
    }
};

// 检查用户角色
const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: '权限不足' });
        }
        next();
    };
};

// 生成JWT令牌
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
    authenticate,
    authorize,
    generateToken
}; 