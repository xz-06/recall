# 🔑 SSH配置完整步骤

## ⚠️ 重要提示

在 `ssh-keygen` 提示时：
- **Enter file in which to save the key**: 直接按 **Enter**（使用默认路径）
- **Enter passphrase**: 直接按 **Enter**（不设置密码）

**不要输入命令！**

---

## 📋 完整步骤

### 步骤1：生成SSH密钥

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

**提示时**：
1. `Enter file in which to save the key`: **直接按Enter**
2. `Enter passphrase`: **直接按Enter**（不设置密码）
3. `Enter same passphrase again`: **直接按Enter**

### 步骤2：查看公钥

```bash
cat ~/.ssh/id_ed25519.pub
```

**复制输出的全部内容**（以 `ssh-ed25519` 开头，以你的邮箱结尾）

### 步骤3：添加到GitHub

1. 访问：https://github.com/settings/keys
2. 点击 **"New SSH key"**
3. **Title**: `recall-project`（或任意名称）
4. **Key**: 粘贴刚才复制的公钥
5. 点击 **"Add SSH key"**

### 步骤4：测试SSH连接

```bash
ssh -T git@github.com
```

应该看到：
```
Hi xz-06! You've successfully authenticated, but GitHub does not provide shell access.
```

### 步骤5：修改远程地址为SSH

```bash
git remote set-url origin git@github.com:xz-06/recall.git
```

### 步骤6：验证远程地址

```bash
git remote -v
```

应该显示：
```
origin  git@github.com:xz-06/recall.git (fetch)
origin  git@github.com:xz-06/recall.git (push)
```

### 步骤7：推送代码

```bash
git push origin main
```

---

## 🔧 如果之前输入错误

如果之前在 `ssh-keygen` 中输入了错误内容：

1. **按 Ctrl+C 取消当前操作**
2. **重新运行**：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
3. **这次直接按Enter**，不要输入任何内容

---

## ✅ 验证配置

配置完成后，运行：

```bash
# 测试SSH连接
ssh -T git@github.com

# 应该看到成功消息
```

然后推送：

```bash
git push origin main
```

---

💕 记住：在ssh-keygen提示时，直接按Enter使用默认值！

