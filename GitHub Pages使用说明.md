# 📖 GitHub Pages 使用说明

## ✅ 已完成的修复

代码已经更新，现在**完全支持 GitHub Pages**！当检测到你在使用 GitHub Pages 时，会自动从 GitHub API 直接获取回忆数据。

## 🔧 工作原理

### 对于 GitHub Pages：
- ✅ 自动检测 GitHub Pages 环境
- ✅ 直接从 GitHub API 获取回忆列表（无需服务器）
- ✅ 适用于**公开仓库**（无需 Token）
- ✅ 自动解析 Markdown 文件内容

### 对于 Vercel 或其他部署：
- ✅ 使用服务器端 API（`/api/memories`）
- ✅ 需要配置 `GITHUB_TOKEN` 环境变量

## 📋 重要说明

### 1. 仓库必须是公开的

GitHub API 对于**公开仓库**的读取操作不需要认证。如果你的仓库是私有的，有两种选择：

**选项 A：将仓库设置为公开（推荐）**
1. 访问仓库设置：https://github.com/xz-06/recall/settings
2. 滚动到底部，找到 "Danger Zone"
3. 点击 "Change visibility" → "Make public"

**选项 B：使用 Vercel 部署**
- Vercel 支持服务器端 API，可以使用 `GITHUB_TOKEN` 访问私有仓库
- 参考：`Vercel部署指南.md`

### 2. 配置检查

确保 `docs/js/config.js` 中的 GitHub 配置正确：

```javascript
const GITHUB_CONFIG = {
    owner: 'xz-06',      // 你的 GitHub 用户名
    repo: 'recall',      // 仓库名
    branch: 'main',      // 分支名
    path: 'docs/memories' // 回忆文件路径
};
```

### 3. 文件结构

确保回忆文件存放在正确的位置：
```
docs/
  memories/
    ├── index.md
    ├── by-date.md
    ├── 20251216-1.md
    ├── 20251216-2.md
    └── ...
```

## 🚀 部署步骤

1. **提交代码到 GitHub**
   ```bash
   git add .
   git commit -m "支持 GitHub Pages 直接获取回忆"
   git push origin main
   ```

2. **构建并部署**
   ```bash
   # 构建 MkDocs
   mkdocs build
   
   # 如果使用 GitHub Actions 自动部署，推送后会自动构建
   # 或者手动推送到 gh-pages 分支
   ```

3. **访问你的 GitHub Pages 网站**
   - 通常地址为：`https://xz-06.github.io/recall`
   - 检查回忆是否能正常加载

## 🐛 常见问题

### Q: 显示"访问被拒绝"错误
**A:** 仓库可能是私有的。请将仓库设置为公开，或使用 Vercel 部署。

### Q: 显示"仓库或路径不存在"错误
**A:** 检查 `GITHUB_CONFIG` 中的配置是否正确：
- `owner`: 你的 GitHub 用户名
- `repo`: 仓库名称
- `path`: 回忆文件所在的路径

### Q: 回忆列表为空
**A:** 检查：
1. `docs/memories/` 目录下是否有 `.md` 文件
2. 文件是否已提交到 GitHub
3. 文件格式是否正确（包含标题和日期）

### Q: 日期显示不正确
**A:** 确保 Markdown 文件中包含日期信息：
```markdown
# 回忆标题

**日期**: 2025-12-16
```

## 📝 测试

访问按时间排序页面，应该能看到：
- ✅ 回忆按日期分组显示
- ✅ 每个日期下的回忆列表
- ✅ 点击可以查看详情

如果遇到问题，请检查浏览器控制台的错误信息。

