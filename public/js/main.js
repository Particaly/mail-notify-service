let modal;
let toast;
let currentWebhooks = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    modal = new bootstrap.Modal(document.getElementById('webhookModal'));
    toast = new bootstrap.Toast(document.getElementById('copyToast'));
    loadWebhooks();
});

// 添加一个通用的 API 请求处理函数
async function fetchApi(url, options = {}) {
    const response = await fetch(url, options);
    
    // 处理 401 未授权
    if (response.status === 401) {
        window.location.href = '/login.html';
        throw new Error('未登录或会话已过期');
    }
    
    // 其他错误状态码
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || '请求失败');
    }
    
    return await response.json();
}

// 加载所有webhook配置
async function loadWebhooks() {
    try {
        const data = await fetchApi('/api/webhook');
        if (data.success) {
            currentWebhooks = data.webhooks;
            renderWebhooks();
        }
    } catch (error) {
        if (!error.message.includes('未登录')) {
            alert('加载配置失败：' + error.message);
        }
    }
}

// 获取webhook触发URL
function getWebhookUrl(id) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/webhook/${id}/trigger`;
}

// 复制webhook URL
async function copyWebhookUrl(id) {
    const url = getWebhookUrl(id);
    try {
        await navigator.clipboard.writeText(url);
        toast.show();
    } catch (err) {
        alert('复制失败：' + err.message);
    }
}

// 渲染webhook列表
function renderWebhooks() {
    const container = document.getElementById('webhookList');
    container.innerHTML = currentWebhooks.map(webhook => `
        <div class="col-md-6 webhook-card">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${webhook.name}</h5>
                    <div class="webhook-url">
                        <code>${getWebhookUrl(webhook.id)}</code>
                        <button class="btn btn-sm btn-outline-secondary copy-btn" 
                                onclick="event.stopPropagation(); copyWebhookUrl('${webhook.id}')">
                            复制
                        </button>
                    </div>
                    <p class="card-text">
                        <strong>收件人：</strong>${webhook.to}<br>
                        <strong>发件人：</strong>${webhook.from}<br>
                        <strong>主题：</strong>${webhook.subject}<br>
                        <strong>状态：</strong>${webhook.active ? '启用' : '禁用'}
                    </p>
                    <div class="btn-group">
                        <button class="btn btn-primary btn-sm" onclick="editWebhook('${webhook.id}')">
                            编辑
                        </button>
                        <button class="btn btn-success btn-sm" onclick="triggerWebhook('${webhook.id}')">
                            触发
                        </button>
                        <button class="btn btn-${webhook.active ? 'warning' : 'info'} btn-sm" 
                                onclick="toggleWebhook('${webhook.id}', ${!webhook.active})">
                            ${webhook.active ? '禁用' : '启用'}
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteWebhook('${webhook.id}')">
                            删除
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 显示添加模态框
function showAddModal() {
    document.getElementById('modalTitle').textContent = '添加Webhook配置';
    document.getElementById('webhookForm').reset();
    document.getElementById('webhookId').value = '';
    modal.show();
}

// 显示编辑模态框
function editWebhook(id) {
    const webhook = currentWebhooks.find(w => w.id === id);
    if (webhook) {
        document.getElementById('modalTitle').textContent = '编辑Webhook配置';
        document.getElementById('webhookId').value = webhook.id;
        document.getElementById('name').value = webhook.name;
        document.getElementById('to').value = webhook.to;
        document.getElementById('from').value = webhook.from;
        document.getElementById('subject').value = webhook.subject;
        document.getElementById('content').value = webhook.content;
        modal.show();
    }
}

// 保存webhook配置
async function saveWebhook() {
    const id = document.getElementById('webhookId').value;
    const webhookData = {
        name: document.getElementById('name').value,
        to: document.getElementById('to').value,
        from: document.getElementById('from').value,
        subject: document.getElementById('subject').value,
        content: document.getElementById('content').value
    };

    try {
        const url = id ? `/api/webhook/${id}` : '/api/webhook';
        const data = await fetchApi(url, {
            method: id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookData)
        });
        
        if (data.success) {
            modal.hide();
            loadWebhooks();
        }
    } catch (error) {
        alert('保存失败：' + error.message);
    }
}

// 删除webhook配置
async function deleteWebhook(id) {
    if (!confirm('确定要删除这个配置吗？')) return;

    try {
        const response = await fetch(`/api/webhook/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            loadWebhooks();
        } else {
            alert('删除失败：' + (data.error || '未知错误'));
        }
    } catch (error) {
        alert('删除失败：' + error.message);
    }
}

// 触发webhook
async function triggerWebhook(id) {
    try {
        const response = await fetch(`/api/webhook/${id}/trigger`, {
            method: 'POST'
        });
        const data = await response.json();
        if (data.success) {
            alert('邮件发送成功！');
        } else {
            alert('触发失败：' + data.error);
        }
    } catch (error) {
        alert('触发失败：' + error.message);
    }
}

// 切换webhook状态
async function toggleWebhook(id, active) {
    try {
        const response = await fetch(`/api/webhook/${id}/toggle`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ active })
        });
        const data = await response.json();
        if (data.success) {
            loadWebhooks();
        } else {
            alert('状态更新失败：' + (data.error || '未知错误'));
        }
    } catch (error) {
        alert('状态更新失败：' + error.message);
    }
} 