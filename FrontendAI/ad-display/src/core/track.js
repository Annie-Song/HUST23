/**
 * 广告效果追踪模块
 * 负责广告的展示、点击、转化等数据的收集和上报
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
     * 生成会话ID
     * @returns {string} 会话ID
     */
    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 追踪广告展示
     * @param {Object} adData - 广告数据
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
     * 追踪广告点击
     * @param {Object} adData - 广告数据
     * @param {Event} event - 点击事件
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
     * 追踪广告转化
     * @param {Object} adData - 广告数据
     * @param {string} conversionType - 转化类型
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
     * 追踪广告错误
     * @param {Object} adData - 广告数据
     * @param {Error} error - 错误对象
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
     * 发送追踪数据
     * @param {Object} data - 追踪数据
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
            // 如果发送失败，可以将数据存储在本地，稍后重试
            this.storeFailedTrackingData(data);
        }
    }

    /**
     * 存储发送失败的追踪数据
     * @param {Object} data - 追踪数据
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
     * 重试发送失败的追踪数据
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

        // 更新本地存储
        localStorage.setItem('failedTrackingData', JSON.stringify(failed));

        return {
            successful,
            failed
        };
    }

    /**
     * 获取统计数据
     * @returns {Object} 统计数据
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

// 导出追踪器类
export default AdTracker; 