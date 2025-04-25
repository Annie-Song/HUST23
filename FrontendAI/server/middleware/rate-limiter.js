const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../utils/redis');

// 创建Redis存储
const store = new RedisStore({
  client: redis,
  prefix: 'rate_limit:'
});

// 通用速率限制器
const generalLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP 15分钟内最多100个请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 登录速率限制器
const loginLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 每个IP 1小时内最多5次登录尝试
  message: {
    code: 429,
    message: '登录尝试次数过多，请1小时后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// API速率限制器
const apiLimiter = rateLimit({
  store,
  windowMs: 60 * 1000, // 1分钟
  max: 60, // 每个IP 1分钟内最多60个请求
  message: {
    code: 429,
    message: 'API请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 文件上传速率限制器
const uploadLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1小时
  max: 10, // 每个IP 1小时内最多10个文件上传
  message: {
    code: 429,
    message: '文件上传次数过多，请1小时后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 获取限流状态
const getRateLimitStatus = async (ip) => {
  const key = `rate-limit:${ip}`;
  const count = await redis.get(key);
  return {
    ip,
    count: parseInt(count) || 0,
    remaining: Math.max(0, 100 - (parseInt(count) || 0)) // 假设最大限制为100
  };
};

module.exports = {
  generalLimiter,
  loginLimiter,
  apiLimiter,
  uploadLimiter,
  getRateLimitStatus
}; 