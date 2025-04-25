const AlipaySdk = require('alipay-sdk').default;
const AlipayFormData = require('alipay-sdk/lib/form').default;

// 支付宝配置
const alipaySdk = new AlipaySdk({
    appId: process.env.ALIPAY_APP_ID,
    privateKey: process.env.ALIPAY_PRIVATE_KEY,
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
    gateway: 'https://openapi.alipay.com/gateway.do'
});

// 创建支付订单
const createPayment = async (order) => {
    try {
        const formData = new AlipayFormData();
        formData.setMethod('get');
        formData.addField('bizContent', {
            outTradeNo: order.orderNo,
            productCode: 'FAST_INSTANT_TRADE_PAY',
            totalAmount: order.amount,
            subject: order.subject,
            body: order.body
        });
        formData.addField('returnUrl', process.env.ALIPAY_RETURN_URL);
        formData.addField('notifyUrl', process.env.ALIPAY_NOTIFY_URL);

        const result = await alipaySdk.exec(
            'alipay.trade.page.pay',
            {},
            { formData: formData }
        );

        return result;
    } catch (error) {
        console.error('创建支付订单失败:', error);
        throw error;
    }
};

// 查询支付状态
const queryPayment = async (orderNo) => {
    try {
        const result = await alipaySdk.exec('alipay.trade.query', {
            bizContent: {
                outTradeNo: orderNo
            }
        });

        return result;
    } catch (error) {
        console.error('查询支付状态失败:', error);
        throw error;
    }
};

// 退款
const refundPayment = async (refund) => {
    try {
        const result = await alipaySdk.exec('alipay.trade.refund', {
            bizContent: {
                outTradeNo: refund.orderNo,
                refundAmount: refund.amount,
                refundReason: refund.reason
            }
        });

        return result;
    } catch (error) {
        console.error('退款失败:', error);
        throw error;
    }
};

// 验证支付通知
const verifyPayment = (params) => {
    try {
        return alipaySdk.checkNotifySign(params);
    } catch (error) {
        console.error('验证支付通知失败:', error);
        return false;
    }
};

module.exports = {
    createPayment,
    queryPayment,
    refundPayment,
    verifyPayment
}; 