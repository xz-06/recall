# 🔧 Vercel部署问题解决

## 错误：Command exited with 127

**原因**：Vercel找不到 `pip` 命令，需要使用 `python3 -m pip`

## ✅ 解决方案

### 方案1：更新vercel.json（已修复）

已更新 `vercel.json`，使用 `python3 -m pip` 代替 `pip`：

```json
{
  "buildCommand": "python3 -m pip install --user -r requirements.txt && python3 -m mkdocs build",
  "outputDirectory": "site",
  "devCommand": "python3 -m mkdocs serve",
  "installCommand": "python3 -m pip install --user -r requirements.txt"
}
```

### 方案2：使用Vercel Dashboard配置

如果方案1不行，在Vercel Dashboard中配置：

1. 访问：https://vercel.com/dashboard
2. 选择你的项目：`recall`
3. 进入 **Settings** → **General**
4. 找到 **Build & Development Settings**
5. 设置：
   - **Build Command**: `python3 -m pip install --user -r requirements.txt && python3 -m mkdocs build`
   - **Output Directory**: `site`
   - **Install Command**: `python3 -m pip install --user -r requirements.txt`

6. 在 **Environment Variables** 中添加：
   ```
   PYTHON_VERSION = 3.9
   ```

### 方案3：使用build.sh脚本

创建 `build.sh`：

```bash
#!/bin/bash
python3 -m pip install --user -r requirements.txt
python3 -m mkdocs build
```

然后修改 `vercel.json`：

```json
{
  "buildCommand": "bash build.sh",
  "outputDirectory": "site"
}
```

## 🔄 重新部署

更新配置后，重新部署：

```bash
vercel --prod
```

或者推送代码到GitHub（如果已连接），Vercel会自动重新部署。

## 📝 其他可能的问题

### 问题1：Python版本不对

**解决**：在Vercel Dashboard的Environment Variables中添加：
```
PYTHON_VERSION = 3.9
```

### 问题2：依赖安装失败

**解决**：
1. 检查 `requirements.txt` 格式是否正确
2. 尝试使用 `--user` 标志（已添加）
3. 查看Vercel构建日志定位具体错误

### 问题3：MkDocs命令找不到

**解决**：使用 `python3 -m mkdocs` 代替 `mkdocs`

## ✅ 验证部署

部署成功后：
1. 访问Vercel提供的地址
2. 检查网站是否正常显示
3. 查看Vercel Dashboard的构建日志确认无错误

---

💕 如果还有问题，查看Vercel Dashboard的构建日志获取详细错误信息！

