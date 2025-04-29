const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { ErrorResponse } = require('../../src/middlewares/errorHandler');
const adController = require('../../src/controllers/adController');
const Ad = require('../../src/models/Ad');

// 创建Express应用
const app = express();
app.use(express.json());
app.use('/api/v1/ads', adController);

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

describe('广告控制器测试', () => {
  let testAd;

  beforeEach(async () => {
    // 创建测试广告
    testAd = await Ad.create({
      name: '测试广告',
      type: 'banner',
      content: '测试内容',
      targetUrl: 'https://example.com',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // 1天后
      budget: 1000,
      user: mongoose.Types.ObjectId(),
    });
  });

  afterEach(async () => {
    // 清理测试广告
    await Ad.deleteMany({});
  });

  describe('GET /api/v1/ads', () => {
    it('应该返回用户的所有广告', async () => {
      const res = await request(app)
        .get('/api/v1/ads')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/ads/:id', () => {
    it('应该返回单个广告详情', async () => {
      const res = await request(app)
        .get(`/api/v1/ads/${testAd._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data._id).toEqual(testAd._id.toString());
    });

    it('当广告不存在时应返回404错误', async () => {
      const nonExistId = mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/ads/${nonExistId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe('POST /api/v1/ads', () => {
    it('应该成功创建新广告', async () => {
      const newAd = {
        name: '新广告',
        type: 'banner',
        content: '新内容',
        targetUrl: 'https://example.com',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        budget: 2000,
      };

      const res = await request(app)
        .post('/api/v1/ads')
        .set('Authorization', `Bearer ${validToken}`)
        .send(newAd);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.name).toEqual(newAd.name);
    });
  });

  describe('PUT /api/v1/ads/:id', () => {
    it('应该成功更新广告信息', async () => {
      const updatedData = {
        name: '更新后的广告名称',
        content: '更新后的广告内容'
      };

      const res = await request(app)
        .put(`/api/v1/ads/${testAd._id}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.name).toEqual(updatedData.name);
    });

    it('当更新不存在的广告时应返回404错误', async () => {
      const nonExistId = mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/v1/ads/${nonExistId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: '新广告名称' });

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe('DELETE /api/v1/ads/:id', () => {
    it('应该成功删除广告', async () => {
      const res = await request(app)
        .delete(`/api/v1/ads/${testAd._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
    });

    it('当删除不存在的广告时应返回404错误', async () => {
      const nonExistId = mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/v1/ads/${nonExistId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBeFalsy();
    });
  });
});