const { ErrorResponse } = require('../middlewares/errorHandler');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Ad = require('../models/Ad');
const ApiKey = require('../models/ApiKey');
const Impression = require('../models/Impression');
const Click = require('../models/Click');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * @desc    获取广告内容
 * @route   GET /api/v1/api/ads
 * @access  公开/需要API密钥
 */
exports.getAd = async (req, res, next) => {
  try {
    // 验证API密钥
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return next(new ErrorResponse('缺少API密钥', 401));
    }
    
    // 验证API密钥是否有效
    const keyDoc = await ApiKey.findOne({ key: apiKey, active: true });
    
    if (!keyDoc) {
      return next(new ErrorResponse('无效的API密钥', 401));
    }
    
    // 获取查询参数
    const { type, width, height, platform, count, position, category } = req.query;
    
    // 构建查询条件
    const query = {
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };
    
    // 根据参数筛选
    if (type) {
      query.type = type;
    }
    
    // 根据位置筛选
    if (position) {
      query['audience.position'] = position;
    }
    
    // 根据目标受众分类筛选
    if (category) {
      query['audience.interests'] = category;
    }
    
    // 查找符合条件的广告
    const availableAds = await Ad.find(query);
    
    // 如果没有可用广告，返回默认广告或空结果
    if (availableAds.length === 0) {
      return res.status(200).json({
        success: true,
        message: '没有符合条件的广告',
        data: null
      });
    }
    
    // 确定返回的广告数量
    const adCount = count ? parseInt(count, 10) : 1;
    let selectedAds = [];
    
    if (adCount === 1) {
      // 随机选择一个广告
      const randomIndex = Math.floor(Math.random() * availableAds.length);
      selectedAds = [availableAds[randomIndex]];
    } else {
      // 选择多个广告（最多返回请求的数量或可用广告的数量）
      const shuffled = [...availableAds].sort(() => 0.5 - Math.random());
      selectedAds = shuffled.slice(0, Math.min(adCount, availableAds.length));
    }
    
    // 更新API统计信息
    await ApiKey.findByIdAndUpdate(keyDoc._id, {
      $inc: { callCount: 1 },
      lastUsed: Date.now()
    });
    
    // 生成广告内容
    const adContents = selectedAds.map(ad => ({
      adId: ad._id,
      adType: ad.type,
      content: ad.content,
      mediaUrl: ad.mediaUrl,
      targetUrl: ad.targetUrl,
      // 添加展示追踪URL
      impressionUrl: `${req.protocol}://${req.get('host')}/api/v1/api/track/impression/${ad._id}`,
      // 添加点击追踪URL
      clickUrl: `${req.protocol}://${req.get('host')}/api/v1/api/track/click/${ad._id}`
    }));
    
    res.status(200).json({
      success: true,
      message: '获取广告成功',
      count: adContents.length,
      data: adCount === 1 ? adContents[0] : adContents
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    获取横幅广告
 * @route   GET /api/v1/api/ads/banner
 * @access  公开/需要API密钥
 */
exports.getBannerAd = async (req, res, next) => {
  req.query.type = 'banner';
  return this.getAd(req, res, next);
};

/**
 * @desc    获取弹窗广告
 * @route   GET /api/v1/api/ads/popup
 * @access  公开/需要API密钥
 */
exports.getPopupAd = async (req, res, next) => {
  req.query.type = 'popup';
  return this.getAd(req, res, next);
};

/**
 * @desc    获取视频广告
 * @route   GET /api/v1/api/ads/video
 * @access  公开/需要API密钥
 */
exports.getVideoAd = async (req, res, next) => {
  req.query.type = 'video';
  return this.getAd(req, res, next);
};

/**
 * @desc    获取文字广告
 * @route   GET /api/v1/api/ads/text
 * @access  公开/需要API密钥
 */
exports.getTextAd = async (req, res, next) => {
  req.query.type = 'text';
  return this.getAd(req, res, next);
};

/**
 * @desc    获取原生广告
 * @route   GET /api/v1/api/ads/native
 * @access  公开/需要API密钥
 */
exports.getNativeAd = async (req, res, next) => {
  req.query.type = 'native';
  return this.getAd(req, res, next);
};

/**
 * @desc    根据广告JS代码获取广告
 * @route   GET /api/v1/api/ads/script/:key
 * @access  公开
 */
exports.getAdScript = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { type, position, category } = req.query;
    
    // 验证API密钥是否有效
    const keyDoc = await ApiKey.findOne({ key, active: true });
    
    if (!keyDoc) {
      // 返回空的JavaScript，避免客户端错误
      return res.set('Content-Type', 'application/javascript')
        .send('console.log("Invalid API key");');
    }
    
    // 构建查询条件
    const query = {
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };
    
    // 根据参数筛选
    if (type) {
      query.type = type;
    }
    
    // 根据位置筛选
    if (position) {
      query['audience.position'] = position;
    }
    
    // 根据目标受众分类筛选
    if (category) {
      query['audience.interests'] = category;
    }
    
    // 查找符合条件的广告
    const availableAds = await Ad.find(query);
    
    // 更新API统计信息
    await ApiKey.findByIdAndUpdate(keyDoc._id, {
      $inc: { callCount: 1 },
      lastUsed: Date.now()
    });
    
    // 如果没有可用广告，返回空脚本
    if (availableAds.length === 0) {
      return res.set('Content-Type', 'application/javascript')
        .send('console.log("No available ads");');
    }
    
    // 随机选择一个广告
    const randomIndex = Math.floor(Math.random() * availableAds.length);
    const selectedAd = availableAds[randomIndex];
    
    // 构建基本URL
    const baseUrl = `${req.protocol}://${req.get('host')}/api/v1/api`;
    
    // 生成广告展示脚本
    let scriptContent = '';
    
    switch(selectedAd.type) {
      case 'banner':
        scriptContent = `
          (function() {
            // 创建广告容器
            var adContainer = document.createElement('div');
            adContainer.id = 'ad-container-${selectedAd._id}';
            adContainer.style.width = '100%';
            adContainer.style.maxWidth = '728px';
            adContainer.style.margin = '0 auto';
            
            // 创建广告链接
            var adLink = document.createElement('a');
            adLink.href = '${baseUrl}/track/click/${selectedAd._id}';
            adLink.target = '_blank';
            
            // 创建广告图片
            var adImage = document.createElement('img');
            adImage.src = '${selectedAd.mediaUrl}';
            adImage.style.width = '100%';
            adImage.style.display = 'block';
            adImage.alt = '广告';
            
            // 组装广告元素
            adLink.appendChild(adImage);
            adContainer.appendChild(adLink);
            
            // 记录展示
            var impressionPixel = new Image();
            impressionPixel.src = '${baseUrl}/track/impression/${selectedAd._id}';
            impressionPixel.style.display = 'none';
            adContainer.appendChild(impressionPixel);
            
            // 插入广告到页面
            var adScript = document.getElementById('ad-script-${key}') || document.currentScript;
            adScript.parentNode.insertBefore(adContainer, adScript);
          })();
        `;
        break;
        
      case 'popup':
        scriptContent = `
          (function() {
            // 延迟显示弹窗
            setTimeout(function() {
              // 创建弹窗容器
              var overlay = document.createElement('div');
              overlay.id = 'ad-overlay-${selectedAd._id}';
              overlay.style.position = 'fixed';
              overlay.style.top = '0';
              overlay.style.left = '0';
              overlay.style.width = '100%';
              overlay.style.height = '100%';
              overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
              overlay.style.zIndex = '9999';
              overlay.style.display = 'flex';
              overlay.style.justifyContent = 'center';
              overlay.style.alignItems = 'center';
              
              // 创建弹窗内容
              var popup = document.createElement('div');
              popup.style.backgroundColor = '#fff';
              popup.style.borderRadius = '5px';
              popup.style.padding = '20px';
              popup.style.maxWidth = '90%';
              popup.style.maxHeight = '90%';
              popup.style.overflow = 'auto';
              popup.style.position = 'relative';
              
              // 创建关闭按钮
              var closeBtn = document.createElement('div');
              closeBtn.innerHTML = '&times;';
              closeBtn.style.position = 'absolute';
              closeBtn.style.top = '10px';
              closeBtn.style.right = '10px';
              closeBtn.style.fontSize = '24px';
              closeBtn.style.fontWeight = 'bold';
              closeBtn.style.cursor = 'pointer';
              closeBtn.onclick = function() {
                document.body.removeChild(overlay);
              };
              
              // 创建广告内容
              var adContent = document.createElement('div');
              adContent.innerHTML = '${selectedAd.content.replace(/'/g, "\\'")}';
              
              // 创建广告链接
              var adLink = document.createElement('a');
              adLink.href = '${baseUrl}/track/click/${selectedAd._id}';
              adLink.target = '_blank';
              adLink.style.display = 'block';
              adLink.style.marginTop = '15px';
              adLink.style.textAlign = 'center';
              adLink.style.padding = '10px';
              adLink.style.backgroundColor = '#4CAF50';
              adLink.style.color = 'white';
              adLink.style.textDecoration = 'none';
              adLink.style.borderRadius = '4px';
              adLink.innerHTML = '了解更多';
              
              // 组装弹窗
              popup.appendChild(closeBtn);
              popup.appendChild(adContent);
              popup.appendChild(adLink);
              overlay.appendChild(popup);
              
              // 添加到页面
              document.body.appendChild(overlay);
              
              // 记录展示
              var impressionPixel = new Image();
              impressionPixel.src = '${baseUrl}/track/impression/${selectedAd._id}';
            }, 3000);
          })();
        `;
        break;
        
      default:
        scriptContent = `
          (function() {
            // 创建广告容器
            var adContainer = document.createElement('div');
            adContainer.id = 'ad-container-${selectedAd._id}';
            adContainer.style.padding = '10px';
            adContainer.style.margin = '10px 0';
            adContainer.style.border = '1px solid #ddd';
            
            // 创建广告内容
            adContainer.innerHTML = '${selectedAd.content.replace(/'/g, "\\'")}';
            
            // 创建广告链接
            var adLink = document.createElement('a');
            adLink.href = '${baseUrl}/track/click/${selectedAd._id}';
            adLink.target = '_blank';
            adLink.innerHTML = '广告链接';
            adLink.style.display = 'block';
            adLink.style.marginTop = '10px';
            
            // 组装广告
            adContainer.appendChild(adLink);
            
            // 记录展示
            var impressionPixel = new Image();
            impressionPixel.src = '${baseUrl}/track/impression/${selectedAd._id}';
            impressionPixel.style.display = 'none';
            adContainer.appendChild(impressionPixel);
            
            // 插入广告到页面
            var adScript = document.getElementById('ad-script-${key}') || document.currentScript;
            adScript.parentNode.insertBefore(adContainer, adScript);
          })();
        `;
    }
    
    // 返回JavaScript
    res.set('Content-Type', 'application/javascript');
    res.send(scriptContent);
  } catch (err) {
    // 出错时返回空脚本，避免客户端错误
    res.set('Content-Type', 'application/javascript');
    res.send(`console.error("Error loading ad: ${err.message}");`);
  }
};

/**
 * @desc    记录广告展示
 * @route   POST /api/v1/api/track/impression/:adId
 * @access  公开
 */
exports.trackImpression = async (req, res, next) => {
  try {
    const { adId } = req.params;
    
    // 验证广告是否存在
    const ad = await Ad.findById(adId);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${adId}的广告`, 404));
    }
    
    // 记录展示信息
    const impression = await Impression.create({
      ad: adId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
      timestamp: Date.now()
    });
    
    // 更新广告展示次数
    await updateAdStats(adId, 'impression');
    
    // 返回1x1透明GIF图片作为响应（常见的跟踪像素做法）
    const transparentGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set('Content-Type', 'image/gif');
    res.send(transparentGif);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    记录广告点击
 * @route   POST /api/v1/api/track/click/:adId
 * @access  公开
 */
exports.trackClick = async (req, res, next) => {
  try {
    const { adId } = req.params;
    
    // 验证广告是否存在
    const ad = await Ad.findById(adId);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${adId}的广告`, 404));
    }
    
    // 记录点击信息
    const click = await Click.create({
      ad: adId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
      timestamp: Date.now()
    });
    
    // 更新广告点击次数
    await updateAdStats(adId, 'click');
    
    // 根据定价模型更新广告花费
    if (ad.pricing.model === 'CPC') {
      const spent = ad.spent + ad.pricing.value;
      await Ad.findByIdAndUpdate(adId, { spent });
    }
    
    // 重定向到广告目标URL
    res.redirect(ad.targetUrl);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    获取API密钥
 * @route   GET /api/v1/api/keys
 * @access  私有
 */
