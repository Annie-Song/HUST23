const { ErrorResponse } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');
const Ad = require('../models/Ad');
const AdStats = require('../models/AdStats');
const Impression = require('../models/Impression');
const Click = require('../models/Click');
const mongoose = require('mongoose');

/**
 * @desc    获取单个广告的统计数据
 * @route   GET /api/v1/stats/ads/:id
 * @access  私有
 */
exports.getAdStats = async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${req.params.id}的广告`, 404));
    }
    
    // 确保用户只能查看自己的广告统计
    if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('无权查看此广告统计数据', 403));
    }
    
    // 获取查询参数
    const { startDate, endDate, groupBy } = req.query;
    
    // 构建查询条件
    const query = { ad: req.params.id };
    
    if (startDate) {
      query.date = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      if (!query.date) query.date = {};
      query.date.$lte = new Date(endDate);
    }
    
    // 查询广告统计数据
    const adStats = await AdStats.find(query).sort('date');
    
    // 计算汇总数据
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalSpent = 0;
    
    adStats.forEach(stat => {
      totalImpressions += stat.impressions;
      totalClicks += stat.clicks;
      totalConversions += stat.conversions;
      totalSpent += stat.spent;
    });
    
    // 计算衍生指标
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) : 0;
    const cpc = totalClicks > 0 ? (totalSpent / totalClicks) : 0;
    const cpm = totalImpressions > 0 ? (totalSpent / totalImpressions * 1000) : 0;
    
    // 分组统计
    let groupedStats = [];
    
    if (groupBy === 'daily') {
      // 保持每日数据
      groupedStats = adStats.map(stat => ({
        date: stat.date,
        impressions: stat.impressions,
        clicks: stat.clicks,
        conversions: stat.conversions,
        spent: stat.spent,
        ctr: stat.impressions > 0 ? (stat.clicks / stat.impressions) : 0,
        conversionRate: stat.clicks > 0 ? (stat.conversions / stat.clicks) : 0
      }));
    } else if (groupBy === 'weekly') {
      // 按周分组
      const weekMap = {};
      
      adStats.forEach(stat => {
        const date = new Date(stat.date);
        const year = date.getFullYear();
        const weekNumber = getWeekNumber(date);
        const weekKey = `${year}-W${weekNumber}`;
        
        if (!weekMap[weekKey]) {
          weekMap[weekKey] = {
            week: weekKey,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            spent: 0
          };
        }
        
        weekMap[weekKey].impressions += stat.impressions;
        weekMap[weekKey].clicks += stat.clicks;
        weekMap[weekKey].conversions += stat.conversions;
        weekMap[weekKey].spent += stat.spent;
      });
      
      groupedStats = Object.values(weekMap).map(week => ({
        ...week,
        ctr: week.impressions > 0 ? (week.clicks / week.impressions) : 0,
        conversionRate: week.clicks > 0 ? (week.conversions / week.clicks) : 0
      }));
      
      // 按周排序
      groupedStats.sort((a, b) => a.week.localeCompare(b.week));
    } else if (groupBy === 'monthly') {
      // 按月分组
      const monthMap = {};
      
      adStats.forEach(stat => {
        const date = new Date(stat.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        
        if (!monthMap[monthKey]) {
          monthMap[monthKey] = {
            month: monthKey,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            spent: 0
          };
        }
        
        monthMap[monthKey].impressions += stat.impressions;
        monthMap[monthKey].clicks += stat.clicks;
        monthMap[monthKey].conversions += stat.conversions;
        monthMap[monthKey].spent += stat.spent;
      });
      
      groupedStats = Object.values(monthMap).map(month => ({
        ...month,
        ctr: month.impressions > 0 ? (month.clicks / month.impressions) : 0,
        conversionRate: month.clicks > 0 ? (month.conversions / month.clicks) : 0
      }));
      
      // 按月排序
      groupedStats.sort((a, b) => a.month.localeCompare(b.month));
    } else {
      // 默认不分组，使用原始日期数据
      groupedStats = adStats.map(stat => ({
        date: stat.date,
        impressions: stat.impressions,
        clicks: stat.clicks,
        conversions: stat.conversions,
        spent: stat.spent,
        ctr: stat.impressions > 0 ? (stat.clicks / stat.impressions) : 0,
        conversionRate: stat.clicks > 0 ? (stat.conversions / stat.clicks) : 0
      }));
    }
    
    // 查询人口统计学数据（年龄、性别、地区分布）
    const demographicStats = await getAdDemographics(req.params.id, startDate, endDate);
    
    res.status(200).json({
      success: true,
      message: '获取广告统计数据成功',
      data: {
        adId: ad._id,
        adName: ad.name,
        summary: {
          impressions: totalImpressions,
          clicks: totalClicks,
          conversions: totalConversions,
          spent: totalSpent,
          ctr,
          conversionRate,
          cpc,
          cpm
        },
        timeStats: groupedStats,
        demographicStats
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    获取用户所有广告的整体统计数据
 * @route   GET /api/v1/stats/overall
 * @access  私有
 */
exports.getOverallStats = async (req, res, next) => {
  try {
    // 获取查询参数
    const { startDate, endDate } = req.query;
    
    // 查询用户所有广告ID
    const userAds = await Ad.find({ user: req.user.id }).select('_id name status');
    
    if (userAds.length === 0) {
      return res.status(200).json({
        success: true,
        message: '用户暂无广告',
        data: {
          totalAds: 0,
          activeAds: 0,
          summary: {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            spent: 0,
            ctr: 0,
            conversionRate: 0,
            cpc: 0
          },
          monthlyStats: []
        }
      });
    }
    
    // 提取广告ID
    const adIds = userAds.map(ad => ad._id);
    
    // 构建查询条件
    const query = { ad: { $in: adIds } };
    
    if (startDate) {
      query.date = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      if (!query.date) query.date = {};
      query.date.$lte = new Date(endDate);
    }
    
    // 查询统计数据
    const adStats = await AdStats.find(query);
    
    // 计算总体统计数据
    const totalAds = userAds.length;
    const activeAds = userAds.filter(ad => ad.status === 'active').length;
    
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalSpent = 0;
    
    adStats.forEach(stat => {
      totalImpressions += stat.impressions;
      totalClicks += stat.clicks;
      totalConversions += stat.conversions;
      totalSpent += stat.spent;
    });
    
    // 计算衍生指标
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) : 0;
    const averageConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) : 0;
    const averageCPC = totalClicks > 0 ? (totalSpent / totalClicks) : 0;
    
    // 按月分组统计
    const monthlyMap = {};
    
    adStats.forEach(stat => {
      const date = new Date(stat.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spent: 0
        };
      }
      
      monthlyMap[monthKey].impressions += stat.impressions;
      monthlyMap[monthKey].clicks += stat.clicks;
      monthlyMap[monthKey].conversions += stat.conversions;
      monthlyMap[monthKey].spent += stat.spent;
    });
    
    const monthlyStats = Object.values(monthlyMap).map(month => ({
      ...month,
      ctr: month.impressions > 0 ? (month.clicks / month.impressions) : 0,
      conversionRate: month.clicks > 0 ? (month.conversions / month.clicks) : 0,
      cpc: month.clicks > 0 ? (month.spent / month.clicks) : 0
    }));
    
    // 按月排序
    monthlyStats.sort((a, b) => a.month.localeCompare(b.month));
    
    // 获取每个广告的统计摘要
    const adSummaries = await Promise.all(adIds.map(async (adId) => {
      const adData = userAds.find(ad => ad._id.toString() === adId.toString());
      const adStats = await AdStats.find({ ad: adId });
      
      let impressions = 0;
      let clicks = 0;
      let conversions = 0;
      let spent = 0;
      
      adStats.forEach(stat => {
        impressions += stat.impressions;
        clicks += stat.clicks;
        conversions += stat.conversions;
        spent += stat.spent;
      });
      
      return {
        adId,
        adName: adData.name,
        status: adData.status,
        impressions,
        clicks,
        ctr: impressions > 0 ? (clicks / impressions) : 0,
        conversions,
        conversionRate: clicks > 0 ? (conversions / clicks) : 0,
        spent
      };
    }));
    
    // 按展示量排序广告摘要
    adSummaries.sort((a, b) => b.impressions - a.impressions);
    
    res.status(200).json({
      success: true,
      message: '获取整体统计数据成功',
      data: {
        totalAds,
        activeAds,
        summary: {
          impressions: totalImpressions,
          clicks: totalClicks,
          conversions: totalConversions,
          spent: totalSpent,
          ctr: averageCTR,
          conversionRate: averageConversionRate,
          cpc: averageCPC
        },
        monthlyStats,
        adSummaries
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    记录广告展示
 * @route   POST /api/v1/stats/impression
 * @access  公开
 */
exports.recordImpression = async (req, res, next) => {
  try {
    const { adId, userId, userAgent, referer, ip } = req.body;
    
    if (!adId) {
      return next(new ErrorResponse('请提供广告ID', 400));
    }
    
    // 查找广告
    const ad = await Ad.findById(adId);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${adId}的广告`, 404));
    }
    
    // 确保广告处于活跃状态
    if (ad.status !== 'active') {
      return next(new ErrorResponse('该广告当前不活跃', 400));
    }
    
    // 提取客户端信息
    const userAgentInfo = parseUserAgent(userAgent);
    const ipInfo = await getLocationFromIp(ip);
    
    // 创建展示记录
    const impression = await Impression.create({
      ad: adId,
      user: userId || null,
      ip,
      userAgent,
      device: userAgentInfo.device,
      browser: userAgentInfo.browser,
      os: userAgentInfo.os,
      referer,
      country: ipInfo.country,
      region: ipInfo.region,
      city: ipInfo.city
    });
    
    // 更新今日统计数据
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyStats = await AdStats.findOne({
      ad: adId,
      date: today
    });
    
    if (!dailyStats) {
      dailyStats = await AdStats.create({
        ad: adId,
        date: today,
        impressions: 1,
        clicks: 0,
        conversions: 0,
        spent: ad.pricing.model === 'CPM' ? ad.pricing.value / 1000 : 0
      });
    } else {
      dailyStats.impressions += 1;
      
      // 如果是CPM计费，更新支出
      if (ad.pricing.model === 'CPM') {
        dailyStats.spent += ad.pricing.value / 1000;
      }
      
      await dailyStats.save();
    }
    
    // 如果是CPM计费，更新广告已花费金额
    if (ad.pricing.model === 'CPM') {
      ad.spent += ad.pricing.value / 1000;
      
      // 检查预算是否用尽
      if (ad.spent >= ad.budget) {
        ad.status = 'completed';
        logger.info(`广告 ${adId} 预算已用尽，已自动完成`);
      }
      
      await ad.save();
    }
    
    res.status(200).json({
      success: true,
      message: '广告展示已记录',
      data: {
        impressionId: impression._id
      }
    });
  } catch (err) {
    logger.error(`记录展示错误: ${err.message}`);
    // 不向客户端返回错误，确保广告加载不受影响
    res.status(200).json({
      success: true,
      message: '请求已处理'
    });
  }
};

