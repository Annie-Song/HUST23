const Redis = require('redis');

const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

redisClient.on('error', (err) => {
  console.error('Redis ���Ӵ���:', err);
});

redisClient.on('connect', () => {
  console.log('Redis ���ӳɹ�');
});

module.exports = redisClient; 