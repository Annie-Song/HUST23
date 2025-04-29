const { ErrorResponse } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const Ad = require('../models/Ad');
const multer = require('multer');
const config = require('../config/config');

/**
 * @desc    获取所有广告
 * @route   GET /api/v1/ads
 * @access  私有
 */
exports.getAds = async (req, res, next) => {
  try {
    // 构建查询条件
    const queryObj = { user: req.user.id };
    
    // 获取查询参数
    const { status, type, startDate, endDate } = req.query;
    
    // 根据参数添加过滤条件
    if (status) {
      queryObj.status = status;
    }
    
    if (type) {
      queryObj.type = type;
    }
    
    if (startDate) {
      queryObj.startDate = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      queryObj.endDate = { $lte: new Date(endDate) };
    }
    
    // 查询并排序广告
    const ads = await Ad.find(queryObj).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      message: '获取广告列表成功',
      count: ads.length,
      data: ads
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    获取单个广告
 * @route   GET /api/v1/ads/:id
 * @access  私有
 */
exports.getAd = async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${req.params.id}的广告`, 404));
    }
    
    // 确保用户只能查看自己的广告
    if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('无权查看此广告', 403));
    }
    
    res.status(200).json({
      success: true,
      message: '获取广告详情成功',
      data: ad
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    创建新广告
 * @route   POST /api/v1/ads
 * @access  私有
 */
exports.createAd = async (req, res, next) => {
  try {
    // 添加用户ID到请求体
    req.body.user = req.user.id;
    
    // 创建广告
    const ad = await Ad.create(req.body);
    
    res.status(201).json({
      success: true,
      message: '广告创建成功',
      data: ad
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    更新广告
 * @route   PUT /api/v1/ads/:id
 * @access  私有
 */
exports.updateAd = async (req, res, next) => {
  try {
    let ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${req.params.id}的广告`, 404));
    }
    
    // 确保用户只能更新自己的广告
    if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('无权更新此广告', 403));
    }
    
    // 不允许更新某些字段
    const { user, createdAt, ...updateData } = req.body;
    
    // 更新广告
    ad = await Ad.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: '广告更新成功',
      data: ad
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    删除广告
 * @route   DELETE /api/v1/ads/:id
 * @access  私有
 */
exports.deleteAd = async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${req.params.id}的广告`, 404));
    }
    
    // 确保用户只能删除自己的广告
    if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('无权删除此广告', 403));
    }
    
    await ad.deleteOne();
    
    res.status(200).json({
      success: true,
      message: '广告删除成功',
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    上传广告媒体
 * @route   POST /api/v1/ads/:id/media
 * @access  私有
 */
exports.uploadAdMedia = async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${req.params.id}的广告`, 404));
    }
    
    // 确保用户只能为自己的广告上传媒体
    if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('无权为此广告上传媒体', 403));
    }
    
    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), config.upload.uploadDir, 'ads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // 设置存储引擎
    const storage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, uploadDir);
      },
      filename: function(req, file, cb) {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `ad-${req.params.id}-${uniqueSuffix}${ext}`);
      }
    });
    
    // 文件过滤器
    const fileFilter = (req, file, cb) => {
      // 接受图像和视频文件
      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new ErrorResponse('请上传图片或视频文件', 400), false);
      }
    };
    
    // 初始化上传
    const upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: config.upload.maxSize
      }
    }).single('media');
    
    upload(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ErrorResponse(`文件大小不能超过${config.upload.maxSize / (1024 * 1024)}MB`, 400));
          }
        }
        return next(err);
      }
      
      if (!req.file) {
        return next(new ErrorResponse('请上传媒体文件', 400));
      }
      
      // 更新广告的媒体URL
      const mediaUrl = `${req.protocol}://${req.get('host')}/uploads/ads/${req.file.filename}`;
      
      ad.mediaUrl = mediaUrl;
      await ad.save();
      
      res.status(200).json({
        success: true,
        message: '媒体上传成功',
        data: {
          mediaUrl
        }
      });
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    提交广告审核
 * @route   PUT /api/v1/ads/:id/review
 * @access  私有
 */
