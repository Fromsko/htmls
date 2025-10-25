#!/usr/bin/env node

/**
 * update-readme.js
 * 自动更新 README.md，将最新的 Playwright 截图集成到文档中
 *
 * 功能:
 * - 从 screenshots 目录读取所有截图
 * - 生成标准化的截图展示Markdown
 * - 更新或创建 README.md 中的截图部分
 */

const fs = require("fs");
const path = require("path");

/**
 * 配置项
 */
const config = {
  screenshotDir: path.join(__dirname, "../screenshots"),
  readmeFile: path.join(__dirname, "../README.md"),
  sectionMarker: {
    start: "<!-- PLAYWRIGHT_SCREENSHOTS_START -->",
    end: "<!-- PLAYWRIGHT_SCREENSHOTS_END -->",
  },
};

/**
 * 日志输出函数
 */
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
};

/**
 * 检查截图目录是否存在
 */
function checkScreenshotDir() {
  if (!fs.existsSync(config.screenshotDir)) {
    log.warn(`截图目录不存在: ${config.screenshotDir}`);
    return false;
  }
  return true;
}

/**
 * 获取所有截图文件
 * @returns {Array<string>} 截图文件名数组
 */
function getScreenshots() {
  try {
    const files = fs.readdirSync(config.screenshotDir);
    return files.filter((file) => /\.(png|jpg|jpeg|gif)$/i.test(file)).sort();
  } catch (error) {
    log.error(`读取截图目录失败: ${error.message}`);
    return [];
  }
}

/**
 * 分类截图
 * @param {Array<string>} screenshots - 截图文件列表
 * @returns {Object} 分类后的截图对象
 */
function categorizeScreenshots(screenshots) {
  const categories = {
    index: [],
    chat: [],
    responsive: [],
  };

  screenshots.forEach((file) => {
    if (file.includes("index")) {
      categories.index.push(file);
    } else if (file.includes("chat")) {
      categories.chat.push(file);
    } else if (file.includes("responsive")) {
      categories.responsive.push(file);
    }
  });

  return categories;
}

/**
 * 生成截图 Markdown 内容
 * @param {Object} categories - 分类后的截图
 * @returns {string} Markdown 内容
 */
function generateScreenshotMarkdown(categories) {
  let markdown = "";

  markdown += "## 📸 Page Screenshots\n\n";

  // 主页截图
  if (categories.index.length > 0) {
    markdown += "### 🏠 Index Page (Main Navigation)\n\n";
    markdown +=
      "The main navigation center showcasing AI tools, UI frameworks, and AI editors.\n\n";

    categories.index.forEach((file) => {
      const displayName = file
        .replace(".png", "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      markdown += `#### ${displayName}\n\n`;
      markdown += `![${displayName}](./screenshots/${file})\n\n`;
      markdown +=
        "*Captured with Playwright on: " +
        new Date().toISOString().split("T")[0] +
        "*\n\n";
    });
  }

  // 聊天页面截图
  if (categories.chat.length > 0) {
    markdown += "### 💬 Chat Page (Conversation Interface)\n\n";
    markdown +=
      "The AI chat assistant interface for interactive conversations.\n\n";

    categories.chat.forEach((file) => {
      const displayName = file
        .replace(".png", "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      markdown += `#### ${displayName}\n\n`;
      markdown += `![${displayName}](./screenshots/${file})\n\n`;
      markdown +=
        "*Captured with Playwright on: " +
        new Date().toISOString().split("T")[0] +
        "*\n\n";
    });
  }

  // 响应式设计截图
  if (categories.responsive.length > 0) {
    markdown += "### 📱 Responsive Design\n\n";
    markdown +=
      "Screenshots showing the responsive design across different device sizes.\n\n";

    categories.responsive.forEach((file) => {
      const displayName = file
        .replace(".png", "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      markdown += `#### ${displayName}\n\n`;
      markdown += `![${displayName}](./screenshots/${file})\n\n`;
      markdown +=
        "*Captured with Playwright on: " +
        new Date().toISOString().split("T")[0] +
        "*\n\n";
    });
  }

  return markdown.trim();
}

/**
 * 读取 README.md 文件
 * @returns {string} README 内容
 */
function readReadme() {
  try {
    if (fs.existsSync(config.readmeFile)) {
      return fs.readFileSync(config.readmeFile, "utf-8");
    }
    return "";
  } catch (error) {
    log.error(`读取 README 失败: ${error.message}`);
    return "";
  }
}

/**
 * 更新或创建 README 中的截图部分
 * @param {string} readme - 原始 README 内容
 * @param {string} screenshotContent - 截图 Markdown 内容
 * @returns {string} 更新后的 README 内容
 */
function updateReadmeWithScreenshots(readme, screenshotContent) {
  const { start, end } = config.sectionMarker;

  const newContent = `${start}\n\n${screenshotContent}\n\n${end}`;

  if (readme.includes(start) && readme.includes(end)) {
    // 替换现有的截图部分
    const regex = new RegExp(`${start}[\\s\\S]*?${end}`, "g");
    return readme.replace(regex, newContent);
  } else {
    // 在 README 末尾添加截图部分
    return readme.trimEnd() + "\n\n" + newContent;
  }
}

/**
 * 写入 README.md 文件
 * @param {string} content - README 内容
 * @returns {boolean} 是否成功
 */
function writeReadme(content) {
  try {
    fs.writeFileSync(config.readmeFile, content, "utf-8");
    return true;
  } catch (error) {
    log.error(`写入 README 失败: ${error.message}`);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  log.info("开始更新 README.md...");

  // 检查截图目录
  if (!checkScreenshotDir()) {
    log.warn("跳过 README 更新");
    return;
  }

  // 获取截图
  const screenshots = getScreenshots();
  if (screenshots.length === 0) {
    log.warn("未找到任何截图文件");
    return;
  }

  log.success(`找到 ${screenshots.length} 个截图文件`);
  log.info("截图文件: " + screenshots.join(", "));

  // 分类截图
  const categories = categorizeScreenshots(screenshots);

  // 生成 Markdown
  const screenshotMarkdown = generateScreenshotMarkdown(categories);

  // 读取 README
  let readme = readReadme();

  // 更新 README
  const updatedReadme = updateReadmeWithScreenshots(readme, screenshotMarkdown);

  // 写入 README
  if (writeReadme(updatedReadme)) {
    log.success("README.md 更新成功！");
    log.info(
      `已更新 ${Object.values(categories).reduce(
        (a, b) => a + b.length,
        0
      )} 个截图`
    );
  } else {
    process.exit(1);
  }
}

// 运行主函数
main().catch((error) => {
  log.error(`执行失败: ${error.message}`);
  process.exit(1);
});
