document.addEventListener('DOMContentLoaded', function() {
    // ��ʼ��ɸѡ����
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    const resetFilterBtn = document.getElementById('resetFilter');

    // ɸѡ����
    roleFilter.addEventListener('change', function() {
        filterUsers(this.value, statusFilter.value);
    });

    statusFilter.addEventListener('change', function() {
        filterUsers(roleFilter.value, this.value);
    });

    // ���ù���
    resetFilterBtn.addEventListener('click', function() {
        roleFilter.value = '';
        statusFilter.value = '';
        filterUsers('', '');
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

    // �û�������
    const userForm = document.getElementById('userForm');
    let currentUserId = null;

    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;

        // ����֤
        if (password !== confirmPassword) {
            alert('������������벻һ��');
            return;
        }

        if (currentUserId) {
            // �༭�û�
            updateUser(currentUserId, { username, email, password, role });
        } else {
            // ����û�
            createUser({ username, email, password, role });
        }
    });

    // ��ʾ����û�ģ̬��
    window.showAddUserModal = function() {
        currentUserId = null;
        document.getElementById('modalTitle').textContent = '����û�';
        document.getElementById('userForm').reset();
        document.getElementById('userModal').style.display = 'flex';
    };

    // ��ʾ�༭�û�ģ̬��
    window.showEditUserModal = function(userId) {
        currentUserId = userId;
        document.getElementById('modalTitle').textContent = '�༭�û�';
        
        // ��ȡ�û���Ϣ
        getUserDetails(userId).then(user => {
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            document.getElementById('role').value = user.role;
            // �༭ʱ����Ҫ��д����
            document.getElementById('password').required = false;
            document.getElementById('confirmPassword').required = false;
            
            document.getElementById('userModal').style.display = 'flex';
        });
    };

    // �ر��û�ģ̬��
    window.closeUserModal = function() {
        document.getElementById('userModal').style.display = 'none';
        document.getElementById('userForm').reset();
        // ���������ֶ�Ϊ����
        document.getElementById('password').required = true;
        document.getElementById('confirmPassword').required = true;
    };

    // ��ʾ�����û�ȷ��ģ̬��
    window.showDisableUserModal = function(userId) {
        currentUserId = userId;
        document.getElementById('confirmMessage').textContent = 'ȷ��Ҫ���ø��û���';
        document.getElementById('confirmModal').style.display = 'flex';
    };

    // �ر�ȷ��ģ̬��
    window.closeConfirmModal = function() {
        document.getElementById('confirmModal').style.display = 'none';
    };

    // ȷ�ϲ���
    window.confirmAction = function() {
        disableUser(currentUserId).then(() => {
            alert('�û��ѽ���');
            closeConfirmModal();
            loadPageData(currentPage);
        });
    };

    // ��������
    function filterUsers(role, status) {
        const userRows = document.querySelectorAll('.user-list tbody tr');
        
        userRows.forEach(row => {
            const userRole = row.querySelector('.role-tag').classList[1];
            const userStatus = row.querySelector('.status').classList[1];
            
            const matchesRole = !role || userRole === role;
            const matchesStatus = !status || userStatus === status;
            
            row.style.display = matchesRole && matchesStatus ? '' : 'none';
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
    function getUserDetails(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: userId,
                    username: 'admin',
                    email: 'admin@example.com',
                    role: 'admin'
                });
            }, 500);
        });
    }

    function createUser(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Creating user:', userData);
                resolve();
            }, 500);
        });
    }

    function updateUser(userId, userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Updating user ${userId}:`, userData);
                resolve();
            }, 500);
        });
    }

    function disableUser(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Disabling user ${userId}`);
                resolve();
            }, 500);
        });
    }

    // ���ģ̬���ⲿ�ر�
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                if (modal.id === 'userModal') {
                    closeUserModal();
                } else if (modal.id === 'confirmModal') {
                    closeConfirmModal();
                }
            }
        });
    });
}); 