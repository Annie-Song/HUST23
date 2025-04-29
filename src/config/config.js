const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 配置文件
module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost'
  },
  
  // 环境
  environment: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  database: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/adplatform',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRE || '30d'
  },
  
  // 跨域配置
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  
  // 上传文件配置
  upload: {
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 默认5MB
  },
  
  // 邮件配置
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.FROM_EMAIL,
    fromName: process.env.FROM_NAME || 'AD Platform'
  },
  
  // 支付配置
  payment: {
    // 支付宝配置
    alipay: {
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_APP_PRIVATE_KEY,
      publicKey: process.env.ALIPAY_PUBLIC_KEY
    },
    // 微信支付配置
    wechat: {
      appId: process.env.WECHAT_PAY_APP_ID,
      mchId: process.env.WECHAT_PAY_MCH_ID,
      key: process.env.WECHAT_PAY_KEY,
      secret: process.env.WECHAT_PAY_SECRET
    }
  },
  
  // 安全配置
  security: {
    rateLimiter: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 默认15分钟
      max: process.env.RATE_LIMIT_MAX || 100 // 默认每IP最多100请求
    }
  },
  
  // 日志配置
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs'
  },
  
  // 管理员配置
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin_initial_password'
  }
}; 