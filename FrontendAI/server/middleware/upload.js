const multer = require('multer');
const path = require('path');
const config = require('../config');

// ���ô洢
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, config.upload.path);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// �ļ�������
const fileFilter = (req, file, cb) => {
  // ������ļ�����
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('��֧�ֵ��ļ�����'), false);
  }
};

// �����ϴ�ʵ��
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxSize
  }
});

module.exports = upload; 