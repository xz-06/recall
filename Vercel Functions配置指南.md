# 🚀 Vercel Functions配置指南

## ⚠️ 重要限制

Vercel Functions有以下限制：
- **执行时间**：10秒（免费版）
- **文件大小**：50MB（免费版）
- **文件系统**：只读，无法直接保存文件
- **内存**：1024MB

**这意味着**：直接文件上传和保存需要额外处理（如GitHub API）。

## 📋 配置步骤

### 步骤1：创建API函数

已创建以下文件：
- `api/upload.js` - 上传回忆API
- `api/memories.js` - 获取回忆列表API

### 步骤2：安装依赖

```bash
npm install @octokit/rest busboy
```

已添加到 `package.json`，运行 `npm install` 即可。

### 步骤3：更新vercel.json配置

确保 `vercel.json` 包含：

```json
{
  "buildCommand": "python3 -m pip install --user -r requirements.txt && python3 -m mkdocs build",
  "outputDirectory": "site",
  "functions": {
    "api/*.js": {
      "maxDuration": 10
    }
  }
}
```

### 步骤4：更新前端配置（已自动完成）

`upload.html` 已自动配置：
- 生产环境：使用当前域名（自动指向Vercel Functions）
- 开发环境：使用 `http://localhost:3001`

API调用会自动检测环境并选择正确的端点。

### 步骤5：配置GitHub Token（重要）

为了保存文件到GitHub，需要配置GitHub Personal Access Token：

1. **创建GitHub Token**：
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 设置名称：`recall-vercel`
   - 选择权限：至少勾选 `repo`（完整仓库访问权限）
   - 点击 "Generate token"
   - **复制token**（只显示一次）

2. **在Vercel中配置环境变量**：
   - 访问：https://vercel.com/dashboard
   - 选择项目 `recall`
   - 进入 **Settings** → **Environment Variables**
   - 添加：
     ```
     Name: GITHUB_TOKEN
     Value: 你的GitHub Token
     Environment: Production, Preview, Development（全选）
     ```
   - 点击 **Save**

### 步骤6：部署

```bash
git add api/ package.json vercel.json upload.html
git commit -m "配置Vercel Functions API"
git push origin main
```

Vercel会自动部署Functions。

## 🔧 完整配置示例

### api/upload.js（已创建）

处理文件上传的Serverless函数。

### 更新upload.html

```javascript
// 配置API地址
const API_BASE_URL = (() => {
    // 生产环境：使用Vercel Functions
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return window.location.origin; // 自动使用当前域名
    }
    // 开发环境：使用本地服务器
    return 'http://localhost:3001';
})();

// API调用
const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData
});
```

## ⚠️ 文件保存问题

**重要**：Vercel Functions是只读文件系统，无法直接保存文件到服务器。

### 解决方案1：使用GitHub API（推荐）

需要：
1. GitHub Personal Access Token
2. 使用GitHub API创建/更新文件

示例代码：

```javascript
// 在api/upload.js中使用GitHub API保存文件
const octokit = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

await octokit.repos.createOrUpdateFileContents({
  owner: 'xz-06',
  repo: 'recall',
  path: `docs/memories/${filename}`,
  message: `Add memory: ${title}`,
  content: Buffer.from(markdown).toString('base64')
});
```

### 解决方案2：使用外部存储

- **Cloudinary** - 图片存储
- **Supabase Storage** - 文件存储
- **AWS S3** - 对象存储

### 解决方案3：使用Railway/Render（推荐）

如果文件保存是必需的，建议使用Railway或Render部署完整后端，而不是Vercel Functions。

## 📝 环境变量配置

如果需要使用GitHub API，在Vercel Dashboard中配置：

1. 访问：https://vercel.com/dashboard
2. 选择项目 → **Settings** → **Environment Variables**
3. 添加：
   ```
   GITHUB_TOKEN = your_github_token
   ```

## 🎯 推荐方案

### 方案A：Vercel Functions + GitHub API

**优点**：
- ✅ 统一平台（前端+后端都在Vercel）
- ✅ 免费
- ✅ 全球CDN

**缺点**：
- ⚠️ 需要GitHub API配置
- ⚠️ 有执行时间限制

### 方案B：Vercel前端 + Railway后端（更推荐）

**优点**：
- ✅ 无文件系统限制
- ✅ 可以保存文件
- ✅ 更灵活

**缺点**：
- ⚠️ 需要两个平台

## 🔍 测试API

部署后，测试API：

```bash
# 测试上传API
curl -X POST https://recall-self.vercel.app/api/upload \
  -F "title=测试" \
  -F "date=2024-12-17" \
  -F "content=测试内容"

# 测试获取列表
curl https://recall-self.vercel.app/api/memories
```

## 📚 相关文档

- Vercel Functions文档：https://vercel.com/docs/functions
- GitHub API文档：https://docs.github.com/en/rest

---

💡 **建议**：如果文件保存是核心功能，推荐使用Railway/Render部署完整后端，而不是Vercel Functions。

