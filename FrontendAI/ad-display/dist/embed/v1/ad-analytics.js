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
        // ��ʼ���¼�����
        this.setupEventListeners();
        // ���ͳ�ʼ������
        this.sendInitData();
    }

    setupEventListeners() {
        // �������չʾ
        document.addEventListener('adImpression', () => this.trackImpression());
        // ���������
        document.addEventListener('adClick', () => this.trackClick());
        // �������ر�
        document.addEventListener('adClose', () => this.trackClose());
        // ����ҳ��ɼ��Ա仯
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

        // ʹ��navigator.sendBeacon��������
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        navigator.sendBeacon(this.apiEndpoint, blob);
    }

    sendInitData() {
        this.sendData('init');
    }

    // ��ȡ���Ч������
    async getPerformanceData(timeRange = '7d') {
        try {
            const response = await fetch(`${this.apiEndpoint}/performance?adId=${this.adId}&timeRange=${timeRange}`);
            return await response.json();
        } catch (error) {
            console.error('��ȡ���Ч������ʧ��:', error);
            return null;
        }
    }

    // ��ȡ�����ͼ����
    async getHeatmapData() {
        try {
            const response = await fetch(`${this.apiEndpoint}/heatmap?adId=${this.adId}`);
            return await response.json();
        } catch (error) {
            console.error('��ȡ�����ͼ����ʧ��:', error);
            return null;
        }
    }
}

export default AdAnalytics; 