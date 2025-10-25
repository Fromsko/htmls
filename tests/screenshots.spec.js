// @ts-check
const { test, expect } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

// 创建截图目录
const screenshotDir = path.join(__dirname, "../screenshots");
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

/**
 * 获取文件路径（本地开发或CI环境）
 * @param {string} filename - 文件名
 * @returns {string} 完整的文件 URL
 */
function getFileUrl(filename) {
  const filePath = path.resolve(__dirname, `../${filename}`);
  return `file://${filePath}`;
}

test.describe("AI Navigation Center - Screenshots", () => {
  /**
   * 主页截图测试
   */
  test("should capture index.html screenshot", async ({ page }) => {
    // 导航到主页
    await page.goto(getFileUrl("index.html"));

    // 等待页面加载完成
    await page.waitForLoadState("networkidle");

    // 等待 AOS 动画完成
    await page.waitForTimeout(2000);

    // 设置视口尺寸
    await page.setViewportSize({
      width: 1280,
      height: 1600,
    });

    // 等待内容渲染
    await page.waitForTimeout(1000);

    // 获取整个页面的高度
    const bodyHandle = await page.locator("body");
    const boundingBox = await bodyHandle.boundingBox();

    if (boundingBox) {
      await page.setViewportSize({
        width: 1280,
        height: Math.ceil(boundingBox.height),
      });
      await page.waitForTimeout(500);
    }

    // 截取整个页面（JPEG格式）
    await page.screenshot({
      path: path.join(screenshotDir, "index-full.jpg"),
      fullPage: true,
      type: "jpeg",
      quality: 95,
    });

    // 截取可见区域（JPEG格式）
    await page.setViewportSize({
      width: 1280,
      height: 720,
    });
    await page.screenshot({
      path: path.join(screenshotDir, "index-viewport.jpg"),
      fullPage: false,
      type: "jpeg",
      quality: 95,
    });

    console.log("✅ index.html screenshots captured successfully");
  });

  /**
   * 聊天页面截图测试
   */
  test("should capture chat.html screenshot", async ({ page }) => {
    // 导航到聊天页面
    await page.goto(getFileUrl("chat.html"));

    // 等待页面加载完成
    await page.waitForLoadState("networkidle");

    // 等待 React 组件挂载
    await page.waitForTimeout(2000);

    // 设置视口尺寸
    await page.setViewportSize({
      width: 1280,
      height: 900,
    });

    // 等待内容渲染
    await page.waitForTimeout(1000);

    // 截取可见区域（JPEG格式）
    await page.screenshot({
      path: path.join(screenshotDir, "chat-viewport.jpg"),
      fullPage: false,
      type: "jpeg",
      quality: 95,
    });

    // 测试消息交互并截图
    const inputField = page.locator(".chat-input input");
    const sendButton = page.locator(".chat-input button");

    // 输入消息
    await inputField.fill("你好，这是一个测试消息");
    await page.waitForTimeout(500);

    // 截图 - 输入状态（JPEG格式）
    await page.screenshot({
      path: path.join(screenshotDir, "chat-input.jpg"),
      fullPage: false,
      type: "jpeg",
      quality: 95,
    });

    // 发送消息
    await sendButton.click();
    await page.waitForTimeout(2000);

    // 截图 - 消息交互后（JPEG格式）
    await page.screenshot({
      path: path.join(screenshotDir, "chat-interaction.jpg"),
      fullPage: false,
      type: "jpeg",
      quality: 95,
    });

    console.log("✅ chat.html screenshots captured successfully");
  });

  /**
   * 导航链接测试
   */
  test("should verify navigation links", async ({ page }) => {
    // 从主页导航到聊天页面
    await page.goto(getFileUrl("index.html"));
    await page.waitForLoadState("networkidle");

    // 找到快速访问按钮
    const quickAccessBtn = page.locator(".quick-access-btn");
    await expect(quickAccessBtn).toBeVisible();

    // 检查按钮的 href 属性
    const href = await quickAccessBtn.getAttribute("href");
    expect(href).toBe("./chat.html");

    console.log("✅ Navigation links verified successfully");
  });

  /**
   * 响应式设计测试
   */
  test("should test responsive design", async ({ page }) => {
    await page.goto(getFileUrl("index.html"));
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // 桌面尺寸（JPEG格式）
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({
      path: path.join(screenshotDir, "responsive-desktop.jpg"),
      fullPage: false,
      type: "jpeg",
      quality: 95,
    });

    // 平板尺寸（JPEG格式）
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotDir, "responsive-tablet.jpg"),
      fullPage: false,
      type: "jpeg",
      quality: 95,
    });

    // 手机尺寸（JPEG格式）
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: path.join(screenshotDir, "responsive-mobile.jpg"),
      fullPage: false,
      type: "jpeg",
      quality: 95,
    });

    console.log("✅ Responsive design screenshots captured successfully");
  });
});
