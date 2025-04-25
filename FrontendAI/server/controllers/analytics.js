const { Analytics } = require('../models');
const { NotFoundError } = require('../utils/errors');

// 获取广告统计数据
exports.getAnalytics = async (req, res, next) => {
  try {
    const analytics = await Analytics.findOne({ adId: req.params.id });
    if (!analytics) {
      throw new NotFoundError('统计数据不存在');
    }
    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
};

// 记录展示
exports.recordImpression = async (req, res, next) => {
  try {
    const { adId } = req.body;
    await Analytics.findOneAndUpdate(
      { adId },
      { 
        $inc: { impressions: 1 },
        $push: { 
          dailyStats: {
            date: new Date(),
            impressions: 1
          }
        }
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 记录点击
exports.recordClick = async (req, res, next) => {
  try {
    const { adId } = req.body;
    await Analytics.findOneAndUpdate(
      { adId },
      { 
        $inc: { clicks: 1 },
        $push: { 
          dailyStats: {
            date: new Date(),
            clicks: 1
          }
        }
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 记录观看时间
exports.recordViewTime = async (req, res, next) => {
  try {
    const { adId, viewTime } = req.body;
    await Analytics.findOneAndUpdate(
      { adId },
      { 
        $inc: { viewTime },
        $push: { 
          dailyStats: {
            date: new Date(),
            viewTime
          }
        }
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}; 