import axios, { AxiosError, AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

import { tokenStorage } from '../utils/tokenStorage'

export type ApiError = {
  message: string
  status?: number
  code?: string
  details?: unknown
}

const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

export const http: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
})

const requestTimestamps = new Map<string, number>()
const MAX_REQUESTS_PER_SECOND = 10

function validateToken(): boolean {
  const token = tokenStorage.get()
  if (!token) return false
  
  const expires = localStorage.getItem('tokenExpires')
  if (expires) {
    const expireDate = new Date(expires)
    if (expireDate <= new Date()) {
      tokenStorage.clear()
      localStorage.removeItem('tokenExpires')
      return false
    }
  }
  return true
}

function sanitizeInput(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }
  if (Array.isArray(value)) {
    return value.map(item => sanitizeInput(item))
  }
  if (typeof value === 'object' && value !== null) {
    const result: Record<string, unknown> = {}
    for (const key in value) {
      result[key] = sanitizeInput((value as Record<string, unknown>)[key])
    }
    return result
  }
  return value
}

function validateRequestFrequency(url: string): boolean {
  const now = Date.now()
  const key = url
  
  if (requestTimestamps.has(key)) {
    const lastTime = requestTimestamps.get(key)!
    const requestsInLastSecond = requestTimestamps.get(`${key}_count`) || 0
    
    if (now - lastTime < 1000) {
      if (requestsInLastSecond >= MAX_REQUESTS_PER_SECOND) {
        return false
      }
      requestTimestamps.set(`${key}_count`, requestsInLastSecond + 1)
    } else {
      requestTimestamps.set(key, now)
      requestTimestamps.set(`${key}_count`, 1)
    }
  } else {
    requestTimestamps.set(key, now)
    requestTimestamps.set(`${key}_count`, 1)
  }
  
  return true
}

function validateRequestData(config: InternalAxiosRequestConfig): boolean {
  const data = config.data as Record<string, unknown> | undefined
  
  if (!data) return true
  
  const sensitiveFields = ['password', 'token', 'secret', 'key']
  
  for (const field of sensitiveFields) {
    if (data[field] && typeof data[field] === 'string') {
      const value = data[field] as string
      if (value.length < 8) {
        console.error(`Security error: ${field} is too short`)
        return false
      }
      if (value.length > 128) {
        console.error(`Security error: ${field} is too long`)
        return false
      }
    }
  }
  
  return true
}

const publicPaths = ['/auth/login', '/auth/register', '/auth/wechat']

http.interceptors.request.use((config) => {
  const url = config.url || ''
  
  if (!validateRequestFrequency(url)) {
    throw new Error('请求过于频繁，请稍后重试')
  }
  
  if (!validateRequestData(config)) {
    throw new Error('请求数据验证失败')
  }
  
  if (config.data) {
    config.data = sanitizeInput(config.data)
  }
  
  if (config.params) {
    config.params = sanitizeInput(config.params) as Record<string, string>
  }
  
  const headers = AxiosHeaders.from(config.headers)
  
  const token = tokenStorage.get()
  if (token && !publicPaths.some(path => url.includes(path))) {
    if (!validateToken()) {
      throw new Error('登录已失效，请重新登录')
    }
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  headers.set('Content-Type', 'application/json')
  headers.set('X-Requested-With', 'XMLHttpRequest')
  
  const csrfToken = localStorage.getItem('csrfToken')
  if (csrfToken) {
    headers.set('X-CSRF-Token', csrfToken)
  }
  
  config.headers = headers
  
  return config
})

http.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === 'object') {
      res.data = sanitizeInput(res.data)
    }
    
    return res
  },
  (err: unknown) => {
    const normalized: ApiError = normalizeApiError(err)
    
    if (normalized.status === 401) {
      tokenStorage.clear()
      localStorage.removeItem('tokenExpires')
      localStorage.removeItem('nickname')
      localStorage.removeItem('avatar')
    }
    
    return Promise.reject(Object.assign(new Error(normalized.message), { api: normalized }))
  },
)

function normalizeApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const ae = err as AxiosError<any>
    const status = ae.response?.status
    const data = ae.response?.data

    let message = ae.message || '请求失败'
    
    if (data?.msg) {
      message = data.msg
    } else if (data?.message) {
      message = data.message
    } else if (status === 401) {
      message = '登录失败，请检查账号密码'
    } else if (status === 403) {
      message = '无权访问该资源'
    } else if (status === 429) {
      message = '请求过于频繁，请稍后重试'
    } else if (status === 500) {
      message = '服务器内部错误'
    }

    return {
      message,
      status,
      code: data?.code,
      details: data,
    }
  }

  if (err instanceof Error) {
    return { message: err.message }
  }

  return { message: '未知错误' }
}

export function generateRequestSignature(params: Record<string, unknown>): string {
  const sortedKeys = Object.keys(params).sort()
  const queryString = sortedKeys.map(key => `${key}=${encodeURIComponent(String(params[key]))}`).join('&')
  return btoa(queryString)
}