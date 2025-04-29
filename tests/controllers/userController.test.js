const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { ErrorResponse } = require('../../src/middlewares/errorHandler');
const userController = require('../../src/controllers/userController');
const User = require('../../src/models/User');

// 创建Express应用
const app = express();
app.use(express.json());
app.use('/api/v1/users', userController);

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

describe('用户控制器测试', () => {
  let testUser;
  const validToken = 'valid_token_here'; // 添加有效的测试token
  const adminToken = 'admin_token_here'; // 添加管理员测试token

  beforeEach(async () => {
    // 创建测试用户
    testUser = await User.create({
      name: '测试用户',
      email: 'test@example.com',
      password: 'test123',
      role: 'user'
    });
  });

  afterEach(async () => {
    // 清理测试用户
    await User.deleteMany({});
  });

  describe('GET /api/v1/users', () => {
    it('管理员应该能够获取所有用户', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('非管理员用户应该返回403错误', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('应该返回单个用户详情', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUser._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data._id).toEqual(testUser._id.toString());
      expect(res.body.data.name).toEqual(testUser.name);
    });

    it('当用户不存在时应返回404错误', async () => {
      const nonExistId = mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/users/${nonExistId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('应该成功更新用户信息', async () => {
      const updatedData = {
        name: '更新后的用户名'
      };

      const res = await request(app)
        .put(`/api/v1/users/${testUser._id}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.name).toEqual(updatedData.name);
    });

    it('当更新不存在的用户时应返回404错误', async () => {
      const nonExistId = mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/v1/users/${nonExistId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: '新用户名' });

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('管理员应该能够删除用户', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
    });

    it('非管理员用户应该返回403错误', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${testUser._id}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe('PUT /api/v1/users/:id/password', () => {
    it('应该成功更新用户密码', async () => {
      const updateData = {
        oldPassword: 'test123',
        newPassword: 'newPassword123'
      };

      const res = await request(app)
        .put(`/api/v1/users/${testUser._id}/password`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
    });
  });

  describe('PUT /api/v1/users/:id/role', () => {
    it('管理员应该能够更新用户角色', async () => {
      const updateData = {
        role: 'admin'
      };

      const res = await request(app)
        .put(`/api/v1/users/${testUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.role).toEqual(updateData.role);
    });

    it('非管理员用户应该返回403错误', async () => {
      const updateData = {
        role: 'admin'
      };

      const res = await request(app)
        .put(`/api/v1/users/${testUser._id}/role`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBeFalsy();
    });
  });
});