exports.getApiKey = async (req, res, next) => {
  try {
    // 查找用户的API密钥
    let apiKey = await ApiKey.findOne({ user: req.user.id });
    
    // 如果用户没有API密钥，创建一个
    if (!apiKey) {
      apiKey = await ApiKey.create({
        user: req.user.id,
        key: 'ak_' + crypto.randomBytes(20).toString('hex'),
        active: true
      });
    }
    
    res.status(200).json({
      success: true,
      message: '获取API密钥成功',
      data: apiKey
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    重新生成API密钥
 * @route   POST /api/v1/api/keys/regenerate
 * @access  私有
 */
exports.regenerateApiKey = async (req, res, next) => {
  try {
    // 生成新的API密钥
    const newKey = 'ak_' + crypto.randomBytes(20).toString('hex');
    
    // 更新或创建API密钥
    let apiKey = await ApiKey.findOneAndUpdate(
      { user: req.user.id },
      { 
        key: newKey,
        active: true,
        createdAt: Date.now()
      },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'API密钥已重新生成',
      data: apiKey
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    获取API调用统计
 * @route   GET /api/v1/api/stats
 * @access  私有
 */
exports.getStats = async (req, res, next) => {
  try {
    // 查找用户的API密钥
    const apiKey = await ApiKey.findOne({ user: req.user.id });
    
    if (!apiKey) {
      return next(new ErrorResponse('未找到API密钥', 404));
    }
    
    // 获取查询参数
    const { startDate, endDate } = req.query;
    
    // 构建日期范围
    let dateMatch = {};
    if (startDate) {
      dateMatch.timestamp = { $gte: new Date(startDate) };
    }
    if (endDate) {
      if (!dateMatch.timestamp) dateMatch.timestamp = {};
      dateMatch.timestamp.$lte = new Date(endDate);
    }
    
    // 查询展示和点击统计
    const adIds = await Ad.find({ user: req.user.id }).distinct('_id');
    
    // 获取展示数据
    const impressions = await Impression.countDocuments({
      ad: { $in: adIds },
      ...dateMatch
    });
    
    // 获取点击数据
    const clicks = await Click.countDocuments({
      ad: { $in: adIds },
      ...dateMatch
    });
    
    // 获取每日统计
    const dailyStats = await getDailyStats(adIds, dateMatch);
    
    // 获取广告统计
    const adStats = await getAdStats(adIds, dateMatch);
    
    res.status(200).json({
      success: true,
      message: '获取API统计成功',
      data: {
        apiKey: {
          key: apiKey.key,
          callCount: apiKey.callCount,
          lastUsed: apiKey.lastUsed
        },
        impressions,
        clicks,
        ctr: impressions > 0 ? (clicks / impressions) : 0,
        dailyStats,
        adStats
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 更新广告统计信息
 * @param {string} adId 广告ID
 * @param {string} type 类型 (impression 或 click)
 */
async function updateAdStats(adId, type) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 使用MongoDB聚合管道记录按日期统计
  if (type === 'impression') {
    await Impression.updateOne(
      { 
        ad: adId, 
        date: today
      },
      { 
        $inc: { count: 1 },
        $setOnInsert: { ad: adId, date: today }
      },
      { upsert: true }
    );
  } else if (type === 'click') {
    await Click.updateOne(
      { 
        ad: adId,
        date: today
      },
      { 
        $inc: { count: 1 },
        $setOnInsert: { ad: adId, date: today }
      },
      { upsert: true }
    );
  }
}

/**
 * 获取每日统计数据
 * @param {Array} adIds 广告ID数组
 * @param {Object} dateMatch 日期匹配条件
 * @returns {Promise<Array>} 每日统计数据
 */
async function getDailyStats(adIds, dateMatch) {
  // 使用聚合管道按日期分组统计
  const impressionsByDay = await Impression.aggregate([
    { $match: { ad: { $in: adIds }, ...dateMatch } },
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  const clicksByDay = await Click.aggregate([
    { $match: { ad: { $in: adIds }, ...dateMatch } },
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // 合并数据
  const dailyMap = {};
  
  impressionsByDay.forEach(day => {
    if (!dailyMap[day._id]) {
      dailyMap[day._id] = { date: day._id, impressions: 0, clicks: 0 };
    }
    dailyMap[day._id].impressions = day.count;
  });
  
  clicksByDay.forEach(day => {
    if (!dailyMap[day._id]) {
      dailyMap[day._id] = { date: day._id, impressions: 0, clicks: 0 };
    }
    dailyMap[day._id].clicks = day.count;
  });
  
  // 转换为数组并计算CTR
  return Object.values(dailyMap).map(day => ({
    ...day,
    ctr: day.impressions > 0 ? (day.clicks / day.impressions) : 0
  }));
}

/**
 * 获取广告统计数据
 * @param {Array} adIds 广告ID数组
 * @param {Object} dateMatch 日期匹配条件
 * @returns {Promise<Array>} 广告统计数据
 */
async function getAdStats(adIds, dateMatch) {
  // 获取所有广告
  const ads = await Ad.find({ _id: { $in: adIds } });
  
  // 广告ID映射表
  const adMap = {};
  ads.forEach(ad => {
    adMap[ad._id.toString()] = ad;
  });
  
  // 每个广告的展示次数
  const impressionsByAd = await Impression.aggregate([
    { $match: { ad: { $in: adIds }, ...dateMatch } },
    { $group: {
        _id: "$ad",
        count: { $sum: 1 }
      }
    }
  ]);
  
  // 每个广告的点击次数
  const clicksByAd = await Click.aggregate([
    { $match: { ad: { $in: adIds }, ...dateMatch } },
    { $group: {
        _id: "$ad",
        count: { $sum: 1 }
      }
    }
  ]);
  
  // 合并数据
  const result = [];
  
  impressionsByAd.forEach(item => {
    const adId = item._id.toString();
    const ad = adMap[adId];
    
    if (ad) {
      result.push({
        adId,
        name: ad.name,
        type: ad.type,
        impressions: item.count,
        clicks: 0,
        ctr: 0,
        spent: ad.spent
      });
    }
  });
  
  clicksByAd.forEach(item => {
    const adId = item._id.toString();
    const existingIndex = result.findIndex(r => r.adId === adId);
    
    if (existingIndex >= 0) {
      result[existingIndex].clicks = item.count;
      result[existingIndex].ctr = result[existingIndex].impressions > 0 
        ? (item.count / result[existingIndex].impressions) 
        : 0;
    } else if (adMap[adId]) {
      const ad = adMap[adId];
      result.push({
        adId,
        name: ad.name,
        type: ad.type,
        impressions: 0,
        clicks: item.count,
        ctr: 0,
        spent: ad.spent
      });
    }
  });
  
  return result;
} 