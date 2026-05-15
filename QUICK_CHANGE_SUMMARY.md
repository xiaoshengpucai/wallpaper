# ✅ 推荐功能已改用 classificationTag 参数

## 🎯 重要变更

**从 `tag` 参数改为 `classificationTag` 参数**

---

## 📡 API 请求变化

### 修改前

```
GET /api/v1/pc-wallpapers?page=1&pageSize=16&tag=动漫&sort=-downloadCount
```

### 修改后

```
GET /api/v1/pc-wallpapers?page=1&pageSize=16&classificationTag=动漫&sort=-downloadCount
```

---

## 💻 后端需要做什么

### 必须支持 classificationTag 参数的模糊搜索

```javascript
// MongoDB 示例
app.get('/api/v1/pc-wallpapers', async (req, res) => {
  const { classificationTag } = req.query
  
  const query = {}
  if (classificationTag) {
    // 模糊匹配
    query.classificationTag = { $regex: classificationTag, $options: 'i' }
  }
  
  const items = await Wallpaper.find(query).sort('-downloadCount')
  res.json({ data: { items, total: items.length } })
})
```

```sql
-- MySQL 示例
SELECT * FROM wallpapers 
WHERE classification_tag LIKE '%动漫%'
ORDER BY download_count DESC
```

---

## 🔍 测试方法

### 1. 使用 curl

```bash
curl "http://127.0.0.1:3001/api/v1/pc-wallpapers?classificationTag=美女&page=1&pageSize=2"
```

**应该返回**: classificationTag 包含"美女"的所有壁纸

### 2. 使用前端

1. 启动后端服务
2. 启动前端：`npm run dev`
3. 访问壁纸详情页
4. 打开 Console (F12) 查看：

```javascript
[推荐-调试] 📡 开始请求: classificationTag="动漫" page=1
```

5. 在 Network 面板查看请求是否成功

---

## ✅ 优势

- **避免混淆**: `classificationTag` 比 `tag` 更明确
- **语义清晰**: 明确表示这是分类标签的文本
- **已添加验证**: 前端会过滤掉疑似 ID 的标签

---

## 📖 完整文档

查看 [CLASSIFICATION_TAG_CHANGE.md](CLASSIFICATION_TAG_CHANGE.md) 了解：
- 详细的后端实现参考（MongoDB/MySQL/Prisma）
- 数据库设计建议
- 迁移指南
- 测试方法

---

## 🚀 开始测试

1. **修改后端**: 支持 `classificationTag` 参数的模糊搜索
2. **重启后端**: 使修改生效
3. **刷新前端**: Ctrl+F5
4. **查看 Console**: 确认请求使用 `classificationTag` 参数
5. **验证结果**: 推荐区域显示相关壁纸

搞定！🎉
