# Wallpaper (Vue3 + TS + Pinia + Tailwind)

现代化壁纸浏览与管理系统，支持电脑/手机壁纸预览、智能推荐、收藏下载等功能。

## ✨ 核心特性

- 🖼️ **精美预览**: iPhone 14 Pro Max 风格手机预览，带灵动岛和锁屏动画
- 🎯 **智能推荐**: 基于标签的模糊搜索推荐系统
- 🎨 **3D 交互**: TiltedCard 卡片倾斜效果 + Hover 信息弹层
- 📱 **响应式设计**: 完美适配 PC 和移动端
- ⚡ **无限滚动**: IntersectionObserver 自动加载更多
- 🎬 **流畅动画**: 入场动画、过渡效果、骨架屏

---

## 🚀 快速开始

### 前端开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 配置后端接口

修改 `.env.development` 和 `vite.config.ts` 中的后端地址：

```env
# .env.development
VITE_API_BASE_URL=/api/v1
VITE_BACKEND_ORIGIN=http://127.0.0.1:8080  # ← 修改为你的后端地址
```

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8080',  // ← 修改为你的后端地址
    changeOrigin: true,
  },
}
```

**详细配置**: 查看 [BACKEND_SETUP.md](BACKEND_SETUP.md)

---

## 📚 文档

- **🔧 [后端接口配置](BACKEND_SETUP.md)** - 配置指南和问题排查
- **🐛 [推荐功能调试](DEBUG_RECOMMENDATIONS.md)** - 推荐区域无数据的排查步骤
- **🚨 [400 错误修复](FIX_400_ERROR.md)** - tag 参数是 ID 的问题（重要！）
- **📖 [标签 ID 问题详解](TAG_ID_ISSUE.md)** - 标签 ID vs 标签文本
- **👻 [有数据但无内容](NO_CONTENT_ISSUE.md)** - 数据返回了但页面不显示
- **🔄 [改用 classificationTag](CLASSIFICATION_TAG_CHANGE.md)** - 推荐功能改用 classificationTag 参数

---

## 🗂️ 项目结构

```text
wallpaper/
├── src/
│   ├── api/                          # API 接口封装
│   │   ├── http.ts                   # Axios 实例和拦截器
│   │   └── wallpapers.ts             # 壁纸接口（775 行）
│   ├── router/                       # Vue Router 配置
│   ├── stores/                       # Pinia 状态管理
│   ├── utils/                        # 工具函数
│   ├── views/                        # 页面组件
│   │   ├── PcWallpapersPage.vue      # 电脑壁纸列表
│   │   ├── MobileWallpapersPage.vue  # 手机壁纸列表
│   │   └── WallpaperDetailPage.vue   # 详情页（含推荐功能）
│   └── components/
│       ├── TiltedCard.vue            # 3D 倾斜卡片
│       ├── WallpaperHoverOverlay.vue # Hover 信息弹层
│       ├── GooeyNav2.vue             # 粘性导航栏
│       ├── GlitchText.vue            # 故障风格文字
│       └── detail/
│           ├── WallpaperDetailPhonePreview.vue    # 手机预览（470 行）
│           └── WallpaperDetailLaptopPreview.vue   # 电脑预览
├── mock-server.js                    # Mock 后端服务器
├── test-api.js                       # API 测试脚本
├── QUICK_START.md                    # 快速开始指南
├── BACKEND_API_SPEC.md               # 完整 API 文档
├── BACKEND_INTEGRATION.md            # 后端联调指南
└── README.md                         # 本文档
```

---

## 🎯 推荐功能

### 智能推荐算法

前端会自动从壁纸标签中提取关键词，使用 `classificationTag` 参数进行模糊搜索：

```
标签: ["动漫美女", "复古"]
  ↓
提取关键词: ["动漫美女", "复古", "动漫", "美女"]
  ↓
限制为前 3 个（避免过多请求）: ["动漫美女", "复古", "动漫"]
  ↓
