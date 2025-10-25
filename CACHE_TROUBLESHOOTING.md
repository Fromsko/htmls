# 🔧 GitHub Actions 缓存问题排查指南

## 📌 问题：CI 中的代码总是旧的

当你发现 GitHub Actions 中运行的是旧代码或旧的截图时，问题通常是：

1. ❌ `actions/checkout@v4` 使用了 Git 缓存
2. ❌ 工作目录没有被正确清理
3. ❌ GitHub Actions 使用了过期的 runner 缓存

## ✅ 解决方案

### 1️⃣ **工作流配置修复**（已在 workflow 中应用）

```yaml
# ✅ 正确的 checkout 配置
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    fetch-depth: 0  # 获取完整历史记录，不使用浅克隆
    clean: true     # 确保工作目录干净，删除未跟踪的文件
```

**关键参数说明：**
- `fetch-depth: 0` - 获取所有历史记录，避免浅克隆问题
- `clean: true` - 清理工作目录，确保没有旧文件

### 2️⃣ **验证 checkout（已添加调试步骤）**

```yaml
- name: Verify checkout
  run: |
    echo "📋 当前提交: $(git rev-parse HEAD)"
    echo "📋 当前分支: $(git rev-parse --abbrev-ref HEAD)"
    echo "📋 最后提交信息: $(git log -1 --pretty=%B)"
    echo "📋 index.html 最后修改: $(git log -1 --format=%ai -- index.html)"
```

这样可以在 GitHub Actions 日志中看到实际检出的代码版本。

### 3️⃣ **强制清除 GitHub Actions 缓存**

如果问题仍然存在，可以手动清除 GitHub Actions 缓存：

**方法 A：通过 GitHub 页面**
1. 打开你的仓库
2. 进入 `Settings` → `Actions` → `General`
3. 向下滚动到 `Actions` 部分
4. 点击 `Clear all caches`

**方法 B：通过 GitHub CLI**
```bash
# 安装 GitHub CLI（如果没有）
# https://cli.github.com/

# 列出所有缓存
gh actions-cache list -R Fromsko/htmls

# 删除特定缓存
gh actions-cache delete "Linux-bun-<hash>" -R Fromsko/htmls --confirm

# 删除所有缓存
gh actions-cache list -R Fromsko/htmls | cut -f1 | xargs -I {} gh actions-cache delete {} -R Fromsko/htmls --confirm
```

### 4️⃣ **手动触发工作流**

```bash
# 使用 GitHub CLI 手动触发
gh workflow run screenshot.yml -R Fromsko/htmls

# 或在 GitHub 页面上：
# 1. Actions → Playwright Screenshot Update
# 2. "Run workflow" 按钮
```

## 🔍 诊断步骤

### 检查 1：验证本地代码
```bash
# 确保本地代码是最新的
git status
git log -1 --oneline

# 查看 index.html 的最后修改时间
git log -1 --format=%ai -- index.html
```

### 检查 2：查看 GitHub Actions 日志

在 GitHub 页面上查看工作流运行：
1. 打开你的仓库
2. 进入 `Actions` 标签
3. 找到最新的 `Playwright Screenshot Update` 运行
4. 检查 `Verify checkout` 步骤输出

**你应该看到类似的输出：**
```
📋 当前提交: abc1234567890def
📋 当前分支: main
📋 最后提交信息: chore: 自动更新截图和时间戳 [skip ci]
📋 index.html 最后修改: 2025-10-25 10:30:45 +0000
```

### 检查 3：查看文件变更检测

在 `Check for changes` 步骤中，你应该看到：
```
📝 检测到文件变更:
screenshots/index-full.jpg
screenshots/chat-full.jpg
README.md
```

## 🚨 常见问题

### 问题 1：README.md 没有更新

**原因：**
- 代码缓存导致 `index.html` 没有变化
- 所以 Playwright 截图没有变化
- README 也就没有更新

**解决：**
1. 清除 GitHub Actions 缓存
2. 手动编辑 `index.html`（比如加一个空格）
3. 推送代码，触发新的工作流运行

### 问题 2：截图始终是旧的

**原因：**
- Playwright 看到的 `index.html` 是旧版本
- 或者 `index.html` 本身没有变化（缓存了）

**解决：**
```bash
# 本地测试
bun test

# 查看 index.html 内容
head -50 index.html

# 推送最新代码
git add -A
git commit -m "chore: 强制更新"
git push

# 在 GitHub Actions 页面手动运行工作流
```

### 问题 3：即使清除缓存仍然是旧代码

**原因：**
- GitHub Actions runner 本身缓存了代码
- 或者 `actions/checkout` 配置不正确

**终极解决方案：**
```yaml
# 在工作流中强制清理
- name: Force clean checkout
  run: |
    rm -rf .git
    git init
    git remote add origin https://github.com/Fromsko/htmls.git
    git fetch --depth=1 origin main
    git checkout FETCH_HEAD
```

但通常不需要这么做，修改 checkout 配置就够了。

## 📋 完整检查清单

- ✅ `checkout@v4` 使用了 `fetch-depth: 0` 和 `clean: true`
- ✅ 工作流中有 `Verify checkout` 步骤用于调试
- ✅ 检查日志中的实际提交 ID 是否正确
- ✅ `Check for changes` 步骤显示了文件变更
- ✅ README.md 在 commit 消息中被提交
- ✅ 如果都正确但仍有问题，清除 GitHub Actions 缓存

## 🎯 快速修复流程

如果 README.md 没有更新：

```bash
# 步骤 1: 本地验证
bun test
cat README.md | tail -5

# 步骤 2: 强制更新时间戳
bun scripts/update-timestamp.js

# 步骤 3: 推送代码
git add -A
git commit -m "chore: 强制更新时间戳和截图"
git push

# 步骤 4: 清除 CI 缓存（可选）
gh actions-cache list -R Fromsko/htmls | cut -f1 | xargs -I {} gh actions-cache delete {} -R Fromsko/htmls --confirm

# 步骤 5: 在 GitHub 页面手动运行工作流
# Actions → Playwright Screenshot Update → Run workflow
```

## 🔗 参考资源

- [GitHub Actions Checkout Action](https://github.com/actions/checkout)
- [GitHub Actions Caching](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [GitHub CLI](https://cli.github.com/)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**记住：** 主要问题通常是 `checkout` 配置。如果使用了 `fetch-depth: 0` 和 `clean: true`，99% 的问题都能解决！
