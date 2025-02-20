# 使用 Node.js 官方镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 添加 edge 仓库并安装 OpenSSL 1.1
RUN apk add --no-cache openssl openssl-dev

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 暴露端口
EXPOSE 3750

# 启动命令
CMD ["npm", "start"] 