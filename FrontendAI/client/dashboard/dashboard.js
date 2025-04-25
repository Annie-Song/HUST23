// ��ʼ��ͼ��
document.addEventListener('DOMContentLoaded', function() {
    // ��������ͼ��
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'line',
        data: {
            labels: ['��һ', '�ܶ�', '����', '����', '����', '����', '����'],
            datasets: [{
                label: 'չʾ��',
                data: [1200, 1900, 3000, 5000, 2000, 3000, 4000],
                borderColor: '#1890ff',
                tension: 0.1
            }, {
                label: '�����',
                data: [50, 100, 200, 300, 150, 200, 250],
                borderColor: '#52c41a',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // �����ֲ�ͼ��
    const channelCtx = document.getElementById('channelChart').getContext('2d');
    new Chart(channelCtx, {
        type: 'doughnut',
        data: {
            labels: ['��վ', '�ƶ�Ӧ��', '�罻ý��', '��Ƶƽ̨'],
            datasets: [{
                data: [30, 25, 20, 25],
                backgroundColor: [
                    '#1890ff',
                    '#52c41a',
                    '#faad14',
                    '#f5222d'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });

    // �����˵�����
    const dropdownBtn = document.querySelector('.dropdown button');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    dropdownBtn.addEventListener('click', function() {
        dropdownMenu.classList.toggle('show');
    });

    // ��������ط��ر������˵�
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            dropdownMenu.classList.remove('show');
        }
    });

    // ģ�����ݸ���
    function updateDashboardData() {
        // ����������ʵʱ���ݸ��µ��߼�
        // ����ͨ��WebSocket��ʱ����API
    }

    // ÿ5���Ӹ���һ������
    setInterval(updateDashboardData, 5 * 60 * 1000);
}); 