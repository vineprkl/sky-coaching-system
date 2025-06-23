# Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并注册账户
2. 点击 "New Project" 创建新项目
3. 选择组织，输入项目名称（如：sky-coaching-system）
4. 设置数据库密码（请记住这个密码）
5. 选择地区（建议选择离你最近的地区）
6. 点击 "Create new project"

## 2. 获取项目配置信息

项目创建完成后：

1. 在项目仪表板中，点击左侧菜单的 "Settings"
2. 选择 "API" 标签
3. 复制以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...` (很长的字符串)

## 3. 配置环境变量

1. 在项目根目录创建 `.env.local` 文件
2. 复制 `.env.example` 的内容到 `.env.local`
3. 填入你的 Supabase 配置信息：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. 创建数据库表

1. 在 Supabase 仪表板中，点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制 `database-schema.sql` 文件中的所有内容
4. 粘贴到 SQL 编辑器中
5. 点击 "Run" 执行 SQL

这将创建：
- `clients` 表（客户信息）
- `daily_records` 表（每日代练记录）
- 必要的索引和约束
- 示例数据
- 自动更新时间戳的触发器

## 5. 验证设置

执行 SQL 后，你可以：

1. 点击左侧菜单的 "Table Editor"
2. 查看 `clients` 和 `daily_records` 表
3. 确认示例数据已经插入

## 6. 安全设置（可选）

当前配置使用了宽松的 RLS 策略以便开发。在生产环境中，你可能需要：

1. 设置更严格的 Row Level Security 策略
2. 配置用户认证
3. 限制 API 访问权限

## 7. 本地开发

设置完成后，重启你的开发服务器：

```bash
npm run dev
```

现在应用将连接到 Supabase 数据库而不是使用模拟数据。

## 故障排除

### 连接问题
- 确认 `.env.local` 文件在项目根目录
- 检查环境变量名称是否正确
- 确认 Supabase URL 和密钥没有多余的空格

### 数据库问题
- 确认 SQL 脚本执行成功
- 检查 Supabase 仪表板中的表是否创建
- 查看 Supabase 日志中的错误信息

### 权限问题
- 确认 RLS 策略已正确设置
- 检查 API 密钥权限
