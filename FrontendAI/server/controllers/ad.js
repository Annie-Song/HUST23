const { Ad } = require('../models');
const { NotFoundError } = require('../utils/errors');

// ��ȡ����б�
exports.getAds = async (req, res, next) => {
  try {
    const ads = await Ad.find().populate('advertiser', 'username company');
    res.json({ success: true, data: ads });
  } catch (err) {
    next(err);
  }
};

// ��ȡ�������
exports.getAdById = async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id).populate('advertiser', 'username company');
    if (!ad) {
      throw new NotFoundError('��治����');
    }
    res.json({ success: true, data: ad });
  } catch (err) {
    next(err);
  }
};

// �������
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

// ���¹��
exports.updateAd = async (req, res, next) => {
  try {
    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!ad) {
      throw new NotFoundError('��治����');
    }
    res.json({ success: true, data: ad });
  } catch (err) {
    next(err);
  }
};

// ɾ�����
exports.deleteAd = async (req, res, next) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) {
      throw new NotFoundError('��治����');
    }
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}; 