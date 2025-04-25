const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 广告管理API
router.post('/ad', upload.single('image'), async (req, res) => {
    try {
        const adData = {
            ...req.body,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null
        };
        // 保存广告数据到数据库
        const ad = await Ad.create(adData);
        res.json({ success: true, ad });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 获取广告列表
router.get('/ads', async (req, res) => {
    try {
        const ads = await Ad.find().sort({ createdAt: -1 });
        res.json({ success: true, ads });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 获取单个广告
router.get('/ad/:id', async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            return res.status(404).json({ success: false, error: '广告不存在' });
        }
        res.json({ success: true, ad });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 更新广告
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

// 删除广告
router.delete('/ad/:id', async (req, res) => {
    try {
        await Ad.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 广告统计API
router.get('/analytics/:adId', async (req, res) => {
    try {
        const analytics = await Analytics.findOne({ adId: req.params.adId });
        res.json({ success: true, analytics });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 广告策略API
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

// 广告审核API
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

// 广告效果API
router.get('/performance/:adId', async (req, res) => {
    try {
        const performance = await Performance.findOne({ adId: req.params.adId });
        res.json({ success: true, performance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 