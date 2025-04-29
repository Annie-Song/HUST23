const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { ErrorResponse } = require('../../src/middlewares/errorHandler');
const paymentController = require('../../src/controllers/paymentController');
const Payment = require('../../src/models/Payment');

// 创建Express应用
const app = express();
app.use(express.json());
app.use('/api/v1/payments', paymentController);

// 测试前准备
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// 测试后清理
afterAll(async () => {
  await mongoose.connection.close();
});

describe('支付控制器测试', () => {
  let testPayment;

  beforeEach(async () => {
    // 创建测试支付记录
    testPayment = await Payment.create({
      user: mongoose.Types.ObjectId(),
      amount: 100,
      status: 'pending',
      paymentMethod: 'alipay',
      orderId: 'test_order_123'
    });
  });

  afterEach(async () => {
    // 清理测试支付记录
    await Payment.deleteMany({});
  });

  describe('GET /api/v1/payments', () => {
    it('应该返回用户的所有支付记录', async () => {
      const res = await request(app)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/payments/:id', () => {
    it('应该返回单个支付记录详情', async () => {
      const res = await request(app)
        .get(`/api/v1/payments/${testPayment._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data._id).toEqual(testPayment._id.toString());
    });

    it('当支付记录不存在时应返回404错误', async () => {
      const nonExistId = mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/payments/${nonExistId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe('POST /api/v1/payments', () => {
    it('应该成功创建新的支付记录', async () => {
      const newPayment = {
        amount: 200,
        paymentMethod: 'wechat'
      };

      const res = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${validToken}`)
        .send(newPayment);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.amount).toEqual(newPayment.amount);
    });
  });

  describe('PUT /api/v1/payments/:id/status', () => {
    it('应该成功更新支付状态', async () => {
      const updateData = {
        status: 'completed',
        transactionId: 'test_transaction_123'
      };

      const res = await request(app)
        .put(`/api/v1/payments/${testPayment._id}/status`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.status).toEqual(updateData.status);
    });
  });

  describe('POST /api/v1/payments/callback/:method', () => {
    it('应该成功处理支付回调', async () => {
      const callbackData = {
        transactionId: 'test_transaction_123',
        status: 'completed'
      };

      const res = await request(app)
        .post('/api/v1/payments/callback/alipay')
        .send(callbackData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
    });
  });
});