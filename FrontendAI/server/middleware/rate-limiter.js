const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../utils/redis');

// ����Redis�洢
const store = new RedisStore({
  client: redis,
  prefix: 'rate_limit:'
});

// ͨ������������
const generalLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000, // 15����
  max: 100, // ÿ��IP 15���������100������
  message: {
    code: 429,
    message: '�������Ƶ�������Ժ�����'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ��¼����������
const loginLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1Сʱ
  max: 5, // ÿ��IP 1Сʱ�����5�ε�¼����
  message: {
    code: 429,
    message: '��¼���Դ������࣬��1Сʱ������'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// API����������
const apiLimiter = rateLimit({
  store,
  windowMs: 60 * 1000, // 1����
  max: 60, // ÿ��IP 1���������60������
  message: {
    code: 429,
    message: 'API�������Ƶ�������Ժ�����'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// �ļ��ϴ�����������
const uploadLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1Сʱ
  max: 10, // ÿ��IP 1Сʱ�����10���ļ��ϴ�
  message: {
    code: 429,
    message: '�ļ��ϴ��������࣬��1Сʱ������'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ��ȡ����״̬
const getRateLimitStatus = async (ip) => {
  const key = `rate-limit:${ip}`;
  const count = await redis.get(key);
  return {
    ip,
    count: parseInt(count) || 0,
    remaining: Math.max(0, 100 - (parseInt(count) || 0)) // �����������Ϊ100
  };
};

module.exports = {
  generalLimiter,
  loginLimiter,
  apiLimiter,
  uploadLimiter,
  getRateLimitStatus
}; 