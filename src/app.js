const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// 导入配置和工具
const config = require('./config/config');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

// 导入路由
const routes = require('./routes');

// 初始化Express应用
const app = express();

// 确保日志目录存在
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), config.upload.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 连接数据库
mongoose.connect(config.database.uri, config.database.options)
  .then(() => {
    logger.info('MongoDB 数据库连接成功');
  })
  .catch((err) => {
    logger.error(`MongoDB 连接错误: ${err.message}`);
    process.exit(1);
  });

// 中间件
// 解析JSON请求体
app.use(express.json());
// 解析URL编码的请求体
app.use(express.urlencoded({ extended: true }));
// 启用CORS
app.use(cors(config.cors));
// 安全HTTP头部
app.use(helmet());
// 限速
app.use(rateLimit(config.security.rateLimiter));

// 日志
if (config.environment === 'development') {
  app.use(morgan('dev'));
} else {
  // 在生产环境下，将访问日志写入文件
  const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
}

// 静态文件服务
app.use('/uploads', express.static(path.join(process.cwd(), config.upload.uploadDir)));

// API路由
app.use('/api/v1', routes);

// 根路径响应
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '广告平台API服务运行中',
    version: '1.0.0'
  });
});

// 404处理
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: '找不到请求的资源'
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const server = app.listen(
  config.server.port,
  config.server.host,
  () => {
    logger.info(`服务器在 ${config.environment} 环境中运行`);
    logger.info(`API 服务运行在 http://${config.server.host}:${config.server.port}`);
  }
);

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  logger.error(`未捕获的异常: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`未处理的Promise拒绝: ${reason}`);
  // 优雅地关闭服务器
  server.close(() => {
    process.exit(1);
  });
});

// 处理程序终止信号
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，优雅地关闭服务器');
  server.close(() => {
    logger.info('进程终止');
    process.exit(0);
  });
});

module.exports = app;
