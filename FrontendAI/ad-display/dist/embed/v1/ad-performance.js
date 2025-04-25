class AdPerformance {
    constructor(options) {
        this.apiEndpoint = options.apiEndpoint || '/api/performance';
        this.adId = options.adId;
        this.metrics = {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            viewTime: 0,
            ctr: 0,
            cvr: 0,
            avgViewTime: 0
        };
        this.init();
    }

    init() {
        // 初始化数据获取
        this.fetchMetrics();
        // 设置定时更新
        this.setupUpdateInterval();
    }

    setupUpdateInterval() {
        // 每5分钟更新一次数据
        setInterval(() => this.fetchMetrics(), 300000);
    }

    async fetchMetrics() {
        try {
            const response = await fetch(`${this.apiEndpoint}/metrics?adId=${this.adId}`);
            const data = await response.json();
            this.updateMetrics(data);
        } catch (error) {
            console.error('获取广告效果数据失败:', error);
        }
    }

    updateMetrics(data) {
        this.metrics = {
            ...this.metrics,
            ...data
        };
        this.calculateDerivedMetrics();
    }

    calculateDerivedMetrics() {
        // 计算点击率
        this.metrics.ctr = this.metrics.impressions > 0 
            ? (this.metrics.clicks / this.metrics.impressions) * 100 
            : 0;

        // 计算转化率
        this.metrics.cvr = this.metrics.clicks > 0 
            ? (this.metrics.conversions / this.metrics.clicks) * 100 
            : 0;

        // 计算平均观看时长
        this.metrics.avgViewTime = this.metrics.impressions > 0 
            ? this.metrics.viewTime / this.metrics.impressions 
            : 0;
    }

    // 生成效果报告
    generateReport(timeRange = '7d') {
        return {
            summary: this.generateSummary(),
            trends: this.generateTrends(timeRange),
            audience: this.generateAudienceData(),
            recommendations: this.generateRecommendations()
        };
    }

    generateSummary() {
        return {
            impressions: this.metrics.impressions,
            clicks: this.metrics.clicks,
            conversions: this.metrics.conversions,
            ctr: this.metrics.ctr.toFixed(2) + '%',
            cvr: this.metrics.cvr.toFixed(2) + '%',
            avgViewTime: this.formatTime(this.metrics.avgViewTime)
        };
    }

    async generateTrends(timeRange) {
        try {
            const response = await fetch(`${this.apiEndpoint}/trends?adId=${this.adId}&timeRange=${timeRange}`);
            return await response.json();
        } catch (error) {
            console.error('获取趋势数据失败:', error);
            return null;
        }
    }

    async generateAudienceData() {
        try {
            const response = await fetch(`${this.apiEndpoint}/audience?adId=${this.adId}`);
            return await response.json();
        } catch (error) {
            console.error('获取受众数据失败:', error);
            return null;
        }
    }

    generateRecommendations() {
        const recommendations = [];

        // 基于CTR的推荐
        if (this.metrics.ctr < 1) {
            recommendations.push({
                type: 'ctr',
                message: '点击率较低，建议优化广告标题和图片',
                priority: 'high'
            });
        }

        // 基于转化率的推荐
        if (this.metrics.cvr < 2) {
            recommendations.push({
                type: 'cvr',
                message: '转化率较低，建议优化落地页体验',
                priority: 'medium'
            });
        }

        // 基于观看时长的推荐
        if (this.metrics.avgViewTime < 5000) {
            recommendations.push({
                type: 'engagement',
                message: '平均观看时长较短，建议优化视频内容',
                priority: 'medium'
            });
        }

        return recommendations;
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // 导出报告
    async exportReport(format = 'pdf') {
        try {
            const response = await fetch(`${this.apiEndpoint}/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    adId: this.adId,
                    format,
                    report: this.generateReport()
                })
            });
            return await response.json();
        } catch (error) {
            console.error('导出报告失败:', error);
            return null;
        }
    }
}

export default AdPerformance; 