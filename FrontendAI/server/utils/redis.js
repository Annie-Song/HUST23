const Redis = require('redis');

const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

redisClient.on('error', (err) => {
  console.error('Redis 连接错误:', err);
});

redisClient.on('connect', () => {
  console.log('Redis 连接成功');
});

module.exports = redisClient; 