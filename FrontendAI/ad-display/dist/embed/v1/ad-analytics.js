class AdAnalytics {
    constructor(options) {
        this.apiEndpoint = options.apiEndpoint || '/api/analytics';
        this.adId = options.adId;
        this.impressionCount = 0;
        this.clickCount = 0;
        this.viewTime = 0;
        this.startTime = null;
        this.init();
    }

    init() {
        // 初始化事件监听
        this.setupEventListeners();
        // 发送初始化数据
        this.sendInitData();
    }

    setupEventListeners() {
        // 监听广告展示
        document.addEventListener('adImpression', () => this.trackImpression());
        // 监听广告点击
        document.addEventListener('adClick', () => this.trackClick());
        // 监听广告关闭
        document.addEventListener('adClose', () => this.trackClose());
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    trackImpression() {
        this.impressionCount++;
        this.startTime = Date.now();
        this.sendData('impression');
    }

    trackClick() {
        this.clickCount++;
        this.sendData('click');
    }

    trackClose() {
        if (this.startTime) {
            this.viewTime += Date.now() - this.startTime;
            this.startTime = null;
        }
        this.sendData('close');
    }

    handleVisibilityChange() {
        if (document.hidden) {
            if (this.startTime) {
                this.viewTime += Date.now() - this.startTime;
                this.startTime = null;
            }
        } else {
            this.startTime = Date.now();
        }
    }

    sendData(eventType) {
        const data = {
            adId: this.adId,
            eventType,
            timestamp: Date.now(),
            impressionCount: this.impressionCount,
            clickCount: this.clickCount,
            viewTime: this.viewTime,
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language
        };

        // 使用navigator.sendBeacon发送数据
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        navigator.sendBeacon(this.apiEndpoint, blob);
    }

    sendInitData() {
        this.sendData('init');
    }

    // 获取广告效果数据
    async getPerformanceData(timeRange = '7d') {
        try {
            const response = await fetch(`${this.apiEndpoint}/performance?adId=${this.adId}&timeRange=${timeRange}`);
            return await response.json();
        } catch (error) {
            console.error('获取广告效果数据失败:', error);
            return null;
        }
    }

    // 获取点击热图数据
    async getHeatmapData() {
        try {
            const response = await fetch(`${this.apiEndpoint}/heatmap?adId=${this.adId}`);
            return await response.json();
        } catch (error) {
            console.error('获取点击热图数据失败:', error);
            return null;
        }
    }
}

export default AdAnalytics; 