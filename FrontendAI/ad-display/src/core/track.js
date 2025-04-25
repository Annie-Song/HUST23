/**
 * ���Ч��׷��ģ��
 * �������չʾ�������ת�������ݵ��ռ����ϱ�
 */

class AdTracker {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: '/api/track',
            debug: false,
            ...options
        };
        
        this.impressionCount = 0;
        this.clickCount = 0;
        this.conversionCount = 0;
        this.sessionId = this.generateSessionId();
    }

    /**
     * ���ɻỰID
     * @returns {string} �ỰID
     */
    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * ׷�ٹ��չʾ
     * @param {Object} adData - �������
     */
    trackImpression(adData) {
        this.impressionCount++;
        
        const data = {
            type: 'impression',
            adId: adData.id,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        this.sendTrackingData(data);
    }

    /**
     * ׷�ٹ����
     * @param {Object} adData - �������
     * @param {Event} event - ����¼�
     */
    trackClick(adData, event) {
        this.clickCount++;
        
        const data = {
            type: 'click',
            adId: adData.id,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            clickPosition: {
                x: event.clientX,
                y: event.clientY
            },
            element: {
                tagName: event.target.tagName,
                className: event.target.className
            }
        };

        this.sendTrackingData(data);
    }

    /**
     * ׷�ٹ��ת��
     * @param {Object} adData - �������
     * @param {string} conversionType - ת������
     */
    trackConversion(adData, conversionType) {
        this.conversionCount++;
        
        const data = {
            type: 'conversion',
            adId: adData.id,
            sessionId: this.sessionId,
            conversionType: conversionType,
            timestamp: new Date().toISOString()
        };

        this.sendTrackingData(data);
    }

    /**
     * ׷�ٹ�����
     * @param {Object} adData - �������
     * @param {Error} error - �������
     */
    trackError(adData, error) {
        const data = {
            type: 'error',
            adId: adData.id,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                stack: error.stack
            }
        };

        this.sendTrackingData(data);
    }

    /**
     * ����׷������
     * @param {Object} data - ׷������
     */
    async sendTrackingData(data) {
        try {
            if (this.options.debug) {
                console.log('Tracking data:', data);
            }

            const response = await fetch(this.options.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to send tracking data:', error);
            // �������ʧ�ܣ����Խ����ݴ洢�ڱ��أ��Ժ�����
            this.storeFailedTrackingData(data);
        }
    }

    /**
     * �洢����ʧ�ܵ�׷������
     * @param {Object} data - ׷������
     */
    storeFailedTrackingData(data) {
        const failedData = JSON.parse(localStorage.getItem('failedTrackingData') || '[]');
        failedData.push({
            data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('failedTrackingData', JSON.stringify(failedData));
    }

    /**
     * ���Է���ʧ�ܵ�׷������
     */
    async retryFailedTrackingData() {
        const failedData = JSON.parse(localStorage.getItem('failedTrackingData') || '[]');
        if (failedData.length === 0) return;

        const successful = [];
        const failed = [];

        for (const item of failedData) {
            try {
                await this.sendTrackingData(item.data);
                successful.push(item);
            } catch (error) {
                failed.push(item);
            }
        }

        // ���±��ش洢
        localStorage.setItem('failedTrackingData', JSON.stringify(failed));

        return {
            successful,
            failed
        };
    }

    /**
     * ��ȡͳ������
     * @returns {Object} ͳ������
     */
    getStats() {
        return {
            impressions: this.impressionCount,
            clicks: this.clickCount,
            conversions: this.conversionCount,
            sessionId: this.sessionId
        };
    }
}

// ����׷������
export default AdTracker; 