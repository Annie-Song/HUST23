class AdStrategy {
    constructor(options) {
        this.apiEndpoint = options.apiEndpoint || '/api/strategy';
        this.adId = options.adId;
        this.frequencyCap = options.frequencyCap || 3; // 默认每小时最多展示3次
        this.targetingRules = options.targetingRules || {};
        this.impressionHistory = [];
        this.init();
    }

    init() {
        // 从localStorage加载展示历史
        this.loadImpressionHistory();
        // 设置定时清理过期记录
        this.setupCleanupInterval();
    }

    loadImpressionHistory() {
        const history = localStorage.getItem(`ad_${this.adId}_history`);
        if (history) {
            this.impressionHistory = JSON.parse(history);
        }
    }

    saveImpressionHistory() {
        localStorage.setItem(`ad_${this.adId}_history`, JSON.stringify(this.impressionHistory));
    }

    setupCleanupInterval() {
        // 每小时清理一次过期记录
        setInterval(() => this.cleanupOldRecords(), 3600000);
    }

    cleanupOldRecords() {
        const now = Date.now();
        this.impressionHistory = this.impressionHistory.filter(
            record => now - record.timestamp < 3600000
        );
        this.saveImpressionHistory();
    }

    // 检查是否达到频次限制
    checkFrequencyCap() {
        const now = Date.now();
        const recentImpressions = this.impressionHistory.filter(
            record => now - record.timestamp < 3600000
        );
        return recentImpressions.length < this.frequencyCap;
    }

    // 检查是否符合定向规则
    checkTargetingRules() {
        // 检查地理位置
        if (this.targetingRules.geo) {
            if (!this.checkGeoLocation(this.targetingRules.geo)) {
                return false;
            }
        }

        // 检查设备类型
        if (this.targetingRules.device) {
            if (!this.checkDeviceType(this.targetingRules.device)) {
                return false;
            }
        }

        // 检查时间段
        if (this.targetingRules.time) {
            if (!this.checkTimeRange(this.targetingRules.time)) {
                return false;
            }
        }

        return true;
    }

    checkGeoLocation(geoRules) {
        // 这里需要集成地理位置服务
        // 暂时返回true
        return true;
    }

    checkDeviceType(deviceRules) {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
        const isTablet = /tablet|ipad/i.test(userAgent);

        if (deviceRules.mobile && !isMobile) return false;
        if (deviceRules.tablet && !isTablet) return false;
        if (deviceRules.desktop && (isMobile || isTablet)) return false;

        return true;
    }

    checkTimeRange(timeRules) {
        const now = new Date();
        const currentHour = now.getHours();

        if (timeRules.startHour && currentHour < timeRules.startHour) return false;
        if (timeRules.endHour && currentHour > timeRules.endHour) return false;

        return true;
    }

    // 记录展示
    recordImpression() {
        this.impressionHistory.push({
            timestamp: Date.now()
        });
        this.saveImpressionHistory();
    }

    // 检查是否可以展示广告
    canShowAd() {
        return this.checkFrequencyCap() && this.checkTargetingRules();
    }

    // 更新投放策略
    async updateStrategy(newStrategy) {
        try {
            const response = await fetch(`${this.apiEndpoint}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    adId: this.adId,
                    strategy: newStrategy
                })
            });
            const data = await response.json();
            if (data.success) {
                this.frequencyCap = newStrategy.frequencyCap || this.frequencyCap;
                this.targetingRules = newStrategy.targetingRules || this.targetingRules;
                return true;
            }
            return false;
        } catch (error) {
            console.error('更新投放策略失败:', error);
            return false;
        }
    }
}

export default AdStrategy; 