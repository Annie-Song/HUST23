const { Analytics } = require('../models');
const { NotFoundError } = require('../utils/errors');

// ��ȡ���ͳ������
exports.getAnalytics = async (req, res, next) => {
  try {
    const analytics = await Analytics.findOne({ adId: req.params.id });
    if (!analytics) {
      throw new NotFoundError('ͳ�����ݲ�����');
    }
    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
};

// ��¼չʾ
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

// ��¼���
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

// ��¼�ۿ�ʱ��
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