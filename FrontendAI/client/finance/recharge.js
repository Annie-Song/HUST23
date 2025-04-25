document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('rechargeForm');
    const amountInput = form.querySelector('input[name="amount"]');
    const paymentMethods = form.querySelectorAll('input[name="paymentMethod"]');
    const invoiceOptions = form.querySelectorAll('input[name="invoiceType"]');

    // ���ύ����
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // ��ȡ������
        const formData = new FormData(form);
        const rechargeData = {
            amount: parseFloat(formData.get('amount')),
            paymentMethod: formData.get('paymentMethod'),
            invoiceType: formData.get('invoiceType')
        };

        // ��֤����
        if (!validateForm(rechargeData)) {
            return;
        }

        // �ύ����
        submitRecharge(rechargeData);
    });

    // ���������֤
    amountInput.addEventListener('input', function() {
        const value = parseFloat(this.value);
        if (value < 100) {
            this.setCustomValidity('��ֵ���ܵ���100Ԫ');
        } else {
            this.setCustomValidity('');
        }
    });

    // ֧����ʽѡ����
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            updatePaymentMethod(this.value);
        });
    });

    // ��Ʊ����ѡ����
    invoiceOptions.forEach(option => {
        option.addEventListener('change', function() {
            updateInvoiceType(this.value);
        });
    });

    // ����֤
    function validateForm(data) {
        if (data.amount < 100) {
            alert('��ֵ���ܵ���100Ԫ');
            return false;
        }

        if (!data.paymentMethod) {
            alert('��ѡ��֧����ʽ');
            return false;
        }

        return true;
    }

    // �ύ��ֵ
    function submitRecharge(data) {
        // ��ʾ����״̬
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '������...';

        // ģ��API����
        setTimeout(() => {
            // ����֧����ʽ��ת����Ӧ��֧��ҳ��
            switch(data.paymentMethod) {
                case 'alipay':
                    window.location.href = '/payment/alipay?amount=' + data.amount;
                    break;
                case 'wechat':
                    window.location.href = '/payment/wechat?amount=' + data.amount;
                    break;
                case 'bank':
                    showBankTransferInfo(data.amount);
                    break;
            }

            // ���ð�ť״̬
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1000);
    }

    // ����֧����ʽUI
    function updatePaymentMethod(method) {
        const methodElements = document.querySelectorAll('.payment-method');
        methodElements.forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelector(`.payment-method input[value="${method}"]`).parentElement.classList.add('selected');
    }

    // ���·�Ʊ����UI
    function updateInvoiceType(type) {
        const optionElements = document.querySelectorAll('.invoice-option');
        optionElements.forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelector(`.invoice-option input[value="${type}"]`).parentElement.classList.add('selected');
    }

    // ��ʾ����ת����Ϣ
    function showBankTransferInfo(amount) {
        const bankInfo = `
            <div class="bank-transfer-info">
                <h3>����ת����Ϣ</h3>
                <div class="info-item">
                    <span>�����У�</span>
                    <span>�й��������б�������</span>
                </div>
                <div class="info-item">
                    <span>�˻�����</span>
                    <span>���ƽ̨�Ƽ����޹�˾</span>
                </div>
                <div class="info-item">
                    <span>�˺ţ�</span>
                    <span>6222 0000 0000 0000</span>
                </div>
                <div class="info-item">
                    <span>ת�˽�</span>
                    <span>?${amount.toFixed(2)}</span>
                </div>
                <div class="info-item">
                    <span>��ע��</span>
                    <span>��ֵ-${generateOrderNumber()}</span>
                </div>
                <p class="notice">��ʹ����ע����ֻ�����Ϊת�˱�ע���Ա����Ǽ�ʱȷ�ϵ���</p>
                <button class="btn btn-primary" onclick="window.location.href='/finance/history'">�����ת��</button>
            </div>
        `;

        // ����ģ̬��
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                ${bankInfo}
                <button class="modal-close">&times;</button>
            </div>
        `;

        document.body.appendChild(modal);

        // �ر�ģ̬��
        modal.querySelector('.modal-close').addEventListener('click', function() {
            document.body.removeChild(modal);
        });

        // ���ģ̬���ⲿ�ر�
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // ���ɶ�����
    function generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${year}${month}${day}${random}`;
    }
}); 