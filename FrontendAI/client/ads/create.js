document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createAdForm');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const uploadInput = imageUpload.querySelector('.upload-input');
    const previewImage = imagePreview.querySelector('.preview-image');
    const removeImageBtn = imagePreview.querySelector('.remove-image');

    // ͼƬ�ϴ�����
    imageUpload.addEventListener('click', function() {
        uploadInput.click();
    });

    imageUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    imageUpload.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });

    imageUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        handleImageUpload(e.dataTransfer.files[0]);
    });

    uploadInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleImageUpload(this.files[0]);
        }
    });

    removeImageBtn.addEventListener('click', function() {
        imagePreview.style.display = 'none';
        imageUpload.style.display = 'block';
        uploadInput.value = '';
    });

    function handleImageUpload(file) {
        // ����ļ�����
        if (!file.type.match('image.*')) {
            alert('���ϴ�ͼƬ�ļ�');
            return;
        }

        // ����ļ���С
        if (file.size > 2 * 1024 * 1024) {
            alert('ͼƬ��С���ܳ���2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            imageUpload.style.display = 'none';
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // ����֤
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // ��ȡ������
        const formData = new FormData(form);
        const adData = {
            name: formData.get('adName'),
            type: formData.get('adType'),
            description: formData.get('adDescription'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            dailyBudget: parseFloat(formData.get('dailyBudget')),
            totalBudget: parseFloat(formData.get('totalBudget')),
            title: formData.get('adTitle'),
            copy: formData.get('adCopy'),
            image: previewImage.src,
            targetUrl: formData.get('targetUrl'),
            regions: formData.getAll('regions'),
            minAge: parseInt(formData.get('minAge')) || null,
            maxAge: parseInt(formData.get('maxAge')) || null,
            interests: formData.getAll('interests')
        };

        // ��֤����
        if (!validateForm(adData)) {
            return;
        }

        // �ύ����
        submitAd(adData);
    });

    function validateForm(data) {
        // ��֤ʱ��
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        if (endTime <= startTime) {
            alert('����ʱ��������ڿ�ʼʱ��');
            return false;
        }

        // ��֤Ԥ��
        if (data.dailyBudget <= 0 || data.totalBudget <= 0) {
            alert('Ԥ����������0');
            return false;
        }

        // ��֤���䷶Χ
        if (data.minAge && data.maxAge && data.minAge > data.maxAge) {
            alert('��С���䲻�ܴ����������');
            return false;
        }

        // ��֤ͼƬ
        if (!data.image) {
            alert('���ϴ����ͼƬ');
            return false;
        }

        return true;
    }

    function submitAd(data) {
        // ��ʾ����״̬
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '�ύ��...';

        // ģ��API����
        setTimeout(() => {
            // ���ð�ť״̬
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            // ģ��ɹ���Ӧ
            alert('��洴���ɹ���');
            window.location.href = '/ads/list';
        }, 1000);
    }

    // ����ʱ��ѡ������ʼ��
    const startTimeInput = form.querySelector('input[name="startTime"]');
    const endTimeInput = form.querySelector('input[name="endTime"]');

    // ������С����Ϊ��ǰʱ��
    const now = new Date();
    const minDate = now.toISOString().slice(0, 16);
    startTimeInput.min = minDate;
    endTimeInput.min = minDate;

    // ����ʼʱ��ı�ʱ�����½���ʱ�����Сֵ
    startTimeInput.addEventListener('change', function() {
        endTimeInput.min = this.value;
        if (endTimeInput.value && endTimeInput.value < this.value) {
            endTimeInput.value = this.value;
        }
    });

    // Ԥ��������֤
    const dailyBudgetInput = form.querySelector('input[name="dailyBudget"]');
    const totalBudgetInput = form.querySelector('input[name="totalBudget"]');

    dailyBudgetInput.addEventListener('input', function() {
        if (this.value && totalBudgetInput.value) {
            const days = Math.ceil((new Date(endTimeInput.value) - new Date(startTimeInput.value)) / (1000 * 60 * 60 * 24));
            if (parseFloat(this.value) * days > parseFloat(totalBudgetInput.value)) {
                alert('ÿ��Ԥ�����Ͷ���������ܳ�����Ԥ��');
                this.value = '';
            }
        }
    });

    totalBudgetInput.addEventListener('input', function() {
        if (this.value && dailyBudgetInput.value) {
            const days = Math.ceil((new Date(endTimeInput.value) - new Date(startTimeInput.value)) / (1000 * 60 * 60 * 24));
            if (parseFloat(dailyBudgetInput.value) * days > parseFloat(this.value)) {
                alert('��Ԥ�������ڻ����ÿ��Ԥ�����Ͷ������');
                this.value = '';
            }
        }
    });
}); 