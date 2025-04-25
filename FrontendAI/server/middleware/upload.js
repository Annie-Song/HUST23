const multer = require('multer');
const path = require('path');
const config = require('../config');

// 配置存储
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, config.upload.path);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 创建上传实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxSize
  }
});

module.exports = upload; 