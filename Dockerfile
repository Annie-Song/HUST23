FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install --production

# 复制源代码
COPY . .

# 创建必要的目录
RUN mkdir -p logs uploads

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=5000

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["node", "src/app.js"] 