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
        // ��ʼ�����ݻ�ȡ
        this.fetchMetrics();
        // ���ö�ʱ����
        this.setupUpdateInterval();
    }

    setupUpdateInterval() {
        // ÿ5���Ӹ���һ������
        setInterval(() => this.fetchMetrics(), 300000);
    }

    async fetchMetrics() {
        try {
            const response = await fetch(`${this.apiEndpoint}/metrics?adId=${this.adId}`);
            const data = await response.json();
            this.updateMetrics(data);
        } catch (error) {
            console.error('��ȡ���Ч������ʧ��:', error);
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
        // ��������
        this.metrics.ctr = this.metrics.impressions > 0 
            ? (this.metrics.clicks / this.metrics.impressions) * 100 
            : 0;

        // ����ת����
        this.metrics.cvr = this.metrics.clicks > 0 
            ? (this.metrics.conversions / this.metrics.clicks) * 100 
            : 0;

        // ����ƽ���ۿ�ʱ��
        this.metrics.avgViewTime = this.metrics.impressions > 0 
            ? this.metrics.viewTime / this.metrics.impressions 
            : 0;
    }

    // ����Ч������
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
            console.error('��ȡ��������ʧ��:', error);
            return null;
        }
    }

    async generateAudienceData() {
        try {
            const response = await fetch(`${this.apiEndpoint}/audience?adId=${this.adId}`);
            return await response.json();
        } catch (error) {
            console.error('��ȡ��������ʧ��:', error);
            return null;
        }
    }

    generateRecommendations() {
        const recommendations = [];

        // ����CTR���Ƽ�
        if (this.metrics.ctr < 1) {
            recommendations.push({
                type: 'ctr',
                message: '����ʽϵͣ������Ż��������ͼƬ',
                priority: 'high'
            });
        }

        // ����ת���ʵ��Ƽ�
        if (this.metrics.cvr < 2) {
            recommendations.push({
                type: 'cvr',
                message: 'ת���ʽϵͣ������Ż����ҳ����',
                priority: 'medium'
            });
        }

        // ���ڹۿ�ʱ�����Ƽ�
        if (this.metrics.avgViewTime < 5000) {
            recommendations.push({
                type: 'engagement',
                message: 'ƽ���ۿ�ʱ���϶̣������Ż���Ƶ����',
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

    // ��������
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
            console.error('��������ʧ��:', error);
            return null;
        }
    }
}

export default AdPerformance; 