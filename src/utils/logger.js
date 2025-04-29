const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// 确保日志目录存在
const logDir = path.join(process.cwd(), config.logger.dir);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(
    info => `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// 创建日志工具
const logger = winston.createLogger({
  level: config.logger.level,
  format: logFormat,
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // 错误日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    // 综合日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ],
  exitOnError: false
});

// 非生产环境下输出更详细的日志
if (config.environment !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

// 简化的日志记录方法
module.exports = {
  info: (message) => logger.info(message),
  error: (message, error) => {
    if (error) {
      logger.error(`${message}: ${error.message}\n${error.stack}`);
    } else {
      logger.error(message);
    }
  },
  warn: (message) => logger.warn(message),
  debug: (message) => logger.debug(message),
  // 添加一个请求日志方法
  logRequest: (req, res, next) => {
    logger.info(`${req.method} ${req.url} - ${req.ip}`);
    next();
  }
}; 