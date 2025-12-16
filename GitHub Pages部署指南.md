# 🌐 GitHub Pages部署指南（支持上传功能）

## ✅ 方案说明

GitHub Pages只支持静态站点，但我们可以使用**GitHub API**直接在浏览器中实现上传功能，无需后端服务器！

**优点**：
- ✅ 完全免费
- ✅ 无需后端服务器
- ✅ 自动HTTPS
- ✅ 全球CDN加速
- ✅ 支持自定义域名

---

## 📋 部署步骤

### 步骤1：启用GitHub Pages

1. **访问仓库设置**：
   - 打开：https://github.com/xz-06/recall/settings/pages

2. **配置GitHub Pages**：
   - Source: 选择 `gh-pages` 分支
   - Folder: 选择 `/ (root)`
   - 点击 Save

3. **等待部署完成**（约1-2分钟）

4. **访问网站**：
   ```
   https://xz-06.github.io/recall/
   ```

---

### 步骤2：配置上传页面

1. **复制上传页面**：
   ```bash
   cp upload-github-pages.html upload.html
   ```

2. **或者直接使用**：
   - 将 `upload-github-pages.html` 重命名为 `upload.html`
   - 或修改 `docs/index.md` 中的链接指向 `upload-github-pages.html`

3. **确保上传页面被部署**：
   - 将 `upload.html` 或 `upload-github-pages.html` 复制到 `site/` 目录
   - 或在 `mkdocs.yml` 中配置静态文件

---

### 步骤3：更新GitHub Actions工作流

确保 `.github/workflows/deploy.yml` 正确配置：

```yaml
name: Deploy MkDocs to GitHub Pages

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.x'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      
      - name: Build MkDocs site
        run: mkdocs build
      
      - name: Copy upload page
        run: |
          cp upload-github-pages.html site/upload.html
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./site
          cname: false
```

---

### 步骤4：更新首页链接

修改 `docs/index.md`，确保上传链接正确：

```markdown
[上传新回忆 :material-plus-circle:](/upload){ .md-button .md-button--primary }
```

---

### 步骤5：更新配置脚本

修改 `docs/js/config.js`，检测GitHub Pages环境：

```javascript
// 检测是否为GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');

if (isGitHubPages) {
    // GitHub Pages：使用相对路径
    UPLOAD_URL = '/upload';
} else if (isProduction) {
    // Vercel部署：使用当前域名
    UPLOAD_URL = window.location.origin + '/upload';
} else {
    // 本地开发
    UPLOAD_URL = 'http://localhost:3001/upload';
}
```

---

## 🔑 使用说明

### 首次使用上传功能

1. **访问上传页面**：
   ```
   https://xz-06.github.io/recall/upload
   ```

2. **配置GitHub Token**：
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 名称：`recall-upload`
   - 权限：勾选 `repo`（完整仓库访问权限）
   - 点击 "Generate token"
   - **复制Token**（只显示一次！）

3. **填写表单**：
   - GitHub Token：粘贴刚才复制的Token
   - GitHub用户名：`xz-06`
   - 仓库名：`recall`
   - 标题、日期、内容等

4. **上传**：
   - Token会保存在浏览器本地（localStorage）
   - 下次使用时自动填充
   - 上传成功后自动跳转到首页

---

## 🔒 安全说明

### Token安全

- ✅ Token保存在浏览器本地（localStorage）
- ✅ Token不会上传到任何服务器
- ✅ 只用于调用GitHub API
- ⚠️ 建议定期更换Token
- ⚠️ 如果Token泄露，立即在GitHub上撤销

### 权限建议

- ✅ 只授予 `repo` 权限（最小权限原则）
- ✅ Token设置过期时间（建议90天）
- ✅ 定期检查Token使用情况

---

## 📋 文件说明

### `upload-github-pages.html`

- 纯前端上传页面
- 使用GitHub API直接上传文件
- 支持图片上传
- 自动保存配置到localStorage

### 与Vercel版本的区别

| 特性 | GitHub Pages版本 | Vercel版本 |
|------|----------------|-----------|
| 后端服务器 | ❌ 不需要 | ✅ Vercel Functions |
| GitHub Token | 保存在浏览器 | 保存在Vercel环境变量 |
| 配置方式 | 每次使用需输入 | 自动配置 |
| 安全性 | 中等（客户端Token） | 高（服务器端Token） |

---

## 🧪 测试步骤

1. **部署到GitHub Pages**
   ```bash
   git add .
   git commit -m "配置GitHub Pages部署"
   git push origin main
   ```

2. **等待GitHub Actions完成**（约2-5分钟）

3. **访问网站**：
   ```
   https://xz-06.github.io/recall/
   ```

4. **测试上传**：
   - 访问上传页面
   - 配置GitHub Token
   - 填写表单并上传
   - 检查GitHub仓库是否新增文件

---

## ⚠️ 注意事项

1. **首次使用需要配置Token**：
   - 用户需要自己创建GitHub Token
   - Token需要 `repo` 权限

2. **Token安全**：
   - Token保存在浏览器本地
   - 建议定期更换Token
   - 不要在公共电脑上使用

3. **文件大小限制**：
   - GitHub API限制：单个文件最大100MB
   - 建议图片单张不超过10MB

4. **上传速度**：
   - 取决于网络速度
   - 多张图片会依次上传，可能需要一些时间

---

## 🎯 推荐方案对比

### 方案1：GitHub Pages（当前方案）

**优点**：
- ✅ 完全免费
- ✅ 无需后端服务器
- ✅ 简单易用

**缺点**：
- ⚠️ 需要用户自己配置Token
- ⚠️ Token保存在客户端（安全性较低）

### 方案2：Vercel（之前方案）

**优点**：
- ✅ Token保存在服务器（安全性高）
- ✅ 用户无需配置Token
- ✅ 自动处理

**缺点**：
- ⚠️ 需要Vercel账号
- ⚠️ 需要配置环境变量

---

💕 **现在你可以选择使用GitHub Pages部署，完全免费且支持上传功能！**

