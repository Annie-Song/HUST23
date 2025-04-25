document.addEventListener('DOMContentLoaded', function() {
    // ������־����
    loadLogs();
    
    // ��ɸѡ�¼�
    document.getElementById('timeRange').addEventListener('change', function() {
        if (this.value === 'custom') {
            showCustomDateRange();
        }
    });
});

// ������־����
function loadLogs() {
    // ģ��API���û�ȡ����
    fetchLogs().then(data => {
        updateLogTable(data.logs);
        updatePagination(data.totalPages);
    });
}

// Ӧ��ɸѡ
function applyFilters() {
    const filters = {
        operationType: document.getElementById('operationType').value,
        operator: document.getElementById('operator').value,
        timeRange: document.getElementById('timeRange').value
    };

    // ��ʾ����״̬
    showLoading();

    // ģ��API���û�ȡɸѡ�������
    fetchLogs(filters).then(data => {
        updateLogTable(data.logs);
        updatePagination(data.totalPages);
        hideLoading();
    });
}

// ����ɸѡ
function resetFilters() {
    document.getElementById('operationType').value = 'all';
    document.getElementById('operator').value = '';
    document.getElementById('timeRange').value = 'month';
    
    // ���¼�������
    loadLogs();
}

// ������־���
function updateLogTable(logs) {
    const tbody = document.getElementById('logTableBody');
    tbody.innerHTML = '';

    logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateTime(log.time)}</td>
            <td>${getOperationTypeText(log.type)}</td>
            <td>${log.target}</td>
            <td>${log.operator}</td>
            <td>${log.ip}</td>
            <td><span class="status ${log.result === 'success' ? 'success' : 'failed'}">${getResultText(log.result)}</span></td>
            <td>
                <button class="btn btn-sm" onclick="showLogDetail(${log.id})">�鿴����</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ���·�ҳ��Ϣ
function updatePagination(totalPages) {
    document.getElementById('totalPages').textContent = totalPages;
}

// ��ʾ��־����
function showLogDetail(logId) {
    // ģ��API���û�ȡ��־����
    getLogDetail(logId).then(log => {
        document.getElementById('detailTime').textContent = formatDateTime(log.time);
        document.getElementById('detailType').textContent = getOperationTypeText(log.type);
        document.getElementById('detailTarget').textContent = log.target;
        document.getElementById('detailOperator').textContent = log.operator;
        document.getElementById('detailIp').textContent = log.ip;
        document.getElementById('detailResult').textContent = getResultText(log.result);
        document.getElementById('detailRemark').textContent = log.remark || '��';
        
        document.getElementById('logDetailModal').style.display = 'flex';
    });
}

// �ر���־����
function closeLogDetail() {
    document.getElementById('logDetailModal').style.display = 'none';
}

// ������־
function exportLogs() {
    const filters = {
        operationType: document.getElementById('operationType').value,
        operator: document.getElementById('operator').value,
        timeRange: document.getElementById('timeRange').value
    };

    // ģ��API���õ�����־
    exportLogData(filters).then(() => {
        alert('��־�����ɹ���');
    });
}

// ��ҳ����
let currentPage = 1;
const pageSize = 10;

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadPageData();
    }
}

function nextPage() {
    if (currentPage < parseInt(document.getElementById('totalPages').textContent)) {
        currentPage++;
        loadPageData();
    }
}

function loadPageData() {
    const filters = {
        operationType: document.getElementById('operationType').value,
        operator: document.getElementById('operator').value,
        timeRange: document.getElementById('timeRange').value,
        page: currentPage,
        pageSize: pageSize
    };

    fetchLogs(filters).then(data => {
        updateLogTable(data.logs);
        document.getElementById('currentPage').textContent = currentPage;
    });
}

// ��ʾ�Զ������ڷ�Χѡ����
function showCustomDateRange() {
    // �����������Զ������ڷ�Χѡ�������߼�
    alert('�Զ������ڷ�Χ���ܿ�����...');
}

// ��ʾ����״̬
function showLoading() {
    // ���������Ӽ���״̬����ʾ�߼�
    console.log('Loading...');
}

// ���ؼ���״̬
function hideLoading() {
    // ���������Ӽ���״̬�������߼�
    console.log('Loading complete');
}

// ��������
function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function getOperationTypeText(type) {
    const types = {
        create: '����',
        update: '����',
        delete: 'ɾ��',
        approve: '���ͨ��',
        reject: '��˾ܾ�'
    };
    return types[type] || type;
}

function getResultText(result) {
    return result === 'success' ? '�ɹ�' : 'ʧ��';
}

// ģ��API����
function fetchLogs(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // ģ������
            const data = {
                logs: [
                    {
                        id: 1,
                        time: '2024-01-01 10:00:00',
                        type: 'approve',
                        target: '���ID: 1001',
                        operator: '����Ա',
                        ip: '192.168.1.1',
                        result: 'success',
                        remark: '������ݷ��Ϲ淶'
                    },
                    // ��������...
                ],
                totalPages: 10
            };
            resolve(data);
        }, 500);
    });
}

function getLogDetail(logId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // ģ������
            resolve({
                id: logId,
                time: '2024-01-01 10:00:00',
                type: 'approve',
                target: '���ID: 1001',
                operator: '����Ա',
                ip: '192.168.1.1',
                result: 'success',
                remark: '������ݷ��Ϲ淶��ͼƬ��������������׼ȷ'
            });
        }, 500);
    });
}

function exportLogData(filters) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Exporting log data with filters:', filters);
            resolve();
        }, 1000);
    });
}

// ���ģ̬���ⲿ�ر�
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeLogDetail();
        }
    });
}); 