class VideoAd {
    constructor(options) {
        this.container = options.container;
        this.videoElement = null;
        this.controls = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.currentVolume = 1;
        this.init();
    }

    init() {
        // ������ƵԪ��
        this.videoElement = document.createElement('video');
        this.videoElement.className = 'ad-video';
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.setAttribute('preload', 'auto');

        // ����������
        this.controls = document.createElement('div');
        this.controls.className = 'ad-video-controls';

        // �������Ű�ť
        const playButton = document.createElement('button');
        playButton.className = 'video-control-btn ad-video-play';
        playButton.innerHTML = '����';
        playButton.addEventListener('click', () => this.togglePlay());

        // ����������
        const progressContainer = document.createElement('div');
        progressContainer.className = 'video-progress';
        const progressBar = document.createElement('div');
        progressBar.className = 'video-progress-bar';
        progressContainer.appendChild(progressBar);
        progressContainer.addEventListener('click', (e) => this.seek(e));

        // ������������
        const volumeContainer = document.createElement('div');
        volumeContainer.className = 'video-volume';
        const volumeButton = document.createElement('button');
        volumeButton.className = 'video-control-btn ad-video-volume-button';
        volumeButton.innerHTML = '����';
        volumeButton.addEventListener('click', () => this.toggleMute());

        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.className = 'video-volume-slider';
        volumeSlider.min = 0;
        volumeSlider.max = 100;
        volumeSlider.value = 100;
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));

        volumeContainer.appendChild(volumeButton);
        volumeContainer.appendChild(volumeSlider);

        // ��װ������
        this.controls.appendChild(playButton);
        this.controls.appendChild(progressContainer);
        this.controls.appendChild(volumeContainer);

        // ��ӵ�����
        this.container.appendChild(this.videoElement);
        this.container.appendChild(this.controls);

        // ���¼�
        this.bindEvents();
    }

    bindEvents() {
        // ��Ƶ�¼�
        this.videoElement.addEventListener('timeupdate', () => this.updateProgress());
        this.videoElement.addEventListener('ended', () => this.onEnded());
        this.videoElement.addEventListener('error', () => this.onError());
        this.videoElement.addEventListener('loadedmetadata', () => this.onLoaded());

        // ����¼�
        this.container.addEventListener('mouseenter', () => this.showControls());
        this.container.addEventListener('mouseleave', () => this.hideControls());
    }

    loadAd(adData) {
        this.videoElement.src = adData.videoUrl;
        if (adData.posterUrl) {
            this.videoElement.poster = adData.posterUrl;
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.videoElement.pause();
        } else {
            this.videoElement.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.videoElement.muted = this.isMuted;
        this.updateVolumeButton();
    }

    setVolume(volume) {
        this.currentVolume = volume;
        this.videoElement.volume = volume;
        this.updateVolumeButton();
    }

    seek(e) {
        const rect = e.target.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.videoElement.currentTime = pos * this.videoElement.duration;
    }

    updateProgress() {
        const progress = (this.videoElement.currentTime / this.videoElement.duration) * 100;
        const progressBar = this.controls.querySelector('.video-progress-bar');
        progressBar.style.width = `${progress}%`;
    }

    updatePlayButton() {
        const playButton = this.controls.querySelector('.ad-video-play');
        playButton.innerHTML = this.isPlaying ? '��ͣ' : '����';
    }

    updateVolumeButton() {
        const volumeButton = this.controls.querySelector('.ad-video-volume-button');
        if (this.isMuted || this.currentVolume === 0) {
            volumeButton.innerHTML = '����';
        } else if (this.currentVolume < 0.5) {
            volumeButton.innerHTML = '������';
        } else {
            volumeButton.innerHTML = '����';
        }
    }

    showControls() {
        this.controls.style.opacity = '1';
    }

    hideControls() {
        if (this.isPlaying) {
            this.controls.style.opacity = '0';
        }
    }

    onEnded() {
        this.isPlaying = false;
        this.updatePlayButton();
    }

    onError() {
        console.error('��Ƶ����ʧ��');
        // ��ʾ����״̬
        const errorContainer = document.createElement('div');
        errorContainer.className = 'ad-video-error';
        errorContainer.innerHTML = `
            <div class="ad-video-error-icon">!</div>
            <div class="ad-video-error-message">��Ƶ����ʧ��</div>
            <button class="ad-video-retry-btn">����</button>
        `;
        this.container.appendChild(errorContainer);
    }

    onLoaded() {
        // ��ƵԪ���ݼ������
        console.log('��Ƶ�������');
    }
}

// ����VideoAd��
export default VideoAd; 