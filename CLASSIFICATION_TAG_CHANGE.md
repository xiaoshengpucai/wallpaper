# 推荐功能改用 classificationTag 参数

## ✅ 已完成的修改

### 从 tag 参数改为 classificationTag 参数

**原因**: 避免与标签 ID 混淆，使用更明确的参数名。

**修改内容**:
```typescript
// 修改前：使用 tag 参数
const result = await fetchWallpapersPage({
  page: recommendPage.value,
  pageSize: 16,
  tag: keyword,  // ← 可能与标签 ID 混淆
  sort: '-downloadCount',
})

// 修改后：使用 classificationTag 参数
const result = await fetchWallpapersPage({
  page: recommendPage.value,
  pageSize: 16,
  classificationTag: keyword,  // ← 更明确
  sort: '-downloadCount',
})
```

---

## 🎯 对后端的要求

### 必须支持 classificationTag 参数的模糊搜索

**接口**: `GET /api/v1/pc-wallpapers?classificationTag=关键词`

**要求**: 
- ✅ 支持模糊匹配（不是精确匹配）
- ✅ 能匹配 classificationTag 字段中包含该关键词的所有壁纸

---

## 📊 请求示例

### 示例 1: 搜索"美女"

```
GET /api/v1/pc-wallpapers?classificationTag=美女&page=1&pageSize=16&sort=-downloadCount
```

**应该返回**:
- classificationTag 包含"美女"的壁纸
- classificationTag 包含"动漫美女"的壁纸
- classificationTag 包含"古风美女"的壁纸
- 等等...

### 示例 2: 搜索"动漫"

```
GET /api/v1/pc-wallpapers?classificationTag=动漫&page=1&pageSize=16&sort=-downloadCount
```

**应该返回**:
- classificationTag 包含"动漫"的壁纸
- classificationTag 包含"动漫美女"的壁纸
- classificationTag 包含"动漫风景"的壁纸
- 等等...

---

## 💻 后端实现参考

### MongoDB 实现

```javascript
app.get('/api/v1/pc-wallpapers', async (req, res) => {
  const { classificationTag, page = 1, pageSize = 16, sort = '-downloadCount' } = req.query
  
  const query = {}
  
  // 模糊匹配 classificationTag
  if (classificationTag) {
    query.classificationTag = { $regex: classificationTag, $options: 'i' }
  }
  
  const skip = (page - 1) * pageSize
  const items = await Wallpaper.find(query)
    .sort(sort)
    .skip(skip)
    .limit(pageSize)
  
  const total = await Wallpaper.countDocuments(query)
  
  res.json({
    data: {
      items,
      total
    }
  })
})
```

### MySQL 实现

```sql
-- 使用 LIKE 进行模糊匹配
SELECT * FROM wallpapers 
WHERE classification_tag LIKE CONCAT('%', ?, '%')
ORDER BY download_count DESC
LIMIT ? OFFSET ?
```

### Prisma 实现

```typescript
const wallpapers = await prisma.wallpaper.findMany({
  where: {
    classificationTag: {
      contains: keyword  // 模糊匹配
    }
  },
  orderBy: {
    downloadCount: 'desc'
  },
  skip: (page - 1) * pageSize,
  take: pageSize
})
```

---

## 🔍 测试方法

### 1. 使用 curl 测试

```bash
# 测试模糊搜索
curl "http://127.0.0.1:3001/api/v1/pc-wallpapers?classificationTag=美女&page=1&pageSize=5"

# 应该返回包含"美女"的壁纸
```

### 2. 使用前端测试

1. 启动后端服务
2. 启动前端：`npm run dev`
3. 访问壁纸详情页
4. 打开 Console 查看请求：

```javascript
[推荐-调试] 📡 开始请求: classificationTag="动漫" page=1
```

5. 在 Network 面板查看请求 URL：

```
GET /api/v1/pc-wallpapers?page=1&pageSize=16&classificationTag=动漫&sort=-downloadCount
```

---

## ✅ 优势

### 1. 避免参数混淆

- ❌ `tag` 参数 - 容易与标签 ID 混淆
- ✅ `classificationTag` 参数 - 明确表示分类标签

### 2. 更清晰的语义

```
tag=a754117de8bf           ← 不知道是 ID 还是文本
classificationTag=动漫美女  ← 明确是分类标签文本
```

### 3. 前端已添加验证

前端会自动过滤掉疑似 ID 的标签，确保发送的都是有效的文本关键词。

---

## 📝 数据库设计建议

### 推荐的字段设计

```javascript
// 壁纸表
{
  id: "1",
  imageUrl: "...",
  title: "美丽风景",
  
  // 推荐：使用 classificationTag 存储分类标签文本
  classificationTag: "自然|风景|山水",  // 字符串，用 | 分隔
  
  // 或者使用数组
  classificationTags: ["自然", "风景", "山水"],  // 数组
  
  // tags 用于存储其他标签（可选）
  tags: ["热门", "推荐"],
  
  downloadCount: 100,
  ...
}
```

### 索引优化

```javascript
// MongoDB 添加索引
db.wallpapers.createIndex({ classificationTag: "text" })

// MySQL 添加索引
CREATE INDEX idx_classification_tag ON wallpapers(classification_tag)
```

---

## 🔄 迁移指南

如果你的后端已经实现了 `tag` 参数，可以这样快速适配：

### 方案 1: 支持两个参数（推荐）

```javascript
const { tag, classificationTag, ...rest } = req.query

// 优先使用 classificationTag，降级到 tag
const searchKeyword = classificationTag || tag

if (searchKeyword) {
  query.classificationTag = { $regex: searchKeyword, $options: 'i' }
}
```

### 方案 2: 重定向参数

```javascript
// 将 classificationTag 映射到现有的 tag 逻辑
if (req.query.classificationTag) {
  req.query.tag = req.query.classificationTag
}

// 继续使用原有的 tag 处理逻辑
```

---

## 📖 相关文档

- **前端实现**: `WallpaperDetailPage.vue` line ~780
- **API 定义**: `src/api/wallpapers.ts` line ~527
- **调试指南**: [DEBUG_RECOMMENDATIONS.md](DEBUG_RECOMMENDATIONS.md)
- **后端配置**: [BACKEND_SETUP.md](BACKEND_SETUP.md)

---

## ✅ 完成

**修改内容**:
- ✅ 前端推荐请求改用 `classificationTag` 参数
- ✅ 更新文档说明
- ✅ 提供后端实现参考

**后端需要做的**:
- ✅ 支持 `classificationTag` 参数
- ✅ 实现模糊匹配（`$regex` 或 `LIKE`）
- ✅ 测试接口是否正常工作

现在刷新页面测试新的实现！🚀
