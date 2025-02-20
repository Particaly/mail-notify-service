# Mail Notify Service

一个基于 Webhook 的邮件通知服务，可以通过 HTTP 请求触发邮件发送。支持模板变量，可以从请求中获取动态内容。

## 功能特点

- 🔒 用户认证系统
- 📧 支持 SMTP 邮件发送（默认配置 QQ 邮箱）
- 🔗 生成唯一的 Webhook URL
- 📝 支持模板变量，可从请求中获取动态内容
- 🚦 Webhook 启用/禁用控制
- 🐳 Docker 支持

## 快速开始

### 环境要求

- Node.js 18+
- npm
- SQLite3

### 安装

1. 克隆仓库并安装依赖：
```bash
git clone https://github.com/Particaly/mail-notify-service.git
cd mail-notify-service
npm install
```

2. 配置邮件服务：
   - 复制配置文件模板：
   ```bash
   cp config/default.example.json config/default.json
   ```
   - 编辑 `config/default.json`，填入你的 QQ 邮箱配置：
   ```json
   {
     "email": {
       "host": "smtp.qq.com",
       "port": 465,
       "secure": true,
       "auth": {
         "user": "your_qq_email@qq.com",
         "pass": "your_authorization_code"
       }
     }
   }
   ```
   > 注意：需要在 QQ 邮箱设置中开启 SMTP 服务并获取授权码

3. 初始化数据库：
```bash
npx prisma migrate dev
```

### 运行

#### 本地开发
```bash
npm run dev
```

#### 生产环境
```bash
npm start
```

#### 使用 Docker
```bash
git clone https://github.com/Particaly/mail-notify-service.git

cd mail-notify-service

docker-compose up -d
```

### 访问

服务启动后，访问 http://localhost:3000

首次访问时需要创建管理员账号。

## 使用说明

### Webhook 配置

在 Web 界面中可以创建新的 Webhook 配置，包括：
- 配置名称
- 收件人
- 发件人
- 邮件主题
- 邮件内容

### 模板变量

支持在配置中使用以下模板变量：
- `${headers.x-custom-header}` - 获取请求头的值
- `${query.name}` - 获取 URL 查询参数
- `${body.email}` - 获取请求体中的值
- `${params.id}` - 获取 URL 路径参数

示例配置：
```json
{
  "name": "动态通知",
  "to": "${body.email}",
  "from": "系统通知 <your_qq_email@qq.com>",
  "subject": "来自 ${headers.x-sender} 的通知",
  "content": "你好 ${query.name}，\n\n${body.message}"
}
```

### 触发 Webhook

可以通过 HTTP POST 请求触发 Webhook：

```bash
curl -X POST "http://localhost:3000/api/webhook/<webhook-id>/trigger?name=张三" \
  -H "x-sender: 系统" \
  -H "Content-Type: application/json" \
  -d '{"email": "recipient@example.com", "message": "这是一条测试消息"}'
```

## Docker 部署

1. 构建并启动服务：
```bash
docker-compose up -d
```

2. 查看日志：
```bash
docker-compose logs -f
```

## 项目结构
```
.
├── config/                 # 配置文件
├── prisma/                 # 数据库模型和迁移
├── public/                 # 静态文件
│   ├── index.html          # 主页面
│   ├── login.html          # 登录页面
│   └── js/                 # JavaScript 文件
├── routes/                 # 路由处理
├── services/               # 业务逻辑
├── app.js                  # 应用入口
└── package.json            # 项目配置
```

## 开发

### 数据库迁移

创建新的迁移：
```bash
npx prisma migrate dev --name <migration-name>
```

### 环境变量

主要配置位于 `config/default.json`，包括：
- SMTP 服务器配置
- 邮箱账号和授权码

## 许可证

[MIT](LICENSE)

