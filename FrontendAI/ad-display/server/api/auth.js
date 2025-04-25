const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

// 用户注册
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, company, contact } = req.body;

        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, error: '用户名已存在' });
        }

        // 检查邮箱是否已存在
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, error: '邮箱已被注册' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建用户
        const user = await User.create({
            username,
            password: hashedPassword,
            email,
            company,
            contact
        });

        // 生成令牌
        const token = generateToken(user._id);

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 用户登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, error: '用户名或密码错误' });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: '用户名或密码错误' });
        }

        // 生成令牌
        const token = generateToken(user._id);

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 更新用户信息
router.put('/me', async (req, res) => {
    try {
        const { email, company, contact } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { email, company, contact },
            { new: true }
        ).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 修改密码
router.put('/password', async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // 验证旧密码
        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: '旧密码错误' });
        }

        // 更新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 