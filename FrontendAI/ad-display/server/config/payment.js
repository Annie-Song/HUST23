const AlipaySdk = require('alipay-sdk').default;
const AlipayFormData = require('alipay-sdk/lib/form').default;

// ֧��������
const alipaySdk = new AlipaySdk({
    appId: process.env.ALIPAY_APP_ID,
    privateKey: process.env.ALIPAY_PRIVATE_KEY,
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
    gateway: 'https://openapi.alipay.com/gateway.do'
});

// ����֧������
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
        console.error('����֧������ʧ��:', error);
        throw error;
    }
};

// ��ѯ֧��״̬
const queryPayment = async (orderNo) => {
    try {
        const result = await alipaySdk.exec('alipay.trade.query', {
            bizContent: {
                outTradeNo: orderNo
            }
        });

        return result;
    } catch (error) {
        console.error('��ѯ֧��״̬ʧ��:', error);
        throw error;
    }
};

// �˿�
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
        console.error('�˿�ʧ��:', error);
        throw error;
    }
};

// ��֤֧��֪ͨ
const verifyPayment = (params) => {
    try {
        return alipaySdk.checkNotifySign(params);
    } catch (error) {
        console.error('��֤֧��֪ͨʧ��:', error);
        return false;
    }
};

module.exports = {
    createPayment,
    queryPayment,
    refundPayment,
    verifyPayment
}; 