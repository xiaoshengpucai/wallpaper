#!/usr/bin/env node

/**
 * 后端连接测试工具
 * 
 * 使用方法:
 *   node check-backend.cjs
 * 
 * 或指定后端地址:
 *   node check-backend.cjs http://127.0.0.1:8080
 */

const http = require('http')
const https = require('https')

// 从命令行参数或环境变量获取后端地址
const backendUrl = process.argv[2] || 'http://127.0.0.1:3001'

console.log('\n╔════════════════════════════════════════╗')
console.log('║   后端连接测试工具                     ║')
console.log('╚════════════════════════════════════════╝\n')
console.log(`🎯 测试地址: ${backendUrl}\n`)

// 测试的 API 路径
const testPaths = [
  '/api/v1/pc-wallpapers?page=1&pageSize=2',
  '/api/v1/mobile-wallpapers?page=1&pageSize=2',
  '/api/v1/health',
  '/api/pc-wallpapers?page=1&pageSize=2',  // 无 v1
  '/pc-wallpapers?page=1&pageSize=2',      // 无 api
]

function testUrl(urlString) {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlString)
      const client = url.protocol === 'https:' ? https : http
      
      const startTime = Date.now()
      
      const req = client.get(urlString, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          const elapsed = Date.now() - startTime
          resolve({
            success: true,
            status: res.statusCode,
            data: data,
            elapsed: elapsed
          })
        })
      })
      
      req.on('error', (err) => {
        resolve({
          success: false,
          error: err.message
        })
      })
      
      req.setTimeout(5000, () => {
        req.destroy()
        resolve({
          success: false,
          error: '请求超时（5 秒）'
        })
      })
    } catch (err) {
      resolve({
        success: false,
        error: err.message
      })
    }
  })
}

async function runTests() {
  let foundWorkingEndpoint = false
  
  for (const path of testPaths) {
    const fullUrl = backendUrl + path
    console.log(`📡 测试: ${path}`)
    
    const result = await testUrl(fullUrl)
    
    if (!result.success) {
      console.log(`   ❌ 连接失败: ${result.error}\n`)
      continue
    }
    
    if (result.status === 200) {
      console.log(`   ✅ 成功! 状态码: ${result.status} | 耗时: ${result.elapsed}ms`)
      
      try {
        const json = JSON.parse(result.data)
        const preview = JSON.stringify(json).slice(0, 100)
        console.log(`   📄 响应预览: ${preview}...`)
        
        // 检查数据结构
        let hasData = false
        if (Array.isArray(json)) {
          hasData = json.length > 0
          console.log(`   📦 数据: ${json.length} 条`)
        } else if (json.data) {
          if (Array.isArray(json.data.items)) {
            hasData = json.data.items.length > 0
            console.log(`   📦 数据: ${json.data.items.length} 条 (总数: ${json.data.total || '?'})`)
          } else if (Array.isArray(json.data)) {
            hasData = json.data.length > 0
            console.log(`   📦 数据: ${json.data.length} 条`)
          }
        } else if (json.items || json.list) {
          const items = json.items || json.list
          hasData = items.length > 0
          console.log(`   📦 数据: ${items.length} 条 (总数: ${json.total || '?'})`)
        }
        
        if (hasData) {
          console.log(`   ✨ 这个接口可以使用！\n`)
          foundWorkingEndpoint = true
          
          // 提取路径前缀
          const pathPrefix = path.split('?')[0].replace('/pc-wallpapers', '').replace('/mobile-wallpapers', '')
          if (pathPrefix) {
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
            console.log(`✅ 找到可用接口！`)
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
            console.log(`📝 请在 .env.development 中设置:`)
            console.log(`   VITE_API_BASE_URL=${pathPrefix}`)
            console.log(`   VITE_BACKEND_ORIGIN=${backendUrl}\n`)
            console.log(`📝 请在 vite.config.ts 中设置:`)
            console.log(`   proxy: {`)
            const proxyPath = pathPrefix ? pathPrefix.split('/')[1] : 'pc-wallpapers'
            console.log(`     '/${proxyPath}': {`)
            console.log(`       target: '${backendUrl}',`)
            console.log(`       changeOrigin: true,`)
            console.log(`     }`)
            console.log(`   }\n`)
          }
          break
        } else {
          console.log(`   ⚠️  接口可访问，但返回的数据为空\n`)
        }
      } catch (e) {
        console.log(`   ⚠️  响应不是有效的 JSON`)
        console.log(`   📄 响应内容: ${result.data.slice(0, 200)}...\n`)
      }
    } else if (result.status === 404) {
      console.log(`   ❌ 404 Not Found - 接口路径不存在\n`)
    } else {
      console.log(`   ❌ 错误状态码: ${result.status}\n`)
    }
    
    // 等待一下，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  if (!foundWorkingEndpoint) {
    console.log('❌ 未找到可用的后端接口\n')
    console.log('💡 可能的原因:')
    console.log('   1. 后端服务未启动')
    console.log('   2. 后端地址或端口错误')
    console.log('   3. 后端 API 路径不同\n')
    console.log('💡 建议:')
    console.log('   1. 确认后端服务运行状态')
    console.log('   2. 查看后端日志确认 API 路径')
    console.log('   3. 尝试在浏览器直接访问后端地址\n')
    console.log('📞 需要帮助？提供:')
    console.log('   - 后端真实地址（包括端口）')
    console.log('   - 后端 API 路径')
    console.log('   - 后端日志截图\n')
  }
}

runTests().catch(console.error)
