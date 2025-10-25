# 🚀 快速开始指南

欢迎使用 AI Navigation Center！本指南将帮助你快速上手。

## 📖 目录

1. [本地预览](#本地预览)
2. [开发设置](#开发设置)
3. [运行测试](#运行测试)
4. [常见问题](#常见问题)

## 本地预览

### 方式一：直接打开 (最简单)

```bash
# 在浏览器地址栏中输入：
file:///path/to/htmls/index.html
```

优点：无需任何配置
缺点：某些功能可能受限 (如 Service Worker)

### 方式二：使用 Python 简单服务器

```bash
cd /path/to/htmls
python -m http.server 8000

# 然后打开浏览器访问：
# http://localhost:8000
```

### 方式三：使用 Node.js 服务器

```bash
# 全局安装 http-server (仅需一次)
npm install -g http-server

# 启动服务器
cd /path/to/htmls
http-server

# 打开浏览器访问显示的 URL
# 通常是 http://localhost:8080
```

### 方式四：使用 VS Code Live Server

1. 在 VS Code 中安装 "Live Server" 扩展
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

## 开发设置

### 1. 环境要求

- Node.js 18+ 或 浏览器最新版本
- Git (用于版本控制)
- 代码编辑器 (推荐 VS Code)

### 2. 项目初始化

```bash
# 克隆或下载项目
git clone <repository-url>
cd htmls

# 安装依赖
npm install
```

### 3. 文件结构速览

```
htmls/
├── index.html          📄 主导航页面
├── chat.html           💬 聊天页面
├── service-worker.js   ⚙️  离线缓存
├── package.json        📦 依赖配置
└── README.md           📚 完整文档
```

## 运行测试

### 前置条件

```bash
# 安装依赖
npm install

# 安装 Playwright 浏览器
npx playwright install chromium
```

### 运行所有测试

```bash
npm test
```

输出示例：
```
✅ index.html screenshots captured successfully
✅ chat.html screenshots captured successfully
✅ Navigation links verified successfully
✅ Responsive design screenshots captured successfully
```

### 运行特定测试

```bash
# 只运行主页截图测试
npx playwright test tests/screenshots.spec.js -g "should capture index"

# 只运行聊天页面测试
npx playwright test tests/screenshots.spec.js -g "should capture chat"

# 只运行响应式设计测试
npx playwright test tests/screenshots.spec.js -g "responsive"
```

### 调试测试

```bash
# 使用 Playwright Inspector 调试
npm run test:debug

# 使用 UI 模式
npm run test:ui

# 使用有头浏览器 (可视化)
npm run test:headed
```

### 查看测试报告

```bash
# 生成后查看 HTML 报告
npx playwright show-report
```

## 常见问题

### Q: 页面打开后一片黑色？

**A:** 这是正常现象，可能的原因：

1. **CDN 资源加载中**
   - 等待 3-5 秒，CDN 资源通常会自动加载
   - 检查浏览器网络连接

2. **需要刷新页面**
   - 按 F5 或 Cmd+R 刷新

3. **浏览器控制台错误**
   - 打开浏览器开发者工具 (F12)
   - 查看 Console 标签页是否有红色错误
   - 检查 Network 标签页看资源是否加载成功

### Q: 快速访问聊天按钮点击无效？

**A:** 确保：

1. 使用本地服务器或 HTTPS (不能用 `file://` 协议)
2. 检查 `chat.html` 是否存在于同一目录
3. 查看浏览器控制台是否有 CORS 错误

### Q: Service Worker 不工作？

**A:** Service Worker 只在以下条件下工作：

- ✅ HTTPS 连接 或 localhost
- ✅ 不能用 `file://` 协议
- ✅ 浏览器支持 Service Worker

使用本地服务器解决：
```bash
python -m http.server 8000
# 访问 http://localhost:8000
```

### Q: 页面显示不完整或布局混乱？

**A:** 解决方法：

1. **清除浏览器缓存**
   - F12 打开开发者工具 → Application → Clear storage

2. **禁用浏览器扩展**
   - 某些扩展可能影响样式

3. **更新浏览器**
   - 确保浏览器版本最新

4. **检查网络**
   - Tailwind CSS CDN 加载失败
   - 检查网络连接和代理设置

### Q: 消息输入框无法输入？

**A:** 检查：

1. React 库是否正确加载
2. 浏览器控制台是否有 JavaScript 错误
3. Babel 是否成功解析 JSX

### Q: 如何在本地修改并实时预览？

**A:** 使用 Live Server：

```bash
# 安装 Live Server 扩展后
右键 index.html → Open with Live Server

# 编辑文件后浏览器会自动刷新
```

## 开发技巧

### 1. 使用浏览器开发者工具

```
F12          - 打开开发者工具
Cmd+Shift+I  - Mac 快捷键
Ctrl+Shift+I - Windows/Linux 快捷键
```

**有用的标签页：**
- **Elements**: 查看和修改 HTML/CSS
- **Console**: 查看错误和日志
- **Network**: 检查资源加载
- **Application**: 查看缓存和存储

### 2. 实时编辑 CSS

在浏览器开发者工具中直接修改样式，实时预览效果。

### 3. 测试响应式设计

```
Cmd+Shift+M  - 切换设备模拟模式 (Mac)
Ctrl+Shift+M - Windows/Linux
```

然后选择不同的设备进行预览。

## 下一步

- 📖 阅读 [完整文档](./README.md)
- 🔧 查看 [GitHub Actions 文档](./.github/workflows/README.md)
- 🧪 运行 [自动化测试](#运行测试)
- 🎨 修改 [HTML 和 CSS](./index.html)

## 需要帮助？

- 💬 查看 [常见问题](#常见问题)
- 📚 阅读 [README.md](./README.md)
- 🐛 提交 [GitHub Issue](https://github.com/issues)

---

**祝你使用愉快！** 🎉

如有任何问题，欢迎反馈！
