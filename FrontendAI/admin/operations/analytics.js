document.addEventListener('DOMContentLoaded', function() {
    // ��ʼ��ͼ��
    initCharts();
    
    // ��������
    loadData();
    
    // ��ɸѡ�¼�
    document.getElementById('timeRange').addEventListener('change', function() {
        if (this.value === 'custom') {
            showCustomDateRange();
        }
    });
});

// ��ʼ��ͼ��
function initCharts() {
    // Ӫ������ͼ��
    const revenueChart = echarts.init(document.getElementById('revenueChart'));
    const revenueOption = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>{a}: {c} Ԫ'
        },
        xAxis: {
            type: 'category',
            data: ['1��', '2��', '3��', '4��', '5��', '6��']
        },
        yAxis: {
            type: 'value',
            name: '��Ԫ��'
        },
        series: [{
            name: 'Ӫ��',
            type: 'line',
            data: [120000, 132000, 101000, 134000, 190000, 230000],
            smooth: true,
            lineStyle: {
                width: 3,
                color: '#1890ff'
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(24,144,255,0.3)'
                }, {
                    offset: 1,
                    color: 'rgba(24,144,255,0.1)'
                }])
            }
        }]
    };
    revenueChart.setOption(revenueOption);

    // ���������ͼ��
    const clicksChart = echarts.init(document.getElementById('clicksChart'));
    const clicksOption = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>{a}: {c} ��'
        },
        xAxis: {
            type: 'category',
            data: ['1��', '2��', '3��', '4��', '5��', '6��']
        },
        yAxis: {
            type: 'value',
            name: '��������Σ�'
        },
        series: [{
            name: '�����',
            type: 'bar',
            data: [12000, 13200, 10100, 13400, 19000, 23000],
            itemStyle: {
                color: '#52c41a'
            }
        }]
    };
    clicksChart.setOption(clicksOption);

    // ���ڴ�С�ı�ʱ�ػ�ͼ��
    window.addEventListener('resize', function() {
        revenueChart.resize();
        clicksChart.resize();
    });
}

// ��������
function loadData() {
    // ģ��API���û�ȡ����
    fetchAnalyticsData().then(data => {
        updateOverviewCards(data.overview);
        updateDataTable(data.tableData);
        updateCharts(data.chartData);
    });
}

// Ӧ��ɸѡ
function applyFilters() {
    const filters = {
        timeRange: document.getElementById('timeRange').value,
        adType: document.getElementById('adType').value,
        adSlot: document.getElementById('adSlot').value
    };

    // ��ʾ����״̬
    showLoading();

    // ģ��API���û�ȡɸѡ�������
    fetchAnalyticsData(filters).then(data => {
        updateOverviewCards(data.overview);
        updateDataTable(data.tableData);
        updateCharts(data.chartData);
        hideLoading();
    });
}

// ���¸�����Ƭ
function updateOverviewCards(data) {
    const cards = document.querySelectorAll('.overview-cards .card');
    cards.forEach((card, index) => {
        const valueElement = card.querySelector('.stat-value');
        const changeElement = card.querySelector('.stat-change');
        
        valueElement.textContent = data[index].value;
        changeElement.textContent = data[index].change;
        changeElement.className = 'stat-change ' + (data[index].change > 0 ? 'positive' : data[index].change < 0 ? 'negative' : '');
    });
}

// �������ݱ��
function updateDataTable(data) {
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.slot}</td>
            <td>${item.type}</td>
            <td>${item.impressions.toLocaleString()}</td>
            <td>${item.clicks.toLocaleString()}</td>
            <td>${item.ctr}%</td>
            <td>? ${item.revenue.toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
}

// ����ͼ������
function updateCharts(data) {
    const revenueChart = echarts.getInstanceByDom(document.getElementById('revenueChart'));
    const clicksChart = echarts.getInstanceByDom(document.getElementById('clicksChart'));

    revenueChart.setOption({
        xAxis: {
            data: data.revenue.dates
        },
        series: [{
            data: data.revenue.values
        }]
    });

    clicksChart.setOption({
        xAxis: {
            data: data.clicks.dates
        },
        series: [{
            data: data.clicks.values
        }]
    });
}

// ��ʾ�Զ������ڷ�Χѡ����
function showCustomDateRange() {
    // �����������Զ������ڷ�Χѡ�������߼�
    alert('�Զ������ڷ�Χ���ܿ�����...');
}

// ��������
function exportData() {
    const filters = {
        timeRange: document.getElementById('timeRange').value,
        adType: document.getElementById('adType').value,
        adSlot: document.getElementById('adSlot').value
    };

    // ģ��API���õ�������
    exportAnalyticsData(filters).then(() => {
        alert('���ݵ����ɹ���');
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
        timeRange: document.getElementById('timeRange').value,
        adType: document.getElementById('adType').value,
        adSlot: document.getElementById('adSlot').value,
        page: currentPage,
        pageSize: pageSize
    };

    fetchAnalyticsData(filters).then(data => {
        updateDataTable(data.tableData);
        document.getElementById('currentPage').textContent = currentPage;
    });
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

// ģ��API����
function fetchAnalyticsData(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // ģ������
            const data = {
                overview: [
                    { value: '? 1,234,567', change: 12.5 },
                    { value: '1,234', change: 5.2 },
                    { value: '56', change: 0 },
                    { value: '2.5%', change: -0.3 }
                ],
                tableData: [
                    {
                        date: '2024-01-01',
                        slot: '��ҳ���',
                        type: 'ͼƬ���',
                        impressions: 10000,
                        clicks: 250,
                        ctr: 2.5,
                        revenue: 1250
                    },
                    // ��������...
                ],
                chartData: {
                    revenue: {
                        dates: ['1��', '2��', '3��', '4��', '5��', '6��'],
                        values: [120000, 132000, 101000, 134000, 190000, 230000]
                    },
                    clicks: {
                        dates: ['1��', '2��', '3��', '4��', '5��', '6��'],
                        values: [12000, 13200, 10100, 13400, 19000, 23000]
                    }
                }
            };
            resolve(data);
        }, 500);
    });
}

function exportAnalyticsData(filters) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Exporting data with filters:', filters);
            resolve();
        }, 1000);
    });
} 