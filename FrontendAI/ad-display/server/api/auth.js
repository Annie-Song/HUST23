const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

// �û�ע��
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, company, contact } = req.body;

        // ����û����Ƿ��Ѵ���
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, error: '�û����Ѵ���' });
        }

        // ��������Ƿ��Ѵ���
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, error: '�����ѱ�ע��' });
        }

        // ��������
        const hashedPassword = await bcrypt.hash(password, 10);

        // �����û�
        const user = await User.create({
            username,
            password: hashedPassword,
            email,
            company,
            contact
        });

        // ��������
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

// �û���¼
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // �����û�
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, error: '�û������������' });
        }

        // ��֤����
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: '�û������������' });
        }

        // ��������
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

// ��ȡ��ǰ�û���Ϣ
router.get('/me', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// �����û���Ϣ
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

// �޸�����
router.put('/password', async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // ��֤������
        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: '���������' });
        }

        // ��������
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 