const express = require('express');
const router = express.Router();
const { createPayment, queryPayment, refundPayment, verifyPayment } = require('../config/payment');
const { Ad } = require('../models');
const { recordBusinessMetric } = require('../config/monitor');

// ����֧������
router.post('/create', async (req, res) => {
    try {
        const { adId, amount } = req.body;
        const ad = await Ad.findById(adId);
        if (!ad) {
            return res.status(404).json({ success: false, error: '��治����' });
        }

        const order = {
            orderNo: `AD${Date.now()}${Math.floor(Math.random() * 1000)}`,
            amount,
            subject: `���Ͷ�ŷ��� - ${ad.title}`,
            body: `���ID: ${adId}`
        };

        const paymentUrl = await createPayment(order);
        
        // ��¼ҵ��ָ��
        await recordBusinessMetric('payment_created', amount, {
            adId,
            advertiser: ad.advertiser.toString()
        });

        res.json({ success: true, paymentUrl, orderNo: order.orderNo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ��ѯ֧��״̬
router.get('/status/:orderNo', async (req, res) => {
    try {
        const result = await queryPayment(req.params.orderNo);
        res.json({ success: true, status: result.tradeStatus });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ����֧���ص�
router.post('/notify', async (req, res) => {
    try {
        const params = req.body;
        
        // ��֤ǩ��
        if (!verifyPayment(params)) {
            return res.status(400).json({ success: false, error: 'ǩ����֤ʧ��' });
        }

        const { out_trade_no, trade_status, total_amount } = params;

        // ���¹��״̬
        if (trade_status === 'TRADE_SUCCESS') {
            const adId = out_trade_no.split('_')[1];
            await Ad.findByIdAndUpdate(adId, { status: 'active' });
            
            // ��¼ҵ��ָ��
            await recordBusinessMetric('payment_success', total_amount, {
                orderNo: out_trade_no
            });
        }

        res.send('success');
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// �˿�
router.post('/refund', async (req, res) => {
    try {
        const { orderNo, amount, reason } = req.body;
        const result = await refundPayment({ orderNo, amount, reason });
        
        // ��¼ҵ��ָ��
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