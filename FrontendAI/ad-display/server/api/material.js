const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToOSS, deleteFromOSS } = require('../config/cdn');
const { Ad } = require('../models');
const { recordBusinessMetric } = require('../config/monitor');

// 配置multer
const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('不支持的文件类型'));
        }
        cb(null, true);
    }
});

// 上传广告素材
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: '请选择文件' });
        }

        const fileUrl = await uploadToOSS(req.file);
        
        // 记录业务指标
        await recordBusinessMetric('material_uploaded', req.file.size, {
            type: req.file.mimetype,
            filename: req.file.originalname
        });

        res.json({ success: true, url: fileUrl });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 删除广告素材
router.delete('/delete', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ success: false, error: '请提供文件URL' });
        }

        // 检查是否有广告正在使用该素材
        const ad = await Ad.findOne({
            $or: [
                { imageUrl: url },
                { videoUrl: url },
                { posterUrl: url }
            ]
        });

        if (ad) {
            return res.status(400).json({ success: false, error: '该素材正在被使用，无法删除' });
        }

        await deleteFromOSS(url);
        
        // 记录业务指标
        await recordBusinessMetric('material_deleted', 0, {
            url
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 获取素材列表
router.get('/list', async (req, res) => {
    try {
        const { type, page = 1, limit = 10 } = req.query;
        const query = type ? { type } : {};
        
        const materials = await Ad.find(query)
            .select('imageUrl videoUrl posterUrl createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Ad.countDocuments(query);

        res.json({
            success: true,
            materials,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 