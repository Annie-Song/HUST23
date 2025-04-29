const mongoose = require('mongoose');

const AdStatsSchema = new mongoose.Schema({
  ad: {
    type: mongoose.Schema.ObjectId,
    ref: 'Ad',
    required: [true, '统计数据必须关联广告']
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  impressions: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  spent: {
    type: Number,
    default: 0
  },
  // 按小时分布的数据
  hourlyData: [{
    hour: Number, // 0-23
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    spent: { type: Number, default: 0 }
  }],
  // 人口统计数据
  demographic: {
    ageGroups: {
      '18-24': { type: Number, default: 0 },
      '25-34': { type: Number, default: 0 },
      '35-44': { type: Number, default: 0 },
      '45-54': { type: Number, default: 0 },
      '55+': { type: Number, default: 0 }
    },
    gender: {
      male: { type: Number, default: 0 },
      female: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    regions: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  // 设备数据
  devices: {
    desktop: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  // 浏览器数据
  browsers: {
    chrome: { type: Number, default: 0 },
    firefox: { type: Number, default: 0 },
    safari: { type: Number, default: 0 },
    edge: { type: Number, default: 0 },
    ie: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 创建复合索引，确保每个广告每天只有一条记录
AdStatsSchema.index({ ad: 1, date: 1 }, { unique: true });

// 增加展示次数
AdStatsSchema.methods.incrementImpressions = function(count = 1, demographicData = null, deviceInfo = null) {
  this.impressions += count;
  
  // 如果提供了人口统计数据，更新相应字段
  if (demographicData) {
    if (demographicData.ageGroup && this.demographic.ageGroups[demographicData.ageGroup] !== undefined) {
      this.demographic.ageGroups[demographicData.ageGroup]++;
    }
    
    if (demographicData.gender && this.demographic.gender[demographicData.gender] !== undefined) {
      this.demographic.gender[demographicData.gender]++;
    }
    
    if (demographicData.region) {
      const currentCount = this.demographic.regions.get(demographicData.region) || 0;
      this.demographic.regions.set(demographicData.region, currentCount + 1);
    }
  }
  
  // 如果提供了设备信息，更新相应字段
  if (deviceInfo) {
    if (deviceInfo.type && this.devices[deviceInfo.type] !== undefined) {
      this.devices[deviceInfo.type]++;
    }
    
    if (deviceInfo.browser && this.browsers[deviceInfo.browser] !== undefined) {
      this.browsers[deviceInfo.browser]++;
    }
  }
  
  // 更新当前小时的数据
  const currentHour = new Date().getHours();
  let hourData = this.hourlyData.find(h => h.hour === currentHour);
  
  if (!hourData) {
    hourData = { hour: currentHour, impressions: 0, clicks: 0, conversions: 0, spent: 0 };
    this.hourlyData.push(hourData);
  }
  
  hourData.impressions += count;
  
  this.updatedAt = Date.now();
  return this.save();
};

// 增加点击次数
AdStatsSchema.methods.incrementClicks = function(count = 1, demographicData = null, deviceInfo = null) {
  this.clicks += count;
  
  // 更新当前小时的数据
  const currentHour = new Date().getHours();
  let hourData = this.hourlyData.find(h => h.hour === currentHour);
  
  if (!hourData) {
    hourData = { hour: currentHour, impressions: 0, clicks: 0, conversions: 0, spent: 0 };
    this.hourlyData.push(hourData);
  }
  
  hourData.clicks += count;
  
  this.updatedAt = Date.now();
  return this.save();
};

// 增加转化次数
AdStatsSchema.methods.incrementConversions = function(count = 1, value = 0) {
  this.conversions += count;
  
  // 更新消费金额
  if (value > 0) {
    this.spent += value;
  }
  
  // 更新当前小时的数据
  const currentHour = new Date().getHours();
  let hourData = this.hourlyData.find(h => h.hour === currentHour);
  
  if (!hourData) {
    hourData = { hour: currentHour, impressions: 0, clicks: 0, conversions: 0, spent: 0 };
    this.hourlyData.push(hourData);
  }
  
  hourData.conversions += count;
  if (value > 0) {
    hourData.spent += value;
  }
  
  this.updatedAt = Date.now();
  return this.save();
};

// 静态方法：查找或创建指定日期的广告统计记录
AdStatsSchema.statics.findOrCreate = async function(adId, date = new Date()) {
  // 将日期标准化为当天的开始时间
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  // 查找现有记录
  let stats = await this.findOne({ ad: adId, date: startOfDay });
  
  // 如果不存在，创建新记录
  if (!stats) {
    stats = await this.create({
      ad: adId,
      date: startOfDay,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spent: 0,
      hourlyData: [],
      updatedAt: Date.now()
    });
  }
  
  return stats;
};

// 静态方法：获取广告的日期范围内统计数据
AdStatsSchema.statics.getAdStatsByDateRange = async function(adId, startDate, endDate) {
  return this.find({
    ad: adId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort('date');
};

// 静态方法：获取广告的总体统计数据
AdStatsSchema.statics.getAdTotalStats = async function(adId) {
  const result = await this.aggregate([
    { $match: { ad: mongoose.Types.ObjectId(adId) } },
    { $group: {
      _id: null,
      impressions: { $sum: '$impressions' },
      clicks: { $sum: '$clicks' },
      conversions: { $sum: '$conversions' },
      spent: { $sum: '$spent' }
    }}
  ]);
  
  return result.length > 0 ? result[0] : { impressions: 0, clicks: 0, conversions: 0, spent: 0 };
};

// 虚拟属性：计算点击率 (CTR)
AdStatsSchema.virtual('ctr').get(function() {
  return this.impressions > 0 ? this.clicks / this.impressions : 0;
});

// 虚拟属性：计算转化率
AdStatsSchema.virtual('conversionRate').get(function() {
  return this.clicks > 0 ? this.conversions / this.clicks : 0;
});

// 虚拟属性：计算平均点击成本 (CPC)
AdStatsSchema.virtual('cpc').get(function() {
  return this.clicks > 0 ? this.spent / this.clicks : 0;
});

// 虚拟属性：计算千次展示成本 (CPM)
AdStatsSchema.virtual('cpm').get(function() {
  return this.impressions > 0 ? (this.spent / this.impressions) * 1000 : 0;
});

module.exports = mongoose.model('AdStats', AdStatsSchema);
