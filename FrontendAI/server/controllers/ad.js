const { Ad } = require('../models');
const { NotFoundError } = require('../utils/errors');

// 获取广告列表
exports.getAds = async (req, res, next) => {
  try {
    const ads = await Ad.find().populate('advertiser', 'username company');
    res.json({ success: true, data: ads });
  } catch (err) {
    next(err);
  }
};

// 获取单个广告
exports.getAdById = async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id).populate('advertiser', 'username company');
    if (!ad) {
      throw new NotFoundError('广告不存在');
    }
    res.json({ success: true, data: ad });
  } catch (err) {
    next(err);
  }
};

// 创建广告
exports.createAd = async (req, res, next) => {
  try {
    const ad = new Ad({
      ...req.body,
      advertiser: req.user._id
    });
    await ad.save();
    res.status(201).json({ success: true, data: ad });
  } catch (err) {
    next(err);
  }
};

// 更新广告
exports.updateAd = async (req, res, next) => {
  try {
    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!ad) {
      throw new NotFoundError('广告不存在');
    }
    res.json({ success: true, data: ad });
  } catch (err) {
    next(err);
  }
};

// 删除广告
exports.deleteAd = async (req, res, next) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) {
      throw new NotFoundError('广告不存在');
    }
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}; 