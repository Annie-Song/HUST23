const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// �����ļ��ϴ�
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ������API
router.post('/ad', upload.single('image'), async (req, res) => {
    try {
        const adData = {
            ...req.body,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null
        };
        // ���������ݵ����ݿ�
        const ad = await Ad.create(adData);
        res.json({ success: true, ad });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ��ȡ����б�
router.get('/ads', async (req, res) => {
    try {
        const ads = await Ad.find().sort({ createdAt: -1 });
        res.json({ success: true, ads });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ��ȡ�������
router.get('/ad/:id', async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            return res.status(404).json({ success: false, error: '��治����' });
        }
        res.json({ success: true, ad });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ���¹��
router.put('/ad/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
        };
        const ad = await Ad.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ success: true, ad });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ɾ�����
router.delete('/ad/:id', async (req, res) => {
    try {
        await Ad.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ���ͳ��API
router.get('/analytics/:adId', async (req, res) => {
    try {
        const analytics = await Analytics.findOne({ adId: req.params.adId });
        res.json({ success: true, analytics });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ������API
router.post('/strategy/:adId', async (req, res) => {
    try {
        const strategy = await Strategy.findOneAndUpdate(
            { adId: req.params.adId },
            req.body,
            { new: true, upsert: true }
        );
        res.json({ success: true, strategy });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ������API
router.post('/review/:adId', async (req, res) => {
    try {
        const review = await Review.findOneAndUpdate(
            { adId: req.params.adId },
            { ...req.body, status: 'pending' },
            { new: true, upsert: true }
        );
        res.json({ success: true, review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ���Ч��API
router.get('/performance/:adId', async (req, res) => {
    try {
        const performance = await Performance.findOne({ adId: req.params.adId });
        res.json({ success: true, performance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 