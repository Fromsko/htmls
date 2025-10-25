#!/usr/bin/env bun

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const readmePath = resolve("README.md");

// 读取 README.md
const content = readFileSync(readmePath, "utf-8");

// 获取当前日期时间（ISO 8601 格式）
const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

// 替换时间戳（匹配 $(date) 或 任何 YYYY-MM-DD 格式的日期）
const updatedContent = content.replace(
  /\*\*最后更新\*\*:\s*(.+)/,
  `**最后更新**: ${now}`
);

// 如果内容改变了，写入文件
if (updatedContent !== content) {
  writeFileSync(readmePath, updatedContent, "utf-8");
  console.log(`✅ README.md 时间已更新: ${now}`);
} else {
  console.log(`ℹ️ README.md 时间已是最新: ${now}`);
}
