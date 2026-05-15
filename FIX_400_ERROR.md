# 400 错误快速修复指南

## 🚨 错误：tag=a754117… 400 Bad Request

### 问题

后端返回的 `tags` 是 **ID** 而不是**文本**，导致 API 请求失败。

```
GET /api/v1/pc-wallpapers?tag=a754117de8bf 400 (Bad Request)
```

---

## ✅ 快速修复

### 步骤 1: 检查后端数据

```bash
curl "http://127.0.0.1:3001/api/v1/pc-wallpapers?page=1&pageSize=1"
```

查看 `tags` 字段：

```json
{
  "tags": ["a754117de8bf", "b863259cf1a2"]  // ← 问题：这是 ID
}
```

应该改成：

```json
{
  "tags": ["风景", "自然", "山水"]  // ← 正确：这是文本
}
```

---

### 步骤 2: 修改后端代码

```javascript
// ❌ 错误：返回标签 ID
router.get('/pc-wallpapers', async (req, res) => {
  const wallpapers = await Wallpaper.find()
    .populate('tags')
  
  const result = wallpapers.map(w => ({
    ...w,
    tags: w.tags.map(tag => tag.id)  // ← 问题在这里
  }))
  
  res.json({ data: { items: result } })
})

// ✅ 正确：返回标签文本
router.get('/pc-wallpapers', async (req, res) => {
  const wallpapers = await Wallpaper.find()
    .populate('tags')
  
  const result = wallpapers.map(w => ({
    ...w,
    tags: w.tags.map(tag => tag.name)  // ← 改成 tag.name
  }))
  
  res.json({ data: { items: result } })
})
```

---

### 步骤 3: 验证修复

1. 重启后端服务
2. 再次运行 curl 命令检查数据
3. 刷新前端页面（Ctrl+F5）
4. 查看 Console 日志：

**修复前**:
```javascript
[推荐-调试] 壁纸 tags 原始数据: ["a754117de8bf"]
[推荐] 过滤掉疑似ID的标签: "a754117de8bf"
[推荐-调试] ⚠️ 没有有效的标签
```

**修复后**:
```javascript
[推荐-调试] 壁纸 tags 原始数据: ["风景", "自然"]
[推荐-调试] 过滤后的有效标签: ["风景", "自然"]
[推荐-调试] 📡 开始请求: tag="风景" page=1
[推荐-调试] ✅ 请求成功，返回 16 条数据
```

---

## 📋 不同数据库的解决方案

### MongoDB + Mongoose

```javascript
const wallpapers = await Wallpaper.find()
  .populate('tags', 'name')  // 只 populate name 字段

const result = wallpapers.map(w => ({
  ...w.toObject(),
  tags: w.tags.map(tag => tag.name)
}))
```

### SQL (MySQL/PostgreSQL)

```sql
SELECT 
  w.*,
  GROUP_CONCAT(t.name) as tags
FROM wallpapers w
LEFT JOIN wallpaper_tags wt ON w.id = wt.wallpaper_id
LEFT JOIN tags t ON wt.tag_id = t.id
GROUP BY w.id
```

### Prisma

```typescript
const wallpapers = await prisma.wallpaper.findMany({
  include: {
    tags: {
      select: { name: true }
    }
  }
})

const result = wallpapers.map(w => ({
  ...w,
  tags: w.tags.map(tag => tag.name)
}))
```

---

## 🔍 前端已添加保护

前端会自动过滤掉疑似 ID 的标签：
- ✅ 超过 20 字符
- ✅ 纯数字
- ✅ 长字母数字组合
- ✅ 包含特殊字符

**但这只是临时方案，根本解决方法是修改后端！**

---

## 📖 详细文档

- [TAG_ID_ISSUE.md](TAG_ID_ISSUE.md) - 详细说明和解决方案
- [DEBUG_RECOMMENDATIONS.md](DEBUG_RECOMMENDATIONS.md) - 调试指南

---

## ✅ 完成

修改后端返回标签文本 → 重启后端 → 刷新前端 → 查看推荐功能正常工作 ✨
