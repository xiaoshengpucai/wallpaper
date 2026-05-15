# 后端接口配置指南

## 🔧 当前配置

### 前端配置文件

**`.env.development`**
```env
VITE_API_BASE_URL=/api/v1
VITE_BACKEND_ORIGIN=http://127.0.0.1:3001
```

**`vite.config.ts`**
```typescript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
  },
}
```

**当前请求流程：**
```
前端: http://localhost:5173/api/v1/pc-wallpapers
  ↓ (Vite 代理)
后端: http://127.0.0.1:3001/api/v1/pc-wallpapers
```

---

## 🎯 配置真实后端

### 步骤 1: 确认后端信息

请提供以下信息：
- **后端地址**: 例如 `http://127.0.0.1:8080` 或 `http://192.168.1.100:3000`
- **API 路径前缀**: 例如 `/api/v1` 或 `/api` 或无前缀

### 步骤 2: 修改配置

根据后端信息修改以下文件：

#### 场景 A: 后端在本地不同端口（例如 8080）

**`.env.development`**
```env
VITE_API_BASE_URL=/api/v1
VITE_BACKEND_ORIGIN=http://127.0.0.1:8080
```

**`vite.config.ts`**
```typescript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8080',  // ← 修改端口
    changeOrigin: true,
  },
}
```

#### 场景 B: 后端在局域网其他机器

**`.env.development`**
```env
VITE_API_BASE_URL=/api/v1
VITE_BACKEND_ORIGIN=http://192.168.1.100:3001
```

**`vite.config.ts`**
```typescript
proxy: {
  '/api': {
    target: 'http://192.168.1.100:3001',  // ← 修改地址
    changeOrigin: true,
  },
}
```

#### 场景 C: 后端 API 路径不同（例如 /api 而不是 /api/v1）

**`.env.development`**
```env
VITE_API_BASE_URL=/api
VITE_BACKEND_ORIGIN=http://127.0.0.1:3001
```

**`vite.config.ts`**
```typescript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
  },
}
```

#### 场景 D: 后端无路径前缀（直接 /pc-wallpapers）

**`.env.development`**
```env
VITE_API_BASE_URL=
VITE_BACKEND_ORIGIN=http://127.0.0.1:3001
```

**`vite.config.ts`**
```typescript
proxy: {
  '/pc-wallpapers': {
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
  },
  '/mobile-wallpapers': {
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
  },
}
```

---

## 🔍 排查"没有请求到数据"的问题

### 1. 检查后端是否启动

```bash
# 方法 1: 使用 curl
curl http://127.0.0.1:3001/api/v1/pc-wallpapers?page=1&pageSize=2

# 方法 2: 在浏览器访问
http://127.0.0.1:3001/api/v1/pc-wallpapers?page=1&pageSize=2
```

**预期结果**: 返回 JSON 数据，不应该是 404 或连接失败。

### 2. 检查浏览器网络请求

打开开发者工具（F12）→ Network 标签：

1. **刷新页面**
2. **筛选 XHR/Fetch**
3. **找到 `pc-wallpapers` 请求**
4. **检查状态码和响应**

**常见错误：**

| 状态码 | 错误 | 原因 | 解决方法 |
|--------|------|------|----------|
| (failed) | `ERR_CONNECTION_REFUSED` | 后端未启动 | 启动后端服务 |
| 404 | `Not Found` | 接口路径错误 | 检查后端路由 |
| 500 | `Internal Server Error` | 后端代码错误 | 查看后端日志 |
| 0 | `CORS error` | 跨域问题 | 确认 Vite 代理配置 |
| 200 | 空数组 `[]` | 数据库无数据 | 添加测试数据 |

### 3. 检查浏览器 Console

打开 Console，查看是否有错误信息：

```javascript
// 正常情况应该看到：
[pc-wallpapers] response preview: {"data":{"items":[...],"total":10}}

// 错误情况可能看到：
❌ Failed to fetch
❌ Network Error
❌ [pc-wallpapers] 接口返回了 0 条记录
```

### 4. 检查前端 API 调用

确认前端是否正确调用了 API：

**`src/api/wallpapers.ts`** 中的 `fetchWallpapersPage` 函数应该请求：

```typescript
const { data } = await http.get<unknown>('/pc-wallpapers', {
  params: { page, pageSize, sort, tag, ... }
})
```

这会被 `http.ts` 中的 baseURL 拼接成：`/api/v1/pc-wallpapers`

---

## 🧪 快速测试

### 测试后端是否可用

在浏览器直接访问：

```
http://127.0.0.1:3001/api/v1/pc-wallpapers?page=1&pageSize=2
```

**如果显示 JSON 数据** → 后端正常，检查前端配置  
**如果显示 404** → 后端路径错误，需要调整路径  
**如果无法访问** → 后端未启动或端口错误

### 测试 Vite 代理是否工作

1. 确保前端运行在 `http://localhost:5173`
2. 打开 Network 面板
3. 访问任意壁纸列表页
4. 查看请求 URL:

```
Request URL: http://localhost:5173/api/v1/pc-wallpapers?page=1&pageSize=16
```

如果请求被代理，应该在后端看到日志。

---

## 📝 配置步骤总结

1. ✅ 确认后端地址和端口（例如 `http://127.0.0.1:8080`）
2. ✅ 修改 `.env.development` 中的 `VITE_BACKEND_ORIGIN`
3. ✅ 修改 `vite.config.ts` 中的 `proxy.target`
4. ✅ 重启前端开发服务器（`Ctrl+C` 后重新 `npm run dev`）
5. ✅ 打开浏览器 F12 检查 Network 请求
6. ✅ 确认请求成功返回数据

---

## 🆘 仍然无法获取数据？

请提供以下信息：

1. **后端地址和端口**: 例如 `http://127.0.0.1:8080`
2. **后端 API 路径**: 例如 `/api/v1/pc-wallpapers` 或 `/pc-wallpapers`
3. **浏览器 Network 面板截图**: 显示请求 URL 和状态码
4. **浏览器 Console 错误信息**: 完整的错误日志
5. **后端日志**: 后端是否收到请求

我会帮你排查并解决问题！
