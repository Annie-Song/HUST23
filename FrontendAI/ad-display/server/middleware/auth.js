const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ��֤JWT����
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'δ�ṩ��֤����' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, error: '�û�������' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: '��Ч����֤����' });
    }
};

// ����û���ɫ
const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Ȩ�޲���' });
        }
        next();
    };
};

// ����JWT����
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
    authenticate,
    authorize,
    generateToken
}; 