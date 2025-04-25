/**
 * �����Ⱦ����
 * ������ļ��ء���Ⱦ��չʾ
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
     * ��ʼ����Ⱦ��
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
     * ���ع��
     * @param {Object} adData - �������
     */
    async loadAd(adData) {
        try {
            // ��ʾ����״̬
            this.showLoading();

            // ���ݹ������ѡ����Ⱦ����
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
            
            // ��������������¼�
            this.triggerEvent('adLoaded', { adData });
        } catch (error) {
            console.error('Failed to load ad:', error);
            this.showError();
            this.triggerEvent('adError', { error });
        }
    }

    /**
     * ��Ⱦ������
     * @param {Object} adData - �������
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
     * ��Ⱦ��Ƶ���
     * @param {Object} adData - �������
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
     * ��Ⱦ�������
     * @param {Object} adData - �������
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
     * ��ʾ����״̬
     */
    showLoading() {
        const loading = document.createElement('div');
        loading.className = 'ad-loading';
        loading.innerHTML = '<div class="spinner"></div>';
        this.adContainer.innerHTML = '';
        this.adContainer.appendChild(loading);
    }

    /**
     * ���ؼ���״̬
     */
    hideLoading() {
        const loading = this.adContainer.querySelector('.ad-loading');
        if (loading) {
            loading.remove();
        }
    }

    /**
     * ��ʾ����״̬
     */
    showError() {
        const error = document.createElement('div');
        error.className = 'ad-error';
        error.textContent = '������ʧ��';
        this.adContainer.innerHTML = '';
        this.adContainer.appendChild(error);
    }

    /**
     * �رյ������
     */
    closePopup() {
        if (this.options.adType === 'popup') {
            this.adContainer.style.display = 'none';
            this.triggerEvent('popupClosed');
        }
    }

    /**
     * �����Զ����¼�
     * @param {string} eventName - �¼�����
     * @param {Object} data - �¼�����
     */
    triggerEvent(eventName, data = {}) {
        const event = new CustomEvent(`ad:${eventName}`, {
            detail: data
        });
        this.adContainer.dispatchEvent(event);
    }

    /**
     * ���ٹ��ʵ��
     */
    destroy() {
        if (this.adContainer) {
            this.adContainer.remove();
            this.adContainer = null;
        }
        this.isLoaded = false;
    }
}

// ������Ⱦ����
export default AdRenderer; 