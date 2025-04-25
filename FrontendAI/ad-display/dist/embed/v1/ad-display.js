import AdAnalytics from './ad-analytics.js';
import AdStrategy from './ad-strategy.js';
import AdReview from './ad-review.js';
import AdPerformance from './ad-performance.js';

class AdDisplay {
    constructor(options) {
        this.container = options.container;
        this.adId = options.adId;
        this.adType = options.adType || 'banner';
        this.apiEndpoint = options.apiEndpoint || '/api';
        
        // 初始化各个模块
        this.analytics = new AdAnalytics({
            apiEndpoint: `${this.apiEndpoint}/analytics`,
            adId: this.adId
        });

        this.strategy = new AdStrategy({
            apiEndpoint: `${this.apiEndpoint}/strategy`,
            adId: this.adId,
            frequencyCap: options.frequencyCap,
            targetingRules: options.targetingRules
        });

        this.review = new AdReview({
            apiEndpoint: `${this.apiEndpoint}/review`,
            adId: this.adId,
            contentRules: options.contentRules
        });

        this.performance = new AdPerformance({
            apiEndpoint: `${this.apiEndpoint}/performance`,
            adId: this.adId
        });

        this.init();
    }

    init() {
        // 检查是否可以展示广告
        if (!this.strategy.canShowAd()) {
            console.log('广告展示被策略限制');
            return;
        }

        // 加载广告内容
        this.loadAd();
    }

    async loadAd() {
        try {
            // 获取广告内容
            const response = await fetch(`${this.apiEndpoint}/ad/${this.adId}`);
            const adData = await response.json();

            // 检查广告内容
            const reviewResult = await this.review.submitReview(adData);
            if (!reviewResult.passed) {
                console.error('广告内容审核未通过:', reviewResult.reason);
                return;
            }

            // 根据广告类型创建对应的广告实例
            switch (this.adType) {
                case 'banner':
                    this.createBannerAd(adData);
                    break;
                case 'video':
                    this.createVideoAd(adData);
                    break;
                case 'popup':
                    this.createPopupAd(adData);
                    break;
                default:
                    console.error('不支持的广告类型:', this.adType);
            }

            // 记录展示
            this.strategy.recordImpression();
            // 触发展示事件
            document.dispatchEvent(new CustomEvent('adImpression', {
                detail: { adId: this.adId }
            }));
        } catch (error) {
            console.error('加载广告失败:', error);
        }
    }

    createBannerAd(adData) {
        const banner = document.createElement('div');
        banner.className = `ad-container ad-banner size-${adData.size || 'medium'}`;
        
        const content = document.createElement('div');
        content.className = 'ad-banner';
        
        if (adData.imageUrl) {
            const img = document.createElement('img');
            img.src = adData.imageUrl;
            img.alt = adData.title;
            content.appendChild(img);
        }
        
        if (adData.title) {
            const title = document.createElement('h3');
            title.textContent = adData.title;
            content.appendChild(title);
        }
        
        if (adData.description) {
            const desc = document.createElement('p');
            desc.textContent = adData.description;
            content.appendChild(desc);
        }
        
        banner.appendChild(content);
        this.container.appendChild(banner);

        // 添加点击事件
        banner.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('adClick', {
                detail: { adId: this.adId }
            }));
        });
    }

    createVideoAd(adData) {
        const videoContainer = document.createElement('div');
        videoContainer.className = `ad-container ad-video size-${adData.size || 'medium'}`;
        
        const video = document.createElement('video');
        video.className = 'ad-video';
        video.src = adData.videoUrl;
        if (adData.posterUrl) {
            video.poster = adData.posterUrl;
        }
        video.setAttribute('playsinline', '');
        video.setAttribute('preload', 'auto');
        
        videoContainer.appendChild(video);
        this.container.appendChild(videoContainer);

        // 添加播放事件
        video.addEventListener('play', () => {
            document.dispatchEvent(new CustomEvent('adPlay', {
                detail: { adId: this.adId }
            }));
        });

        // 添加点击事件
        videoContainer.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('adClick', {
                detail: { adId: this.adId }
            }));
        });
    }

    createPopupAd(adData) {
        const popup = document.createElement('div');
        popup.className = `ad-container ad-popup size-${adData.size || 'medium'}`;
        
        const content = document.createElement('div');
        content.className = 'popup-content';
        
        if (adData.imageUrl) {
            const img = document.createElement('img');
            img.className = 'popup-image';
            img.src = adData.imageUrl;
            img.alt = adData.title;
            content.appendChild(img);
        }
        
        if (adData.title) {
            const title = document.createElement('h3');
            title.className = 'popup-title';
            title.textContent = adData.title;
            content.appendChild(title);
        }
        
        if (adData.description) {
            const desc = document.createElement('p');
            desc.className = 'popup-description';
            desc.textContent = adData.description;
            content.appendChild(desc);
        }
        
        popup.appendChild(content);
        this.container.appendChild(popup);

        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('adClose', {
                detail: { adId: this.adId }
            }));
            popup.remove();
        });
        popup.appendChild(closeBtn);

        // 添加点击事件
        popup.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('adClick', {
                detail: { adId: this.adId }
            }));
        });
    }

    // 获取广告效果数据
    async getPerformanceData(timeRange = '7d') {
        return await this.performance.generateReport(timeRange);
    }

    // 更新投放策略
    async updateStrategy(newStrategy) {
        return await this.strategy.updateStrategy(newStrategy);
    }

    // 获取审核状态
    async getReviewStatus() {
        return await this.review.getReviewStatus();
    }
}

export default AdDisplay; 