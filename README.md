# 💕 我们的回忆录 - MkDocs版本

基于MkDocs的回忆记录系统，支持快速部署和双人协作上传。

## ✨ 功能特点

- 📝 **简单易用** - 通过网页表单上传回忆
- 🖼️ **图片支持** - 支持上传多张图片（最多10张）
- 🚀 **快速部署** - 一键部署到GitHub Pages/Netlify/Vercel
- 👫 **双人协作** - 两人都可以上传记录
- 📱 **响应式设计** - 手机和电脑都能完美显示
- 🎨 **美观主题** - Material主题，温馨浪漫
- 🔄 **自动构建** - 上传后自动生成Markdown并构建站点

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装Node.js依赖
npm install

# 安装Python依赖（MkDocs）
pip install -r requirements.txt
```

或使用一键安装：
```bash
npm run install-all
```

### 2. 构建站点

```bash
npm run mkdocs:build
```

### 3. 启动开发服务器

```bash
npm run dev
```

这会同时启动：
- **后端API服务器**：http://localhost:3001
- **MkDocs开发服务器**：http://localhost:8000

### 4. 访问系统

- **回忆录网站**：http://localhost:8000
- **上传页面**：http://localhost:3001/upload

## 📁 项目结构

```
recall/
├── docs/                  # Markdown源文件
│   ├── memories/         # 回忆文件（自动生成）
│   ├── images/           # 图片文件
│   ├── index.md          # 首页
│   └── about.md          # 关于页
├── site/                 # MkDocs构建输出（自动生成）
├── server/               # 后端API
│   ├── index.js         # 服务器入口
│   └── routes/
│       └── upload.js    # 上传路由
├── upload.html           # 上传页面
├── mkdocs.yml           # MkDocs配置
├── package.json         # Node.js依赖
└── requirements.txt     # Python依赖
```

## 📝 使用说明

### 上传回忆

1. 访问 http://localhost:3001/upload
2. 填写回忆信息：
   - 标题（必填）
   - 日期（必填）
   - 记录人（可选）
   - 内容（可选）
   - 上传图片（可选，最多10张）
3. 点击"保存回忆"
4. 系统会自动：
   - 生成Markdown文件到 `docs/memories/`
   - 保存图片到 `docs/images/`
   - 重新构建MkDocs站点

### 查看回忆

访问 http://localhost:8000 查看生成的回忆录网站。

## 🌐 部署上线

### 最简单：GitHub Pages（推荐）

1. 推送代码到GitHub
2. 启用GitHub Actions（已配置）
3. 启用GitHub Pages
4. 访问：`https://你的用户名.github.io/recall/`

**详细步骤请查看 [部署指南.md](部署指南.md)**

### 其他部署方式

- **Netlify** - 免费、快速、支持表单
- **Vercel** - 免费、全球CDN
- **自建服务器** - 完全控制

所有详细步骤都在 [部署指南.md](部署指南.md) 中。

## 🛠️ 技术栈

- **MkDocs** - 静态站点生成器
- **Material主题** - 美观的UI设计
- **Node.js + Express** - 后端API
- **Markdown** - 内容格式

## 📖 文档

- [部署指南.md](部署指南.md) - 详细的部署方案（5种方式）
- [快速开始.md](快速开始.md) - 快速上手指南

## 📄 许可证

MIT License

---

💕 愿你们的回忆永远美好！