exports.submitForReview = async (req, res, next) => {
  try {
    let ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${req.params.id}的广告`, 404));
    }
    
    // 确保用户只能为自己的广告提交审核
    if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('无权提交此广告审核', 403));
    }
    
    // 确保广告状态为草稿
    if (ad.status !== 'draft') {
      return next(new ErrorResponse('只有草稿状态的广告可以提交审核', 400));
    }
    
    // 更新广告状态和审核状态
    ad.status = 'pending_review';
    ad.review.status = 'pending';
    ad.updatedAt = Date.now();
    
    await ad.save();
    
    res.status(200).json({
      success: true,
      message: '广告已提交审核',
      data: ad
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    审核广告
 * @route   PUT /api/v1/ads/:id/approve
 * @access  私有 (仅管理员)
 */
exports.approveAd = async (req, res, next) => {
  try {
    let ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${req.params.id}的广告`, 404));
    }
    
    // 确保只有管理员或审核员可以审核广告
    if (req.user.role !== 'admin' && req.user.role !== 'reviewer') {
      return next(new ErrorResponse('无权审核广告', 403));
    }
    
    // 确保广告状态为待审核
    if (ad.status !== 'pending_review') {
      return next(new ErrorResponse('只有待审核状态的广告可以审核', 400));
    }
    
    // 更新广告状态和审核信息
    ad.status = 'active';
    ad.review.status = 'approved';
    ad.review.feedback = req.body.feedback || '广告已通过审核';
    ad.review.reviewedAt = Date.now();
    ad.review.reviewedBy = req.user.id;
    ad.updatedAt = Date.now();
    
    await ad.save();
    
    res.status(200).json({
      success: true,
      message: '广告已审核通过',
      data: ad
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    拒绝广告
 * @route   PUT /api/v1/ads/:id/reject
 * @access  私有 (仅管理员)
 */
exports.rejectAd = async (req, res, next) => {
  try {
    let ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${req.params.id}的广告`, 404));
    }
    
    // 确保只有管理员或审核员可以拒绝广告
    if (req.user.role !== 'admin' && req.user.role !== 'reviewer') {
      return next(new ErrorResponse('无权拒绝广告', 403));
    }
    
    // 确保广告状态为待审核
    if (ad.status !== 'pending_review') {
      return next(new ErrorResponse('只有待审核状态的广告可以拒绝', 400));
    }
    
    // 验证拒绝原因
    if (!req.body.feedback) {
      return next(new ErrorResponse('请提供拒绝原因', 400));
    }
    
    // 更新广告状态和审核信息
    ad.status = 'rejected';
    ad.review.status = 'rejected';
    ad.review.feedback = req.body.feedback;
    ad.review.reviewedAt = Date.now();
    ad.review.reviewedBy = req.user.id;
    ad.updatedAt = Date.now();
    
    await ad.save();
    
    res.status(200).json({
      success: true,
      message: '广告已被拒绝',
      data: ad
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    暂停广告
 * @route   PUT /api/v1/ads/:id/pause
 * @access  私有
 */
exports.pauseAd = async (req, res, next) => {
  try {
    let ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${req.params.id}的广告`, 404));
    }
    
    // 确保用户只能暂停自己的广告
    if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('无权暂停此广告', 403));
    }
    
    // 确保广告状态为活跃
    if (ad.status !== 'active') {
      return next(new ErrorResponse('只有活跃状态的广告可以暂停', 400));
    }
    
    // 更新广告状态
    ad.status = 'paused';
    ad.updatedAt = Date.now();
    
    await ad.save();
    
    res.status(200).json({
      success: true,
      message: '广告已暂停',
      data: ad
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    恢复广告
 * @route   PUT /api/v1/ads/:id/resume
 * @access  私有
 */
exports.resumeAd = async (req, res, next) => {
  try {
    let ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${req.params.id}的广告`, 404));
    }
    
    // 确保用户只能恢复自己的广告
    if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('无权恢复此广告', 403));
    }
    
    // 确保广告状态为暂停
    if (ad.status !== 'paused') {
      return next(new ErrorResponse('只有暂停状态的广告可以恢复', 400));
    }
    
    // 更新广告状态
    ad.status = 'active';
    ad.updatedAt = Date.now();
    
    await ad.save();
    
    res.status(200).json({
      success: true,
      message: '广告已恢复',
      data: ad
    });
  } catch (err) {
    next(err);
  }
};

// 导出模型供其他模块使用
exports._adModel = Ad;
