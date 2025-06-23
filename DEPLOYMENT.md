# Vercel 部署指南

## 🚀 快速部署

### 1. 准备工作

确保你已经：
- 创建了 GitHub 账户
- 创建了 Vercel 账户
- （可选）创建了 Supabase 项目

### 2. 推送代码到 GitHub

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Sky coaching system"

# 添加远程仓库
git remote add origin https://github.com/your-username/sky-coaching-system.git

# 推送到 GitHub
git push -u origin main
```

### 3. 在 Vercel 中导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择你的 GitHub 仓库
4. Vercel 会自动检测到这是一个 Next.js 项目
5. 点击 "Deploy"

### 4. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量

```env
# Supabase 配置（如果使用真实数据库）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 可选：服务角色密钥（仅在服务端使用）
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 站点 URL（用于 CORS 和安全配置）
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

#### 可选的环境变量

```env
# 管理员认证密钥（生产环境建议使用）
ADMIN_JWT_SECRET=your_jwt_secret_key

# 数据库连接（如果使用其他数据库）
DATABASE_URL=your_database_connection_string

# 邮件服务配置（如果需要通知功能）
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### 5. 域名配置（可选）

如果你有自定义域名：

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS 记录

## 🔧 高级配置

### 自动部署

Vercel 已经自动配置了 CI/CD：
- 每次推送到 `main` 分支都会触发生产部署
- 每次推送到其他分支都会创建预览部署
- Pull Request 会自动创建预览环境

### 环境分离

建议创建不同的环境：

1. **开发环境** (`development`)
   - 分支：`develop`
   - 使用测试数据库

2. **预发布环境** (`preview`)
   - 分支：`staging`
   - 使用预发布数据库

3. **生产环境** (`production`)
   - 分支：`main`
   - 使用生产数据库

### 性能优化

Vercel 自动提供：
- 全球 CDN
- 自动图片优化
- 边缘函数
- 自动缓存

### 监控和分析

在 Vercel Dashboard 中可以查看：
- 部署状态
- 性能指标
- 错误日志
- 访问统计

## 🛠️ 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 本地测试构建
   npm run build
   ```

2. **环境变量未生效**
   - 确保变量名正确
   - 重新部署项目

3. **API 路由 404**
   - 检查文件路径是否正确
   - 确保文件导出了正确的 HTTP 方法

4. **数据库连接失败**
   - 检查 Supabase URL 和密钥
   - 确保数据库表已创建

### 调试技巧

1. **查看构建日志**
   - 在 Vercel Dashboard 的 "Functions" 标签页查看

2. **查看运行时日志**
   - 使用 `console.log` 输出调试信息
   - 在 Vercel Dashboard 的 "Functions" 标签页查看实时日志

3. **本地调试**
   ```bash
   # 安装 Vercel CLI
   npm i -g vercel
   
   # 本地运行（模拟 Vercel 环境）
   vercel dev
   ```

## 📊 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 客户选择页面正常显示
- [ ] 管理后台可以访问
- [ ] API 接口正常工作
- [ ] 数据库连接正常
- [ ] 移动端显示正常
- [ ] 所有功能测试通过

## 🔒 安全建议

1. **环境变量安全**
   - 不要在代码中硬编码敏感信息
   - 使用 Vercel 的环境变量功能

2. **API 安全**
   - 实施速率限制
   - 验证输入数据
   - 使用 HTTPS

3. **数据库安全**
   - 启用 Row Level Security (RLS)
   - 定期备份数据
   - 监控异常访问

## 📞 支持

如果遇到问题：
1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 查看 [Next.js 文档](https://nextjs.org/docs)
3. 查看项目的 GitHub Issues
