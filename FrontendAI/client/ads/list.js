document.addEventListener('DOMContentLoaded', function() {
    // ��ʼ��ɸѡ����
    const searchInput = document.querySelector('.search-box input');
    const statusSelect = document.querySelector('.filter-options select:first-of-type');
    const typeSelect = document.querySelector('.filter-options select:last-of-type');
    const resetButton = document.querySelector('.filter-options button');
    const searchButton = document.querySelector('.search-box button');

    // ��������
    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim();
        filterAds(searchTerm, statusSelect.value, typeSelect.value);
    });

    // ɸѡ����
    statusSelect.addEventListener('change', function() {
        filterAds(searchInput.value.trim(), this.value, typeSelect.value);
    });

    typeSelect.addEventListener('change', function() {
        filterAds(searchInput.value.trim(), statusSelect.value, this.value);
    });

    // ���ù���
    resetButton.addEventListener('click', function() {
        searchInput.value = '';
        statusSelect.value = '';
        typeSelect.value = '';
        filterAds('', '', '');
    });

    // ��������ť�¼�����
    const actionButtons = document.querySelectorAll('.action-buttons button');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            const adRow = this.closest('tr');
            const adName = adRow.querySelector('.ad-details h4').textContent;
            
            handleAdAction(action, adName, adRow);
        });
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

    // ��������
    function filterAds(searchTerm, status, type) {
        const adRows = document.querySelectorAll('.ad-list tbody tr');
        
        adRows.forEach(row => {
            const adName = row.querySelector('.ad-details h4').textContent.toLowerCase();
            const adStatus = row.querySelector('.status').classList[1];
            const adType = row.querySelector('td:nth-child(2)').textContent;
            
            const matchesSearch = !searchTerm || adName.includes(searchTerm.toLowerCase());
            const matchesStatus = !status || adStatus === status;
            const matchesType = !type || adType === type;
            
            row.style.display = matchesSearch && matchesStatus && matchesType ? '' : 'none';
        });
    }

    function handleAdAction(action, adName, adRow) {
        switch(action) {
            case '�༭':
                window.location.href = `/ads/edit?name=${encodeURIComponent(adName)}`;
                break;
            case '��ͣ':
                if (confirm(`ȷ��Ҫ��ͣ���"${adName}"��`)) {
                    pauseAd(adName, adRow);
                }
                break;
            case '����Ͷ��':
                if (confirm(`ȷ��Ҫ����Ͷ�Ź��"${adName}"��`)) {
                    resumeAd(adName, adRow);
                }
                break;
            case 'ɾ��':
                if (confirm(`ȷ��Ҫɾ�����"${adName}"�𣿴˲������ɻָ���`)) {
                    deleteAd(adName, adRow);
                }
                break;
            case '����':
                window.location.href = `/ads/analytics?name=${encodeURIComponent(adName)}`;
                break;
        }
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
    function pauseAd(adName, adRow) {
        // ģ��API����
        setTimeout(() => {
            const statusElement = adRow.querySelector('.status');
            statusElement.textContent = '����ͣ';
            statusElement.className = 'status paused';
            
            // ���²�����ť
            const actionButtons = adRow.querySelector('.action-buttons');
            actionButtons.innerHTML = `
                <button class="btn btn-sm">�༭</button>
                <button class="btn btn-sm">����Ͷ��</button>
                <button class="btn btn-sm">����</button>
            `;
        }, 500);
    }

    function resumeAd(adName, adRow) {
        // ģ��API����
        setTimeout(() => {
            const statusElement = adRow.querySelector('.status');
            statusElement.textContent = 'Ͷ����';
            statusElement.className = 'status running';
            
            // ���²�����ť
            const actionButtons = adRow.querySelector('.action-buttons');
            actionButtons.innerHTML = `
                <button class="btn btn-sm">�༭</button>
                <button class="btn btn-sm">��ͣ</button>
                <button class="btn btn-sm">����</button>
            `;
        }, 500);
    }

    function deleteAd(adName, adRow) {
        // ģ��API����
        setTimeout(() => {
            adRow.remove();
            // ����Ƿ��й��
            const remainingAds = document.querySelectorAll('.ad-list tbody tr');
            if (remainingAds.length === 0) {
                const tbody = document.querySelector('.ad-list tbody');
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">���޹��</td></tr>';
            }
        }, 500);
    }
}); 