document.addEventListener('DOMContentLoaded', function() {
    // 初始化图表
    initCharts();
    
    // 加载数据
    loadData();
    
    // 绑定筛选事件
    document.getElementById('timeRange').addEventListener('change', function() {
        if (this.value === 'custom') {
            showCustomDateRange();
        }
    });
});

// 初始化图表
function initCharts() {
    // 营收趋势图表
    const revenueChart = echarts.init(document.getElementById('revenueChart'));
    const revenueOption = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>{a}: {c} 元'
        },
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
            type: 'value',
            name: '金额（元）'
        },
        series: [{
            name: '营收',
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

    // 点击量趋势图表
    const clicksChart = echarts.init(document.getElementById('clicksChart'));
    const clicksOption = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>{a}: {c} 次'
        },
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
            type: 'value',
            name: '点击量（次）'
        },
        series: [{
            name: '点击量',
            type: 'bar',
            data: [12000, 13200, 10100, 13400, 19000, 23000],
            itemStyle: {
                color: '#52c41a'
            }
        }]
    };
    clicksChart.setOption(clicksOption);

    // 窗口大小改变时重绘图表
    window.addEventListener('resize', function() {
        revenueChart.resize();
        clicksChart.resize();
    });
}

// 加载数据
function loadData() {
    // 模拟API调用获取数据
    fetchAnalyticsData().then(data => {
        updateOverviewCards(data.overview);
        updateDataTable(data.tableData);
        updateCharts(data.chartData);
    });
}

// 应用筛选
function applyFilters() {
    const filters = {
        timeRange: document.getElementById('timeRange').value,
        adType: document.getElementById('adType').value,
        adSlot: document.getElementById('adSlot').value
    };

    // 显示加载状态
    showLoading();

    // 模拟API调用获取筛选后的数据
    fetchAnalyticsData(filters).then(data => {
        updateOverviewCards(data.overview);
        updateDataTable(data.tableData);
        updateCharts(data.chartData);
        hideLoading();
    });
}

// 更新概览卡片
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

// 更新数据表格
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

// 更新图表数据
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

// 显示自定义日期范围选择器
function showCustomDateRange() {
    // 这里可以添加自定义日期范围选择器的逻辑
    alert('自定义日期范围功能开发中...');
}

// 导出数据
function exportData() {
    const filters = {
        timeRange: document.getElementById('timeRange').value,
        adType: document.getElementById('adType').value,
        adSlot: document.getElementById('adSlot').value
    };

    // 模拟API调用导出数据
    exportAnalyticsData(filters).then(() => {
        alert('数据导出成功！');
    });
}

// 分页控制
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

// 显示加载状态
function showLoading() {
    // 这里可以添加加载状态的显示逻辑
    console.log('Loading...');
}

// 隐藏加载状态
function hideLoading() {
    // 这里可以添加加载状态的隐藏逻辑
    console.log('Loading complete');
}

// 模拟API调用
function fetchAnalyticsData(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟数据
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
                        slot: '首页横幅',
                        type: '图片广告',
                        impressions: 10000,
                        clicks: 250,
                        ctr: 2.5,
                        revenue: 1250
                    },
                    // 更多数据...
                ],
                chartData: {
                    revenue: {
                        dates: ['1月', '2月', '3月', '4月', '5月', '6月'],
                        values: [120000, 132000, 101000, 134000, 190000, 230000]
                    },
                    clicks: {
                        dates: ['1月', '2月', '3月', '4月', '5月', '6月'],
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