串行搜索（避免并发卡顿）:
  GET ?classificationTag=动漫美女 → 1 个结果
  GET ?classificationTag=复古     → 2 个结果
  GET ?classificationTag=动漫     → 8 个结果
  ↓
合并去重: 11 个不重复推荐
  ↓
获得 16 条后自动停止
```

**注意**: 使用 `classificationTag` 参数而不是 `tag`，避免与标签 ID 混淆。

### 降级策略

如果壁纸没有 `tags` 字段，会自动降级：

**优先级**:
1. `tags` 数组（优先）
2. `classificationTags` 数组（降级）
3. `classificationTag` 字符串（降级，支持多种分隔符）

```javascript
// 示例1: classificationTags 数组
classificationTags: ["自然", "风景"]  → ["自然", "风景"]

// 示例2: classificationTag 字符串
classificationTag: "自然|风景"  → ["自然", "风景"]
classificationTag: "动漫/美女"  → ["动漫", "美女"]
```

支持的分隔符：`|` `/` `,` `，` `、`

### 性能优化

- **限制关键词数量**: 最多 3 个关键词
- **串行请求**: 避免并发请求导致卡顿
- **自动停止**: 获得 16 条推荐后停止
- **智能去重**: 过滤重复壁纸和当前壁纸

### 查看效果

1. 启动后端服务（确保壁纸有 `tags` 或 `classificationTag` 字段）
2. 启动前端：`npm run dev`
3. 访问任意壁纸详情页，滚动到底部查看"相似推荐"

---

## 🔧 环境配置

### `.env.development`

```env
# API 基础路径（走 Vite 代理）
VITE_API_BASE_URL=/api/v1

# 后端真实地址（用于拼接静态资源）
VITE_BACKEND_ORIGIN=http://127.0.0.1:3001
```

### `vite.config.ts`

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 🧪 调试

### 测试后端连接

```bash
# 测试后端是否可访问
node check-backend.cjs

# 或指定后端地址
node check-backend.cjs http://127.0.0.1:8080
```

### 排查推荐功能

如果推荐区域没有数据：

1. **打开浏览器 Console（F12）**
2. **查看调试日志**：

```javascript
[推荐-调试] 组件已挂载
[推荐-调试] isNarrowViewport: false
[推荐-调试] 开始加载推荐
[推荐-调试] 📡 开始请求: tag="风景" page=1
[推荐-调试] ✅ 请求成功，返回 16 条数据
```

**详细排查步骤**: 查看 [DEBUG_RECOMMENDATIONS.md](DEBUG_RECOMMENDATIONS.md)

### 查看前端日志

打开浏览器开发者工具（F12）→ Console：

```
[推荐] 从标签提取关键词: ["动漫美女", "复古"] → ["动漫美女", "复古", "动漫", "美女"]
[推荐] 使用关键词 "动漫美女" (1/4) 加载第 1 页
[pc-wallpapers] response preview: {"data":{"items":[...],"total":8}}
```

### 查看网络请求

开发者工具 → Network 标签 → 筛选 XHR/Fetch

**常见错误：**
- `ERR_CONNECTION_REFUSED` → 后端未启动
- `404 Not Found` → 接口路径错误
- `500 Internal Server Error` → 后端代码错误
- `CORS error` → 跨域问题（检查 Vite 代理配置）

**详细排查**: 查看 [BACKEND_SETUP.md](BACKEND_SETUP.md)

---

## 🎨 核心组件

### WallpaperDetailPhonePreview.vue（470 行）

- **iPhone 14 Pro Max 风格**外观设计
- **灵动岛**三阶段动画（默认 → 中间 → 完全展开）
- **锁屏界面**时间日期显示（含农历）
- **Home Indicator** 上滑动画
- **加载状态**骨架屏和错误提示

### WallpaperDetailPage.vue（901 行）

- **推荐功能**完整实现（关键词提取、模糊搜索、无限加载）
- **响应式布局**自适应 2/3/4 列网格
- **去重逻辑**避免重复和当前壁纸
- **入场动画**错落延迟效果

### TiltedCard.vue（210 行）

- **3D 倾斜效果**跟随鼠标移动
- **光泽动画**模拟反光
- **性能优化**使用 `will-change` 和 `transform`

---

## 🌐 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

---

## 📦 技术栈

- **框架**: Vue 3.5 + TypeScript 6.0
- **路由**: Vue Router 4.5
- **状态**: Pinia 3.0
- **样式**: Tailwind CSS 3.4
- **动画**: GSAP 3.14 + Motion-v 2.2
- **HTTP**: Axios 1.15
- **构建**: Vite 8.0

---

## 🤝 后端接口

### 核心接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/pc-wallpapers` | GET | 电脑壁纸列表 |
| `/api/v1/mobile-wallpapers` | GET | 手机壁纸列表 |
| `/api/v1/pc-wallpapers/:id/favorite` | POST | 收藏/取消收藏 |
| `/api/v1/pc-wallpapers/:id/download` | POST | 下载统计上报 |

