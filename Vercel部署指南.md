# 🚀 Vercel部署指南

## 快速部署步骤

### 1. 安装Vercel CLI（已完成）

```bash
npm install -g vercel
```

### 2. 登录Vercel（已完成）

```bash
vercel login
```

### 3. 部署项目

#### 首次部署

```bash
vercel --prod
```

**回答提示**：
- `Set up and deploy?` → **yes**
- `Which scope?` → 选择你的账号
- `Link to existing project?` → **no**（首次部署）
- `What's your project's name?` → **recall**
- `In which directory is your code located?` → **./**
- `Want to modify these settings?` → **N**（使用vercel.json配置）

#### 后续部署

```bash
vercel --prod
```

会自动使用之前的配置。

### 4. 获取部署地址

部署完成后，Vercel会显示：
```
✅ Production: https://recall.vercel.app
```

## 📝 配置说明

项目已包含 `vercel.json` 配置文件：

```json
{
  "buildCommand": "pip install -r requirements.txt && mkdocs build",
  "outputDirectory": "site",
  "devCommand": "mkdocs serve",
  "installCommand": "pip install -r requirements.txt"
}
```

**注意**：Vercel会自动检测Python并安装依赖。

## 🔧 常见问题

### Q: 构建失败？

A: 
1. 检查Python版本（Vercel默认使用Python 3.9）
2. 检查requirements.txt是否正确
3. 查看Vercel构建日志

### Q: 如何更新代码？

A: 
```bash
# 修改代码后
git add .
git commit -m "更新内容"
git push origin main

# Vercel会自动重新部署（如果连接了Git）
# 或手动部署
vercel --prod
```

### Q: 如何连接Git自动部署？

A: 
1. 访问 https://vercel.com/dashboard
2. 点击项目 → Settings → Git
3. 连接GitHub仓库
4. 以后推送代码会自动部署

### Q: 如何查看部署日志？

A: 
```bash
# 查看最新部署
vercel logs

# 或访问Vercel Dashboard查看
```

## ⚠️ 重要提示

### Vercel只部署静态站点

Vercel部署的是MkDocs构建的静态站点（`site/`目录），**不包括后端API**。

如果需要上传功能，需要：
1. 前端部署在Vercel（静态站点）
2. 后端部署在Railway/Render（API服务器）

### 配置后端地址

如果使用Vercel部署前端，需要：

1. **修改 `docs/js/config.js`**：
   ```javascript
   const BACKEND_URL = 'https://your-backend.railway.app';
   ```

2. **修改 `upload.html`**：
   ```javascript
   return 'https://your-backend.railway.app';
   ```

3. **提交并推送**：
   ```bash
   git add docs/js/config.js upload.html
   git commit -m "配置Vercel部署的后端地址"
   git push origin main
   ```

## 🎯 推荐方案

### 方案1：Vercel前端 + Railway后端（推荐）

- **前端**：Vercel（免费、全球CDN）
- **后端**：Railway（免费额度）
- **优点**：快速、免费、全球加速

### 方案2：全部Vercel

- **前端**：Vercel（静态站点）
- **后端**：Vercel Functions（Serverless）
- **优点**：统一平台
- **缺点**：Functions有执行时间限制

---

💕 部署完成后，访问你的Vercel地址即可查看网站！

