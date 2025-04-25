document.addEventListener('DOMContentLoaded', function() {
    // ѡ��л�
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // ���°�ť״̬
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // ����������ʾ
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-settings`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // �������ñ�����
    const basicSettingsForm = document.getElementById('basicSettingsForm');
    basicSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const settings = {
            platformName: document.getElementById('platformName').value,
            supportEmail: document.getElementById('supportEmail').value,
            supportPhone: document.getElementById('supportPhone').value,
            workingHours: document.getElementById('workingHours').value
        };

        // ����Logo�ϴ�
        const logoFile = document.getElementById('logoUpload').files[0];
        if (logoFile) {
            // �����������ļ��ϴ��߼�
            console.log('Uploading logo:', logoFile);
        }

        // ��������
        saveBasicSettings(settings).then(() => {
            alert('���������ѱ���');
        });
    });

    // �Ʒѹ��������
    const billingSettingsForm = document.getElementById('billingSettingsForm');
    billingSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const settings = {
            cpcRate: parseFloat(document.getElementById('cpcRate').value),
            cpmRate: parseFloat(document.getElementById('cpmRate').value),
            minRecharge: parseFloat(document.getElementById('minRecharge').value),
            withdrawFee: parseFloat(document.getElementById('withdrawFee').value)
        };

        // ��������
        saveBillingSettings(settings).then(() => {
            alert('�Ʒѹ����ѱ���');
        });
    });

    // ���λ������
    const slotForm = document.getElementById('slotForm');
    let currentSlotId = null;

    slotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const slotData = {
            name: document.getElementById('slotName').value,
            width: parseInt(document.getElementById('slotWidth').value),
            height: parseInt(document.getElementById('slotHeight').value),
            type: document.getElementById('slotType').value,
            description: document.getElementById('slotDescription').value
        };

        if (currentSlotId) {
            // ���¹��λ
            updateAdSlot(currentSlotId, slotData).then(() => {
                alert('���λ�Ѹ���');
                closeSlotModal();
                loadAdSlots();
            });
        } else {
            // ��ӹ��λ
            createAdSlot(slotData).then(() => {
                alert('���λ�����');
                closeSlotModal();
                loadAdSlots();
            });
        }
    });

    // ��ʾ��ӹ��λģ̬��
    window.showAddSlotModal = function() {
        currentSlotId = null;
        document.getElementById('slotModalTitle').textContent = '��ӹ��λ';
        document.getElementById('slotForm').reset();
        document.getElementById('slotModal').style.display = 'flex';
    };

    // ��ʾ�༭���λģ̬��
    window.showEditSlotModal = function(slotId) {
        currentSlotId = slotId;
        document.getElementById('slotModalTitle').textContent = '�༭���λ';
        
        // ��ȡ���λ��Ϣ
        getAdSlotDetails(slotId).then(slot => {
            document.getElementById('slotName').value = slot.name;
            document.getElementById('slotWidth').value = slot.width;
            document.getElementById('slotHeight').value = slot.height;
            document.getElementById('slotType').value = slot.type;
            document.getElementById('slotDescription').value = slot.description;
            
            document.getElementById('slotModal').style.display = 'flex';
        });
    };

    // �رչ��λģ̬��
    window.closeSlotModal = function() {
        document.getElementById('slotModal').style.display = 'none';
        document.getElementById('slotForm').reset();
    };

    // ��ʾ���ù��λȷ��ģ̬��
    window.showDisableSlotModal = function(slotId) {
        if (confirm('ȷ��Ҫ���øù��λ��')) {
            disableAdSlot(slotId).then(() => {
                alert('���λ�ѽ���');
                loadAdSlots();
            });
        }
    };

    // ��������
    function loadAdSlots() {
        // ���������Ӽ��ع��λ�б���߼�
        console.log('Loading ad slots...');
    }

    // ģ��API����
    function saveBasicSettings(settings) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Saving basic settings:', settings);
                resolve();
            }, 500);
        });
    }

    function saveBillingSettings(settings) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Saving billing settings:', settings);
                resolve();
            }, 500);
        });
    }

    function getAdSlotDetails(slotId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: slotId,
                    name: '��ҳ���',
                    width: 1200,
                    height: 200,
                    type: 'image',
                    description: '��վ��ҳ����������λ'
                });
            }, 500);
        });
    }

    function createAdSlot(slotData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Creating ad slot:', slotData);
                resolve();
            }, 500);
        });
    }

    function updateAdSlot(slotId, slotData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Updating ad slot ${slotId}:`, slotData);
                resolve();
            }, 500);
        });
    }

    function disableAdSlot(slotId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Disabling ad slot ${slotId}`);
                resolve();
            }, 500);
        });
    }

    // ���ģ̬���ⲿ�ر�
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeSlotModal();
            }
        });
    });
}); 