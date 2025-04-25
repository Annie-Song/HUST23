const path = require('path');
require('dotenv').config();

module.exports = {
    // ∑˛ŒÒ∆˜≈‰÷√
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost'
    },

    //  ˝æ›ø‚≈‰÷√
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ad-display',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    // JWT≈‰÷√
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '24h'
    },

    // ∞¢¿Ô‘∆OSS≈‰÷√
    oss: {
        accessKeyId: process.env.OSS_ACCESS_KEY_ID,
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
        bucket: process.env.OSS_BUCKET,
        region: process.env.OSS_REGION,
        endpoint: process.env.OSS_ENDPOINT
    },

    // ∞¢¿Ô‘∆ARMS≈‰÷√
    arms: {
        accessKeyId: process.env.ARMS_ACCESS_KEY_ID,
        accessKeySecret: process.env.ARMS_ACCESS_KEY_SECRET,
        endpoint: process.env.ARMS_ENDPOINT,
        project: process.env.ARMS_PROJECT
    },

    // ÷ß∏∂±¶≈‰÷√
    alipay: {
        appId: process.env.ALIPAY_APP_ID,
        privateKey: process.env.ALIPAY_PRIVATE_KEY,
        publicKey: process.env.ALIPAY_PUBLIC_KEY,
        gateway: process.env.ALIPAY_GATEWAY
    },

    // Œƒº˛…œ¥´≈‰÷√
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
        tempDir: path.join(__dirname, '../uploads/temp'),
        uploadDir: path.join(__dirname, '../uploads')
    },

    // »’÷æ≈‰÷√
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        dir: path.join(__dirname, '../logs')
    }
}; 