/**
 * @desc    记录广告点击
 * @route   POST /api/v1/stats/click
 * @access  公开
 */
exports.recordClick = async (req, res, next) => {
  try {
    const { adId, impressionId, userId, userAgent, referer, ip } = req.body;
    
    if (!adId) {
      return next(new ErrorResponse('请提供广告ID', 400));
    }
    
    // 查找广告
    const ad = await Ad.findById(adId);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${adId}的广告`, 404));
    }
    
    // 提取客户端信息
    const userAgentInfo = parseUserAgent(userAgent);
    const ipInfo = await getLocationFromIp(ip);
    
    // 创建点击记录
    const click = await Click.create({
      ad: adId,
      impression: impressionId || null,
      user: userId || null,
      ip,
      userAgent,
      device: userAgentInfo.device,
      browser: userAgentInfo.browser,
      os: userAgentInfo.os,
      referer,
      country: ipInfo.country,
      region: ipInfo.region,
      city: ipInfo.city
    });
    
    // 更新今日统计数据
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyStats = await AdStats.findOne({
      ad: adId,
      date: today
    });
    
    if (!dailyStats) {
      dailyStats = await AdStats.create({
        ad: adId,
        date: today,
        impressions: 0,
        clicks: 1,
        conversions: 0,
        spent: ad.pricing.model === 'CPC' ? ad.pricing.value : 0
      });
    } else {
      dailyStats.clicks += 1;
      
      // 如果是CPC计费，更新支出
      if (ad.pricing.model === 'CPC') {
        dailyStats.spent += ad.pricing.value;
      }
      
      await dailyStats.save();
    }
    
    // 如果是CPC计费，更新广告已花费金额
    if (ad.pricing.model === 'CPC') {
      ad.spent += ad.pricing.value;
      
      // 检查预算是否用尽
      if (ad.spent >= ad.budget) {
        ad.status = 'completed';
        logger.info(`广告 ${adId} 预算已用尽，已自动完成`);
      }
      
      await ad.save();
    }
    
    // 重定向到目标URL
    res.status(200).json({
      success: true,
      message: '广告点击已记录',
      data: {
        clickId: click._id,
        targetUrl: ad.targetUrl
      }
    });
  } catch (err) {
    logger.error(`记录点击错误: ${err.message}`);
    // 发生错误时，仍然重定向用户，确保用户体验
    const targetUrl = (await Ad.findById(req.body.adId))?.targetUrl || '/';
    res.status(200).json({
      success: true,
      message: '请求已处理',
      data: {
        targetUrl
      }
    });
  }
};

/**
 * @desc    记录广告转化
 * @route   POST /api/v1/stats/conversion
 * @access  公开
 */
exports.recordConversion = async (req, res, next) => {
  try {
    const { adId, clickId, conversionType, conversionValue, userId } = req.body;
    
    if (!adId) {
      return next(new ErrorResponse('请提供广告ID', 400));
    }
    
    // 查找广告
    const ad = await Ad.findById(adId);
    
    if (!ad) {
      return next(new ErrorResponse(`未找到ID为${adId}的广告`, 404));
    }
    
    // 更新今日统计数据
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyStats = await AdStats.findOne({
      ad: adId,
      date: today
    });
    
    if (!dailyStats) {
      dailyStats = await AdStats.create({
        ad: adId,
        date: today,
        impressions: 0,
        clicks: 0,
        conversions: 1,
        spent: ad.pricing.model === 'CPA' ? ad.pricing.value : 0
      });
    } else {
      dailyStats.conversions += 1;
      
      // 如果是CPA计费，更新支出
      if (ad.pricing.model === 'CPA') {
        dailyStats.spent += ad.pricing.value;
      }
      
      await dailyStats.save();
    }
    
    // 如果是CPA计费，更新广告已花费金额
    if (ad.pricing.model === 'CPA') {
      ad.spent += ad.pricing.value;
      
      // 检查预算是否用尽
      if (ad.spent >= ad.budget) {
        ad.status = 'completed';
        logger.info(`广告 ${adId} 预算已用尽，已自动完成`);
      }
      
      await ad.save();
    }
    
    res.status(200).json({
      success: true,
      message: '广告转化已记录'
    });
  } catch (err) {
    logger.error(`记录转化错误: ${err.message}`);
    // 不向客户端返回错误，确保用户体验不受影响
    res.status(200).json({
      success: true,
      message: '请求已处理'
    });
  }
};

// 辅助函数：解析用户代理
function parseUserAgent(userAgent) {
  // 简化的用户代理解析
  let device = 'unknown';
  let browser = 'unknown';
  let os = 'unknown';
  
  if (!userAgent) {
    return { device, browser, os };
  }
  
  // 检测设备类型
  if (/mobile/i.test(userAgent)) {
    device = 'mobile';
  } else if (/tablet/i.test(userAgent)) {
    device = 'tablet';
  } else if (/ipad/i.test(userAgent)) {
    device = 'tablet';
  } else {
    device = 'desktop';
  }
  
  // 检测浏览器
  if (/chrome/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/safari/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/edge/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/opera/i.test(userAgent) || /opr/i.test(userAgent)) {
    browser = 'Opera';
  } else if (/msie|trident/i.test(userAgent)) {
    browser = 'Internet Explorer';
  }
  
  // 检测操作系统
  if (/windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/macintosh|mac os/i.test(userAgent)) {
    os = 'macOS';
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux';
  } else if (/android/i.test(userAgent)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS';
  }
  
  return { device, browser, os };
}

// 辅助函数：获取IP地址信息
async function getLocationFromIp(ip) {
  // 实际应用中应该使用IP地理位置API
  // 这里返回模拟数据
  return {
    country: 'China',
    region: 'Beijing',
    city: 'Beijing'
  };
}

// 辅助函数：获取广告人口统计数据
async function getAdDemographics(adId, startDate, endDate) {
  // 实际项目中应该从数据库聚合查询
  // 这里返回模拟数据
  return {
    ageGroups: {
      '18-24': 0.2,
      '25-34': 0.4,
      '35-44': 0.25,
      '45-54': 0.1,
      '55+': 0.05
    },
    gender: {
      male: 0.55,
      female: 0.45
    },
    regions: {
      '北京': 0.15,
      '上海': 0.18,
      '广东': 0.25,
      '江苏': 0.12,
      '浙江': 0.10,
      '其他': 0.20
    },
    devices: {
      desktop: 0.65,
      mobile: 0.30,
      tablet: 0.05
    }
  };
}

// 辅助函数：获取某日期所在周数
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

module.exports = exports;
