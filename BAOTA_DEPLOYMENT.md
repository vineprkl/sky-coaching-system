# Sky 代练管理系统 - 宝塔面板部署指南

## 📋 系统要求

- **服务器**: Linux 服务器（推荐 Ubuntu 20.04+）
- **宝塔面板**: 7.7.0+
- **Node.js**: 18.0+
- **MySQL**: 5.7+ 或 8.0+
- **内存**: 最少 1GB RAM

## 🚀 部署步骤

### 1. 准备宝塔环境

1. **安装宝塔面板**
   ```bash
   wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
   ```

2. **安装必要软件**
   - 在宝塔面板中安装：
     - MySQL 8.0
     - Node.js 18+
     - PM2 管理器

### 2. 创建数据库

1. **在宝塔面板中创建数据库**
   - 数据库名: `sky_coaching`
   - 用户名: `sky_user`
   - 密码: 设置一个强密码

2. **记录数据库连接信息**
   ```
   数据库地址: localhost
   端口: 3306
   数据库名: sky_coaching
   用户名: sky_user
   密码: [你设置的密码]
   ```

### 3. 上传项目文件

1. **下载项目代码**
   ```bash
   git clone https://github.com/vineprkl/sky-coaching-system.git
   cd sky-coaching-system
   ```

2. **上传到服务器**
   - 将项目文件上传到 `/www/wwwroot/sky-coaching-system/`

### 4. 配置环境变量

1. **创建 `.env.local` 文件**
   ```bash
   cd /www/wwwroot/sky-coaching-system/
   cp .env.example .env.local
   ```

2. **编辑 `.env.local` 文件**
   ```env
   # MySQL 数据库配置
   DATABASE_URL="mysql://sky_user:你的密码@localhost:3306/sky_coaching"
   ```

### 5. 安装依赖和初始化数据库

1. **安装 Node.js 依赖**
   ```bash
   npm install
   ```

2. **生成 Prisma 客户端**
   ```bash
   npx prisma generate
   ```

3. **创建数据库表**
   ```bash
   npx prisma db push
   ```

### 6. 构建项目

```bash
npm run build
```

### 7. 配置 PM2

1. **创建 PM2 配置文件 `ecosystem.config.js`**
   ```javascript
   module.exports = {
     apps: [{
       name: 'sky-coaching-system',
       script: 'npm',
       args: 'start',
       cwd: '/www/wwwroot/sky-coaching-system',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   ```

2. **启动应用**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### 8. 配置 Nginx 反向代理

1. **在宝塔面板中添加站点**
   - 域名: 你的域名（如 `sky.yourdomain.com`）
   - 根目录: `/www/wwwroot/sky-coaching-system`

2. **配置 Nginx**
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
   }
   ```

### 9. 配置 SSL 证书（可选）

在宝塔面板中为你的域名申请并配置 SSL 证书。

## 🔧 维护命令

### 查看应用状态
```bash
pm2 status
pm2 logs sky-coaching-system
```

### 重启应用
```bash
pm2 restart sky-coaching-system
```

### 更新应用
```bash
cd /www/wwwroot/sky-coaching-system
git pull origin main
npm install
npm run build
pm2 restart sky-coaching-system
```

### 数据库迁移
```bash
npx prisma db push
```

## 🛡️ 安全建议

1. **定期备份数据库**
2. **使用强密码**
3. **定期更新系统和软件**
4. **配置防火墙规则**
5. **监控系统资源使用情况**

## 📞 技术支持

如果在部署过程中遇到问题，请检查：

1. **日志文件**: `pm2 logs sky-coaching-system`
2. **数据库连接**: 确保 DATABASE_URL 配置正确
3. **端口占用**: 确保 3000 端口未被占用
4. **权限问题**: 确保文件权限正确

## 🎯 访问系统

部署完成后，访问你的域名即可使用系统：

- **管理后台**: `https://yourdomain.com/admin`
- **客户端**: `https://yourdomain.com/client`

默认管理员密码: `admin123`（首次登录后请及时修改）

## 🔄 从 Supabase 迁移到 MySQL

如果你之前使用的是 Supabase 版本，现在想迁移到 MySQL：

1. **备份现有数据**
2. **按照上述步骤部署 MySQL 版本**
3. **手动导入数据**（如果需要）

## 📊 性能优化

1. **启用 Gzip 压缩**
2. **配置静态文件缓存**
3. **使用 CDN**（可选）
4. **监控数据库性能**
