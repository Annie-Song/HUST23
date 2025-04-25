/**
 * 广告渲染引擎
 * 负责广告的加载、渲染和展示
 */

class AdRenderer {
    constructor(options = {}) {
        this.options = {
            container: null,
            adType: 'banner',
            width: 'auto',
            height: 'auto',
            ...options
        };
        
        this.adContainer = null;
        this.adInstance = null;
        this.isLoaded = false;
    }

    /**
     * 初始化渲染器
     */
    init() {
        if (!this.options.container) {
            throw new Error('Container is required');
        }

        this.adContainer = document.createElement('div');
        this.adContainer.className = `ad-container ad-${this.options.adType}`;
        this.adContainer.style.width = this.options.width;
        this.adContainer.style.height = this.options.height;

        this.options.container.appendChild(this.adContainer);
    }

    /**
     * 加载广告
     * @param {Object} adData - 广告数据
     */
    async loadAd(adData) {
        try {
            // 显示加载状态
            this.showLoading();

            // 根据广告类型选择渲染方法
            switch (this.options.adType) {
                case 'banner':
                    await this.renderBanner(adData);
                    break;
                case 'video':
                    await this.renderVideo(adData);
                    break;
                case 'popup':
                    await this.renderPopup(adData);
                    break;
                default:
                    throw new Error(`Unsupported ad type: ${this.options.adType}`);
            }

            this.isLoaded = true;
            this.hideLoading();
            
            // 触发广告加载完成事件
            this.triggerEvent('adLoaded', { adData });
        } catch (error) {
            console.error('Failed to load ad:', error);
            this.showError();
            this.triggerEvent('adError', { error });
        }
    }

    /**
     * 渲染横幅广告
     * @param {Object} adData - 广告数据
     */
    async renderBanner(adData) {
        const banner = document.createElement('div');
        banner.className = 'ad-banner';
        
        if (adData.imageUrl) {
            const img = document.createElement('img');
            img.src = adData.imageUrl;
            img.alt = adData.title;
            banner.appendChild(img);
        }
        
        if (adData.title) {
            const title = document.createElement('h3');
            title.textContent = adData.title;
            banner.appendChild(title);
        }
        
        if (adData.description) {
            const desc = document.createElement('p');
            desc.textContent = adData.description;
            banner.appendChild(desc);
        }

        this.adContainer.innerHTML = '';
        this.adContainer.appendChild(banner);
    }

    /**
     * 渲染视频广告
     * @param {Object} adData - 广告数据
     */
    async renderVideo(adData) {
        const video = document.createElement('video');
        video.className = 'ad-video';
        video.src = adData.videoUrl;
        video.controls = false;
        video.autoplay = true;
        video.muted = true;
        video.loop = adData.loop || false;

        this.adContainer.innerHTML = '';
        this.adContainer.appendChild(video);
    }

    /**
     * 渲染弹窗广告
     * @param {Object} adData - 广告数据
     */
    async renderPopup(adData) {
        const popup = document.createElement('div');
        popup.className = 'ad-popup';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.closePopup();
        
        popup.appendChild(closeBtn);
        
        if (adData.content) {
            popup.innerHTML += adData.content;
        }

        this.adContainer.innerHTML = '';
        this.adContainer.appendChild(popup);
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        const loading = document.createElement('div');
        loading.className = 'ad-loading';
        loading.innerHTML = '<div class="spinner"></div>';
        this.adContainer.innerHTML = '';
        this.adContainer.appendChild(loading);
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const loading = this.adContainer.querySelector('.ad-loading');
        if (loading) {
            loading.remove();
        }
    }

    /**
     * 显示错误状态
     */
    showError() {
        const error = document.createElement('div');
        error.className = 'ad-error';
        error.textContent = '广告加载失败';
        this.adContainer.innerHTML = '';
        this.adContainer.appendChild(error);
    }

    /**
     * 关闭弹窗广告
     */
    closePopup() {
        if (this.options.adType === 'popup') {
            this.adContainer.style.display = 'none';
            this.triggerEvent('popupClosed');
        }
    }

    /**
     * 触发自定义事件
     * @param {string} eventName - 事件名称
     * @param {Object} data - 事件数据
     */
    triggerEvent(eventName, data = {}) {
        const event = new CustomEvent(`ad:${eventName}`, {
            detail: data
        });
        this.adContainer.dispatchEvent(event);
    }

    /**
     * 销毁广告实例
     */
    destroy() {
        if (this.adContainer) {
            this.adContainer.remove();
            this.adContainer = null;
        }
        this.isLoaded = false;
    }
}

// 导出渲染器类
export default AdRenderer; 