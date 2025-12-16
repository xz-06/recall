# ⚡ Vercel Functions快速配置指南

## 🎯 配置步骤（5步）

### 步骤1：安装依赖 ✅

已自动添加到 `package.json`，运行：

```bash
npm install
```

### 步骤2：创建GitHub Token 🔑

1. 访问：https://github.com/settings/tokens
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 设置名称：`recall-vercel`
4. 选择权限：勾选 **`repo`**（完整仓库访问权限）
5. 点击 **"Generate token"**
6. **复制token**（只显示一次！）

### 步骤3：在Vercel中配置环境变量 ⚙️

1. 访问：https://vercel.com/dashboard
2. 选择项目：`recall`
3. 进入 **Settings** → **Environment Variables**
4. 添加环境变量：
   ```
   Name: GITHUB_TOKEN
   Value: 你的GitHub Token（粘贴刚才复制的）
   Environment: Production, Preview, Development（全选）
   ```
5. 点击 **Save**

### 步骤4：更新仓库信息（如果需要）📝

如果仓库名或用户名不同，修改 `api/upload.js`：

找到这两行（第81-82行）：
```javascript
owner: 'xz-06',  // 改为你的GitHub用户名
repo: 'recall',  // 改为你的仓库名
```

### 步骤5：部署 🚀

```bash
git add api/ package.json vercel.json upload.html
git commit -m "配置Vercel Functions API"
git push origin main
```

Vercel会自动部署Functions。

## ✅ 验证配置

部署完成后：

1. **访问上传页面**：
   ```
   https://recall-self.vercel.app/upload
   ```

2. **测试上传**：
   - 填写标题、日期、内容
   - 上传图片（可选）
   - 点击保存

3. **检查GitHub仓库**：
   - 访问：https://github.com/xz-06/recall
   - 查看 `docs/memories/` 目录
   - 应该能看到新添加的Markdown文件

## 🔍 测试API

```bash
# 测试上传API
curl -X POST https://recall-self.vercel.app/api/upload \
  -F "title=测试回忆" \
  -F "date=2024-12-17" \
  -F "content=这是一条测试回忆"
```

## ⚠️ 重要提示

### 限制说明

1. **执行时间**：10秒（免费版）
   - 如果上传多个大图片可能超时
   - 建议单次上传不超过3-5张图片

2. **文件大小**：50MB（免费版）
   - 单张图片建议不超过10MB

3. **文件系统**：只读
   - 文件通过GitHub API保存
   - 需要配置GITHUB_TOKEN

### 图片上传

- 图片会自动上传到 `docs/images/` 目录
- 通过GitHub API保存
- 需要GITHUB_TOKEN配置

## 🆘 常见问题

### Q: 上传后文件没有保存到GitHub？

A: 
1. 检查GITHUB_TOKEN是否正确配置
2. 检查仓库名和用户名是否正确
3. 查看Vercel Functions日志

### Q: 上传超时？

A: 
- 减少图片数量
- 压缩图片大小
- 考虑使用Railway/Render部署完整后端

### Q: CORS错误？

A: 
- 检查API地址是否正确
- 确认CORS头已设置

## 📚 相关文档

- **详细配置**：查看 `Vercel Functions配置指南.md`
- **其他方案**：查看 `部署后端说明.md`

---

💕 配置完成后，上传功能就可以正常使用了！

