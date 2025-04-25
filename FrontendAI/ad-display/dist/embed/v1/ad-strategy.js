class AdStrategy {
    constructor(options) {
        this.apiEndpoint = options.apiEndpoint || '/api/strategy';
        this.adId = options.adId;
        this.frequencyCap = options.frequencyCap || 3; // Ĭ��ÿСʱ���չʾ3��
        this.targetingRules = options.targetingRules || {};
        this.impressionHistory = [];
        this.init();
    }

    init() {
        // ��localStorage����չʾ��ʷ
        this.loadImpressionHistory();
        // ���ö�ʱ������ڼ�¼
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
        // ÿСʱ����һ�ι��ڼ�¼
        setInterval(() => this.cleanupOldRecords(), 3600000);
    }

    cleanupOldRecords() {
        const now = Date.now();
        this.impressionHistory = this.impressionHistory.filter(
            record => now - record.timestamp < 3600000
        );
        this.saveImpressionHistory();
    }

    // ����Ƿ�ﵽƵ������
    checkFrequencyCap() {
        const now = Date.now();
        const recentImpressions = this.impressionHistory.filter(
            record => now - record.timestamp < 3600000
        );
        return recentImpressions.length < this.frequencyCap;
    }

    // ����Ƿ���϶������
    checkTargetingRules() {
        // ������λ��
        if (this.targetingRules.geo) {
            if (!this.checkGeoLocation(this.targetingRules.geo)) {
                return false;
            }
        }

        // ����豸����
        if (this.targetingRules.device) {
            if (!this.checkDeviceType(this.targetingRules.device)) {
                return false;
            }
        }

        // ���ʱ���
        if (this.targetingRules.time) {
            if (!this.checkTimeRange(this.targetingRules.time)) {
                return false;
            }
        }

        return true;
    }

    checkGeoLocation(geoRules) {
        // ������Ҫ���ɵ���λ�÷���
        // ��ʱ����true
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

    // ��¼չʾ
    recordImpression() {
        this.impressionHistory.push({
            timestamp: Date.now()
        });
        this.saveImpressionHistory();
    }

    // ����Ƿ����չʾ���
    canShowAd() {
        return this.checkFrequencyCap() && this.checkTargetingRules();
    }

    // ����Ͷ�Ų���
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
            console.error('����Ͷ�Ų���ʧ��:', error);
            return false;
        }
    }
}

export default AdStrategy; 