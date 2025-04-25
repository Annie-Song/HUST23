const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToOSS, deleteFromOSS } = require('../config/cdn');
const { Ad } = require('../models');
const { recordBusinessMetric } = require('../config/monitor');

// ����multer
const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('��֧�ֵ��ļ�����'));
        }
        cb(null, true);
    }
});

// �ϴ�����ز�
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: '��ѡ���ļ�' });
        }

        const fileUrl = await uploadToOSS(req.file);
        
        // ��¼ҵ��ָ��
        await recordBusinessMetric('material_uploaded', req.file.size, {
            type: req.file.mimetype,
            filename: req.file.originalname
        });

        res.json({ success: true, url: fileUrl });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ɾ������ز�
router.delete('/delete', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ success: false, error: '���ṩ�ļ�URL' });
        }

        // ����Ƿ��й������ʹ�ø��ز�
        const ad = await Ad.findOne({
            $or: [
                { imageUrl: url },
                { videoUrl: url },
                { posterUrl: url }
            ]
        });

        if (ad) {
            return res.status(400).json({ success: false, error: '���ز����ڱ�ʹ�ã��޷�ɾ��' });
        }

        await deleteFromOSS(url);
        
        // ��¼ҵ��ָ��
        await recordBusinessMetric('material_deleted', 0, {
            url
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ��ȡ�ز��б�
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