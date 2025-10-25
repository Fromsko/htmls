# GitHub Actions 工作流说明

## 📋 Playwright Screenshot Update 工作流

本文件夹包含自动化工作流配置，用于自动运行 Playwright 测试并更新 README。

### 文件说明

- **screenshot.yml**: 主要工作流配置文件

### 工作流配置详情

#### 触发条件

工作流会在以下情况下执行：

1. **手动触发** (`workflow_dispatch`)
   - 在 GitHub Actions 页面手动点击"Run workflow"按钮

2. **定时任务** (`schedule`)
   - 每周一 08:00 UTC 自动运行
   - 对应北京时间：每周一 16:00 (夏令时) 或 17:00 (冬令时)

3. **代码推送** (`push`)
   - 当这些文件有变更时：
     - `index.html`
     - `chat.html`
     - `service-worker.js`
     - `tests/**`
     - `package.json`

#### 环境配置

- **运行环境**: Ubuntu Latest (ubuntu-latest)
- **Node.js 版本**: 18
- **浏览器**: Chromium (通过 Playwright)

#### 工作流步骤

1. **检出代码** (Checkout code)
   - 克隆最新的代码到工作环境

2. **设置 Node.js** (Setup Node.js)
   - 安装 Node.js 18
   - 启用 npm 缓存加速

3. **安装依赖** (Install dependencies)
   - 运行 `npm ci` 安装精确版本的依赖

4. **安装 Playwright 浏览器** (Install Playwright browsers)
   - 下载 Chromium 及其依赖
   - 包含系统依赖 (`--with-deps`)

5. **运行测试** (Run Playwright screenshot tests)
   - 执行 `npm test` 运行所有截图测试
   - 生成 HTML 测试报告

6. **更新 README** (Update README with screenshots)
   - 运行 `node scripts/update-readme.js`
   - 自动将截图集成到 README.md

7. **检查变更** (Check for changes)
   - 检查是否有新的文件或修改
   - 设置 `changes` 输出变量

8. **配置 Git** (Configure Git)
   - 设置 Git 用户信息以提交更改

9. **提交和推送** (Commit and push changes)
   - 创建自动提交
   - 推送到 main 分支
   - 使用 `[skip ci]` 标签避免无限循环

10. **上传测试报告** (Upload test report)
    - 保存 Playwright HTML 报告
    - 保留 30 天

11. **上传截图** (Upload screenshots)
    - 保存生成的截图文件
    - 保留 30 天

12. **工作流总结** (Print summary)
    - 在 GitHub Actions 摘要中显示执行结果

### 权限配置

```yaml
permissions:
  contents: write       # 允许写入代码和提交
  pull-requests: write  # 允许创建 PR 注释
```

### 环境变量

工作流中设置的环境变量：

```
CI: true                            # 标记为 CI 环境
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: 0 # 不跳过浏览器下载
```

### 并发控制

```yaml
concurrency:
  group: screenshot-update      # 并发组名
  cancel-in-progress: true      # 取消进行中的工作流
```

确保同时只有一个工作流运行，避免冲突。

### 构件 (Artifacts)

工作流执行后会生成以下构件：

1. **playwright-report**
   - Playwright 自动生成的 HTML 测试报告
   - 包含详细的测试结果和截图

2. **screenshots**
   - 所有生成的截图文件
   - 按分类组织：index、chat、responsive

构件保留 30 天。

### 故障排除

#### 如果工作流失败

1. **检查工作流日志**
   - 在 GitHub Actions 页面查看详细日志

2. **常见问题**
   - 浏览器下载失败: 检查网络连接
   - 权限错误: 检查 GITHUB_TOKEN 权限
   - 脚本错误: 查看 Node.js 错误信息

3. **本地测试**
   ```bash
   npm test                  # 运行测试
   npm run screenshot        # 更新 README
   ```

### 本地开发

在本地测试工作流的相关功能：

```bash
# 安装依赖
npm install

# 安装 Playwright 浏览器
npx playwright install chromium

# 运行所有测试
npm test

# 运行特定测试
npx playwright test tests/screenshots.spec.js

# 查看测试报告
npx playwright show-report

# 更新 README
node scripts/update-readme.js
```

### 自定义配置

如需修改工作流配置，编辑 `screenshot.yml` 文件：

```yaml
# 修改触发条件
schedule:
  - cron: '0 8 * * 1'  # 修改这里

# 修改浏览器版本
node-version: '18'     # 修改 Node.js 版本

# 修改截图配置
# 编辑 playwright.config.js 文件
```

### 相关文件

- `.github/workflows/screenshot.yml` - 工作流配置
- `playwright.config.js` - Playwright 配置
- `tests/screenshots.spec.js` - 测试用例
- `scripts/update-readme.js` - README 更新脚本
- `package.json` - 项目依赖

### 参考文档

- [GitHub Actions 文档](https://docs.github.com/actions)
- [Playwright 文档](https://playwright.dev/docs/intro)
- [GitHub Expressions](https://docs.github.com/actions/learn-github-actions/expressions)
