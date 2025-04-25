document.addEventListener('DOMContentLoaded', function() {
    // ��ʼ��ɸѡ����
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const resetFilterBtn = document.getElementById('resetFilter');

    // ɸѡ����
    statusFilter.addEventListener('change', function() {
        filterAds(this.value, typeFilter.value);
    });

    typeFilter.addEventListener('change', function() {
        filterAds(statusFilter.value, this.value);
    });

    // ���ù���
    resetFilterBtn.addEventListener('click', function() {
        statusFilter.value = '';
        typeFilter.value = '';
        filterAds('', '');
    });

    // ��ҳ����
    const prevPageButton = document.querySelector('.pagination button:first-of-type');
    const nextPageButton = document.querySelector('.pagination button:last-of-type');
    let currentPage = 1;
    const totalPages = 5;

    prevPageButton.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            loadPageData(currentPage);
        }
    });

    nextPageButton.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            loadPageData(currentPage);
        }
    });

    // ���ģ̬��
    const reviewModal = document.getElementById('reviewModal');
    let currentAdId = null;

    // ��ʾ���ģ̬��
    window.showReviewModal = function(adId) {
        currentAdId = adId;
        // ��ȡ�������
        getAdDetails(adId).then(ad => {
            // ���ģ̬������
            document.getElementById('modalAdPreview').src = ad.image;
            document.getElementById('modalAdTitle').textContent = ad.name;
            document.getElementById('modalAdvertiser').textContent = ad.advertiser;
            document.getElementById('modalAdType').textContent = ad.type;
            document.getElementById('modalAdDuration').textContent = `${ad.startTime} �� ${ad.endTime}`;
            document.getElementById('modalAdUrl').href = ad.targetUrl;

            // ��ʾģ̬��
            reviewModal.style.display = 'flex';
        });
    };

    // �ر����ģ̬��
    window.closeReviewModal = function() {
        reviewModal.style.display = 'none';
        // ���ñ�
        document.querySelector('input[name="reviewResult"]:checked').checked = false;
        document.getElementById('reviewComment').value = '';
    };

    // �ύ���
    window.submitReview = function() {
        const result = document.querySelector('input[name="reviewResult"]:checked');
        const comment = document.getElementById('reviewComment').value;

        if (!result) {
            alert('��ѡ����˽��');
            return;
        }

        if (result.value === 'rejected' && !comment.trim()) {
            alert('�ܾ�ʱ����д������');
            return;
        }

        // �ύ���
        submitReviewResult(currentAdId, result.value, comment).then(() => {
            alert('����ύ�ɹ�');
            closeReviewModal();
            // ˢ���б�
            loadPageData(currentPage);
        });
    };

    // ��������
    function filterAds(status, type) {
        const adRows = document.querySelectorAll('.review-list tbody tr');
        
        adRows.forEach(row => {
            const adStatus = row.querySelector('.status').classList[1];
            const adType = row.querySelector('td:nth-child(3)').textContent;
            
            const matchesStatus = !status || adStatus === status;
            const matchesType = !type || adType === type;
            
            row.style.display = matchesStatus && matchesType ? '' : 'none';
        });
    }

    function updatePagination() {
        const pageInfo = document.querySelector('.page-info');
        pageInfo.textContent = `�� ${currentPage} ҳ���� ${totalPages} ҳ`;
        
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    function loadPageData(page) {
        // ���������Ӽ���ҳ�����ݵ��߼�
        // ����ͨ��API��ȡ���ݲ����±��
        console.log(`Loading page ${page} data...`);
    }

    // ģ��API����
    function getAdDetails(adId) {
        return new Promise((resolve) => {
            // ģ��API�����ӳ�
            setTimeout(() => {
                resolve({
                    id: adId,
                    name: '�ļ������',
                    advertiser: 'ʾ�������',
                    type: '������',
                    startTime: '2024-06-01',
                    endTime: '2024-08-31',
                    image: '../../public/images/ads/sample1.jpg',
                    targetUrl: 'https://example.com'
                });
            }, 500);
        });
    }

    function submitReviewResult(adId, result, comment) {
        return new Promise((resolve) => {
            // ģ��API�����ӳ�
            setTimeout(() => {
                console.log(`Review submitted for ad ${adId}:`, { result, comment });
                resolve();
            }, 500);
        });
    }

    // ���ģ̬���ⲿ�ر�
    reviewModal.addEventListener('click', function(e) {
        if (e.target === reviewModal) {
            closeReviewModal();
        }
    });
}); 