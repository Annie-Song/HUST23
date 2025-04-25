const express = require('express');
const router = express.Router();
const { createPayment, queryPayment, refundPayment, verifyPayment } = require('../config/payment');
const { Ad } = require('../models');
const { recordBusinessMetric } = require('../config/monitor');

// 创建支付订单
router.post('/create', async (req, res) => {
    try {
        const { adId, amount } = req.body;
        const ad = await Ad.findById(adId);
        if (!ad) {
            return res.status(404).json({ success: false, error: '广告不存在' });
        }

        const order = {
            orderNo: `AD${Date.now()}${Math.floor(Math.random() * 1000)}`,
            amount,
            subject: `广告投放费用 - ${ad.title}`,
            body: `广告ID: ${adId}`
        };

        const paymentUrl = await createPayment(order);
        
        // 记录业务指标
        await recordBusinessMetric('payment_created', amount, {
            adId,
            advertiser: ad.advertiser.toString()
        });

        res.json({ success: true, paymentUrl, orderNo: order.orderNo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 查询支付状态
router.get('/status/:orderNo', async (req, res) => {
    try {
        const result = await queryPayment(req.params.orderNo);
        res.json({ success: true, status: result.tradeStatus });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 处理支付回调
router.post('/notify', async (req, res) => {
    try {
        const params = req.body;
        
        // 验证签名
        if (!verifyPayment(params)) {
            return res.status(400).json({ success: false, error: '签名验证失败' });
        }

        const { out_trade_no, trade_status, total_amount } = params;

        // 更新广告状态
        if (trade_status === 'TRADE_SUCCESS') {
            const adId = out_trade_no.split('_')[1];
            await Ad.findByIdAndUpdate(adId, { status: 'active' });
            
            // 记录业务指标
            await recordBusinessMetric('payment_success', total_amount, {
                orderNo: out_trade_no
            });
        }

        res.send('success');
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 退款
router.post('/refund', async (req, res) => {
    try {
        const { orderNo, amount, reason } = req.body;
        const result = await refundPayment({ orderNo, amount, reason });
        
        // 记录业务指标
        await recordBusinessMetric('payment_refund', amount, {
            orderNo,
            reason
        });

        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 