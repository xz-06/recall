# 🔧 Git推送问题解决

## 错误：Connection was reset

这个错误通常是由网络问题或GitHub连接问题引起的。

## ✅ 解决方案

### 方法1：重试（最简单）

网络问题通常是暂时的，直接重试：

```bash
git push origin main
```

### 方法2：使用SSH代替HTTPS（推荐）

如果HTTPS经常失败，使用SSH更稳定：

#### 步骤1：检查是否已有SSH密钥

```bash
ls ~/.ssh
```

#### 步骤2：如果没有，生成SSH密钥

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

按Enter使用默认设置。

#### 步骤3：添加SSH密钥到GitHub

1. **复制公钥**：
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   复制输出的内容

2. **添加到GitHub**：
   - 访问：https://github.com/settings/keys
   - 点击 **"New SSH key"**
   - Title: `recall-project`
   - Key: 粘贴刚才复制的公钥
   - 点击 **"Add SSH key"**

#### 步骤4：修改远程仓库地址为SSH

```bash
git remote set-url origin git@github.com:xz-06/recall.git
```

#### 步骤5：重新推送

```bash
git push origin main
```

### 方法3：增加缓冲区大小

```bash
git config --global http.postBuffer 524288000
git push origin main
```

### 方法4：使用代理（如果在中国大陆）

如果在中国大陆，可能需要配置代理：

```bash
# 设置HTTP代理（如果有）
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080

# 推送
git push origin main

# 完成后取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 方法5：使用GitHub CLI（备选）

```bash
# 安装GitHub CLI（如果还没有）
# Windows: winget install GitHub.cli
# 或访问: https://cli.github.com

# 登录
gh auth login

# 推送
git push origin main
```

## 🔍 验证连接

### 测试HTTPS连接

```bash
git ls-remote https://github.com/xz-06/recall.git
```

### 测试SSH连接

```bash
ssh -T git@github.com
```

应该看到：`Hi xz-06! You've successfully authenticated...`

## 💡 推荐方案

**最简单**：直接重试几次
```bash
git push origin main
```

**最稳定**：使用SSH（一次配置，长期使用）
```bash
git remote set-url origin git@github.com:xz-06/recall.git
git push origin main
```

## 🆘 如果还是不行

1. **检查网络连接**
   - 确保能访问GitHub
   - 尝试访问：https://github.com

2. **检查Git配置**
   ```bash
   git config --list
   ```

3. **查看详细错误**
   ```bash
   GIT_CURL_VERBOSE=1 GIT_TRACE=1 git push origin main
   ```

4. **使用GitHub Desktop**
   - 下载：https://desktop.github.com
   - 使用GUI界面推送

---

💕 通常重试几次就能成功，或者使用SSH更稳定！