### 重要参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `page` | 页码 | `1` |
| `pageSize` | 每页条数 | `16` |
| `tag` | 关键词（支持模糊搜索） | `美女` |
| `sort` | 排序规则 | `-downloadCount` |

**详细文档**: [BACKEND_API_SPEC.md](BACKEND_API_SPEC.md)

---

## 🐛 调试

### 查看前端日志

打开浏览器开发者工具（F12）→ Console：

```
[推荐] 从标签提取关键词: ["动漫美女", "复古"] → ["动漫美女", "复古", "动漫", "美女"]
[推荐] 使用关键词 "动漫美女" (1/4) 加载第 1 页
[pc-wallpapers] response preview: {"data":{"items":[...],"total":8}}
```

### 查看网络请求

开发者工具 → Network 标签 → 筛选 XHR/Fetch

---

## ❓ 常见问题

**Q: 前端显示"暂无推荐"？**  
A: 确保后端服务运行在 `http://127.0.0.1:3001`，并实现了 `tag` 参数的模糊搜索。

**Q: 图片无法显示？**  
A: 检查图片路径是否正确，可以返回相对路径（如 `/uploads/xxx.jpg`）或完整 URL。

**Q: 推荐内容不相关？**  
A: 确认后端实现了模糊匹配（`$regex` 或 `LIKE '%keyword%'`），而不是精确匹配。

**Q: 看到 400 错误 - tag 参数像 ID？**  
A: 后端返回的 `tags` 可能是 ID 数组而不是文本。修改后端返回标签的 `name` 字段：
```javascript
// ❌ 错误：返回 ID
const tags = wallpaper.tags.map(tag => tag.id)

// ✅ 正确：返回文本
const tags = wallpaper.tags.map(tag => tag.name)
```
**详细说明**: [TAG_ID_ISSUE.md](TAG_ID_ISSUE.md)

**Q: 返回了数据但页面没有内容？**  
A: 可能是浏览器窗口太窄（推荐区域被隐藏）或数据被去重过滤掉了。
1. 放大浏览器窗口宽度（≥ 1200px）
2. 打开 Console 查看 `isNarrowViewport` 和 `recommendations.length`
3. 查看详细排查步骤：[NO_CONTENT_ISSUE.md](NO_CONTENT_ISSUE.md)

**更多问题**: 查看 [DEBUG_RECOMMENDATIONS.md](DEBUG_RECOMMENDATIONS.md) 的常见问题章节

---

## 📄 开源协议

MIT License

---

## 📞 获取帮助

- 查看 [快速开始指南](QUICK_START.md)
- 阅读 [后端 API 规范](BACKEND_API_SPEC.md)
- 参考 [后端联调指南](BACKEND_INTEGRATION.md)
- 运行测试脚本：`node test-api.js`

---

**🎉 开始构建你的壁纸系统吧！**

