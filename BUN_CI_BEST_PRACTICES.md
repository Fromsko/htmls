# 🚀 Bun 在 GitHub Actions 中的最佳实践

> 本文档总结了如何在 CI/CD 环境中正确使用 Bun，避免常见错误。

## 📌 核心问题：`--frozen-lockfile` 错误

### ❌ 错误现象
```
error: lockfile had changes, but lockfile is frozen
note: try re-running without --frozen-lockfile and commit the updated lockfile
```

### 🔍 原因分析

当使用 `bun install --frozen-lockfile` 时，Bun 会严格验证：
1. **lockfile 与 package.json 完全匹配**
2. **安装过程中不修改 lockfile**

错误发生的场景：
- ❌ `package.json` 改变了，但忘记本地运行 `bun install` 更新 lockfile
- ❌ lockfile 丢失或损坏
- ❌ **Bun 版本更新改变了 lockfile 格式**（常见问题！）
- ❌ CI 环境中的 Bun 版本与本地不同

### ✅ 解决方案对比

| 场景              | 解决方案                        | 说明                        |
| ----------------- | ------------------------------- | --------------------------- |
| **本地开发**      | `bun install`                   | 正常安装，自动更新 lockfile |
| **CI - 严格验证** | `bun install --frozen-lockfile` | 验证 lockfile 的一致性      |
| **CI - 生产构建** | `bun install` + 缓存            | 缓存保证快速安装，无需冻结  |
| **跨版本兼容**    | `bun install` + 版本固定        | 避免 Bun 版本导致的变化     |

---

## 🎯 推荐的 GitHub Actions 工作流

### 1️⃣ **Setup Bun**
```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v2  # 使用 v2（最新）
  with:
    bun-version: latest  # 或指定具体版本如 "1.3.1"
```

### 2️⃣ **缓存策略**（关键！）
```yaml
# Bun 依赖缓存
- name: Restore Bun Dependencies Cache
  uses: actions/cache@v4
  id: bun-cache
  with:
    path: ~/.bun/install/cache  # Bun 的本地缓存目录
    key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
    restore-keys: |
      ${{ runner.os }}-bun-

# Playwright 浏览器缓存（如果需要）
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: |
      ~/.cache/ms-playwright
      ~/.bun
    key: ${{ runner.os }}-playwright-${{ hashFiles('bun.lock') }}
    restore-keys: |
      ${{ runner.os }}-playwright-
```

### 3️⃣ **安装依赖**（关键改变！）
```yaml
# ✅ 推荐：移除 --frozen-lockfile
- name: Install dependencies
  run: bun install

# ❌ 不推荐（容易出错）
# run: bun install --frozen-lockfile
```

### 4️⃣ **完整工作流示例**
```yaml
name: Build and Test

on:
  push:
    branches: [main]
  pull_request:

env:
  BUN_INSTALL_CACHE: 1  # 启用 Bun 内置缓存

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      # 缓存 Bun 依赖
      - name: Restore Bun cache
        uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
          restore-keys: |
            ${{ runner.os }}-bun-

      # 安装依赖（无 --frozen-lockfile）
      - name: Install dependencies
        run: bun install

      # 运行测试
      - name: Run tests
        run: bun test

      # 构建项目
      - name: Build
        run: bun run build
```

---

## 🔑 关键要点

### ✨ 为什么移除 `--frozen-lockfile`？

| 原因                      | 说明                               |
| ------------------------- | ---------------------------------- |
| **缓存已保证速度**        | 缓存命中时，安装速度极快           |
| **lockfile 本地已是最新** | 开发者负责提交最新的 `bun.lock`    |
| **避免版本兼容性问题**    | Bun 版本升级时的 lockfile 格式变化 |
| **CI 不需要验证模式**     | 生产构建关注功能而非锁定验证       |
| **简化错误排查**          | 减少"lockfile 不同步"的问题        |

### 🛠️ 最佳实践检查清单

- ✅ 本地运行 `bun install` 并提交 `bun.lock`
- ✅ CI 中只使用 `bun install`（无 `--frozen-lockfile`）
- ✅ 配置 `~/.bun/install/cache` 缓存
- ✅ 设置 `BUN_INSTALL_CACHE=1` 环境变量
- ✅ 使用 `oven-sh/setup-bun@v2`（v1 已过时）
- ✅ `bun.lock` 在 `.gitignore` 中被移除（纳入版本控制）
- ✅ 其他包管理器的 lockfile 在 `.gitignore` 中（`package-lock.json`、`yarn.lock` 等）

---

## 🚦 故障排除

### 问题 1：CI 仍然报 "lockfile had changes"
```bash
# 解决方案：
# 1. 本地清理并重新安装
rm -rf node_modules bun.lock ~/.bun/install/cache
bun install

# 2. 提交更新的 bun.lock
git add bun.lock
git commit -m "chore: update bun lockfile"
git push
```

### 问题 2：依赖安装时间过长
```bash
# 确保缓存配置正确
# 1. 检查 bun.lock 是否提交
git ls-files | grep bun.lock

# 2. 检查 GitHub Actions 缓存配置
# path: ~/.bun/install/cache 必须正确

# 3. 清除旧缓存后重试
```

### 问题 3：本地和 CI 依赖不一致
```bash
# 原因：Bun 版本不同
# 解决方案：固定 setup-bun 的版本
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: "1.3.1"  # 与本地相同版本
```

---

## 📊 性能对比

### 安装时间对比（冷启动）
| 工具    | 时间       | 备注   |
| ------- | ---------- | ------ |
| npm     | ~30-45s    | 最慢   |
| yarn    | ~20-30s    | 中等   |
| pnpm    | ~15-25s    | 较快   |
| **Bun** | **~5-10s** | 最快 ⚡ |

### 缓存命中后
| 工具           | 时间    | 备注    |
| -------------- | ------- | ------- |
| npm + 缓存     | ~3-5s   | 中等    |
| yarn + 缓存    | ~2-3s   | 快速    |
| pnpm + 缓存    | ~1-2s   | 很快    |
| **Bun + 缓存** | **<1s** | 极快 ⚡⚡ |

---

## 🎓 学习资源

### 官方文档
- [Bun 官方文档](https://bun.sh/docs)
- [setup-bun Action](https://github.com/oven-sh/setup-bun)
- [GitHub Actions Cache](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)

### 常用命令
```bash
# 本地开发
bun install              # 安装依赖
bun add <package>       # 添加依赖
bun remove <package>    # 移除依赖
bun update              # 更新依赖

# 构建和测试
bun run build           # 运行 build 脚本
bun run dev             # 运行 dev 脚本
bun test                # 运行测试

# 脚本执行
bun <script.js>         # 直接运行脚本
bunx <command>          # 运行 npm 包（如 npx）
```

---

## 📝 总结

| 指标                       | 说明                                 |
| -------------------------- | ------------------------------------ |
| **使用 --frozen-lockfile** | ❌ CI 中不推荐（导致 lockfile 冲突）  |
| **使用 bun install**       | ✅ CI 中推荐（配合缓存）              |
| **缓存配置**               | ✅ 必须配置（速度提升 30-50x）        |
| **Bun 版本**               | 建议固定或 latest（避免兼容性问题）  |
| **lockfile 管理**          | ✅ 提交 `bun.lock`，忽略其他 lockfile |

这样就能在 CI/CD 中充分发挥 Bun 的性能优势！🚀
