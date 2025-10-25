// @ts-check
const { test } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

// 创建截图目录
const screenshotDir = path.join(__dirname, "../screenshots");
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

/**
 * 获取文件路径
 */
function getFileUrl(filename) {
  const filePath = path.resolve(__dirname, `../${filename}`);
  return `file://${filePath}`;
}

test.describe("AI Navigation Center - Screenshots", () => {
  /**
   * 主页截图
   */
  test("should capture index.html screenshot", async ({ page }) => {
    await page.goto(getFileUrl("index.html"));
    await page.waitForLoadState("load");
    // 等待页面完全稳定
    await page.waitForTimeout(2000);

    // 截取长屏
    await page.screenshot({
      path: path.join(screenshotDir, "index-full.jpg"),
      fullPage: true,
      type: "jpeg",
      quality: 95,
    });

    console.log("✅ index.html screenshot captured");
  });

  /**
   * 聊天页面截图
   */
  test("should capture chat.html screenshot", async ({ page }) => {
    await page.goto(getFileUrl("chat.html"));
    // 等待页面完全加载和DOM稳定
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // 等待确保导航栏和聊天容器都已显示
    try {
      await page.locator("nav").isVisible({ timeout: 5000 });
      await page.locator(".chat-container").isVisible({ timeout: 5000 });
    } catch (e) {
      console.warn("Warning: Some elements might not be visible");
    }

    // 截取长屏
    await page.screenshot({
      path: path.join(screenshotDir, "chat-full.jpg"),
      fullPage: true,
      type: "jpeg",
      quality: 95,
    });

    console.log("✅ chat.html screenshot captured");
  });

  /**
   * 桌面响应式截图
   */
  test("should capture responsive desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(getFileUrl("index.html"));
    await page.waitForLoadState("load");
    // 等待页面完全稳定
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotDir, "responsive-desktop.jpg"),
      fullPage: true,
      type: "jpeg",
      quality: 95,
    });

    console.log("✅ Desktop screenshot captured");
  });

  /**
   * 平板响应式截图
   */
  test("should capture responsive tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(getFileUrl("index.html"));
    await page.waitForLoadState("load");
    // 等待页面完全稳定
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotDir, "responsive-tablet.jpg"),
      fullPage: true,
      type: "jpeg",
      quality: 95,
    });

    console.log("✅ Tablet screenshot captured");
  });
});
