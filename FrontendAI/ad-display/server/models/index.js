const mongoose = require('mongoose');

// 广告模型
const adSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['banner', 'video', 'popup'], required: true },
    size: { type: String, enum: ['small', 'medium', 'large', 'fullscreen'] },
    imageUrl: String,
    videoUrl: String,
    posterUrl: String,
    targetUrl: { type: String, required: true },
    status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected', 'active', 'paused'], default: 'draft' },
    startDate: Date,
    endDate: Date,
    budget: Number,
    advertiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// 广告统计模型
const analyticsSchema = new mongoose.Schema({
    adId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad', required: true },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    viewTime: { type: Number, default: 0 },
    dailyStats: [{
        date: Date,
        impressions: Number,
        clicks: Number,
        conversions: Number,
        viewTime: Number
    }],
    updatedAt: { type: Date, default: Date.now }
});

// 广告策略模型
const strategySchema = new mongoose.Schema({
    adId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad', required: true },
    frequencyCap: {
        perUser: Number,
        perDay: Number
    },
    targetingRules: {
        geo: [String],
        devices: [String],
        timeRange: {
            start: String,
            end: String
        }
    },
    updatedAt: { type: Date, default: Date.now }
});

// 广告审核模型
const reviewSchema = new mongoose.Schema({
    adId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewTime: Date,
    comments: String,
    createdAt: { type: Date, default: Date.now }
});

// 用户模型
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'advertiser', 'reviewer'], default: 'advertiser' },
    company: String,
    contact: String,
    createdAt: { type: Date, default: Date.now }
});

// 创建模型
const Ad = mongoose.model('Ad', adSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema);
const Strategy = mongoose.model('Strategy', strategySchema);
const Review = mongoose.model('Review', reviewSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
    Ad,
    Analytics,
    Strategy,
    Review,
    User
}; 