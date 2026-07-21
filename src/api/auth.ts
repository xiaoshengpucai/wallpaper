import { http } from './http'

import { tokenStorage } from '../utils/tokenStorage'
import type { AuthUser } from '../stores/auth'

export type AuthResponse = {
  token: string
  user: AuthUser
}

export type ApiResponse<T = unknown> = {
  code: number
  msg: string
  data: T
}

function isApiResponse(resp: unknown): resp is ApiResponse<unknown> {
  return typeof resp === 'object' && resp !== null && 'code' in resp && 'msg' in resp
}

export const authApi = {
  async login(input: { account: string; password: string }): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/login', input)
    if (isApiResponse(data)) {
      if (data.code !== 0 && data.code !== 200) {
        throw new Error(data.msg || '登录失败')
      }
      return data.data as AuthResponse
    }
    
    return data
  },
  async register(input: { account: string; password: string; nickname: string }): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/register', input)
    
    if (isApiResponse(data)) {
      if (data.code !== 0 && data.code !== 201) {
        throw new Error(data.msg || '注册失败')
      }
      return data.data as AuthResponse
    }
    
    return data
  },
  async getCurrentUser(): Promise<AuthUser> {
    const { data } = await http.get<AuthUser>('/auth/me')
    
    if (isApiResponse(data)) {
      if (data.code !== 0 && data.code !== 200) {
        throw new Error(data.msg || '获取用户信息失败')
      }
      const inner = data.data as Record<string, unknown>
      if (inner && typeof inner === 'object' && 'user' in inner) {
        return inner.user as AuthUser
      }
      return data.data as AuthUser
    }
    
    return data
  },
  async wechatLogin(input: { code: string }): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/wechat', input)
    
    if (isApiResponse(data)) {
      if (data.code !== 0 && data.code !== 200) {
        throw new Error(data.msg || '微信登录失败')
      }
      return data.data as AuthResponse
    }
    
    return data
  },

  /** 更新用户资料 PUT /api/v1/auth/me */
  async updateProfile(fields: {
    nickname?: string
    email?: string
    gender?: string
    bio?: string
    avatar?: string
    background?: string
  }): Promise<AuthUser> {
    const { data } = await http.put<AuthUser>('/auth/me', fields)

    if (isApiResponse(data)) {
      if (data.code !== 0 && data.code !== 200) {
        throw new Error(data.msg || '更新资料失败')
      }
      const inner = data.data as Record<string, unknown>
      if (inner && typeof inner === 'object' && 'user' in inner) {
        return inner.user as AuthUser
      }
      return data.data as AuthUser
    }

    return data
  },

  /**
   * 上传图片文件（二进制），返回图片访问 URL。
   * 走 multipart/form-data，不经 JSON，避免 base64 撑大请求体。
   * @param file 二进制图片数据
   * @param type 图片用途，后端可据此分目录存储
   * @returns 图片 URL
   */
  async uploadImage(file: Blob, type: 'avatar' | 'background'): Promise<string> {
    const formData = new FormData()
    formData.append('file', file, `${type}.jpg`)
    formData.append('type', type)

    const token = tokenStorage.get()
    const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

    const res = await fetch(`${baseURL}/upload/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      // 注意：不要手动设置 Content-Type，浏览器会自动带 boundary
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `上传失败 (${res.status})`)
    }

    const json = await res.json()
    if (isApiResponse(json)) {
      if (json.code !== 0 && json.code !== 200) {
        throw new Error(json.msg || '上传失败')
      }
      const inner = json.data as Record<string, unknown>
      // 后端可能返回 { url } 或 { url, ... }
      if (inner && typeof inner === 'object' && 'url' in inner) {
        return inner.url as string
      }
      return json.data as unknown as string
    }

    // 兼容直接返回 { url: "..." }
    if (json && typeof json === 'object' && 'url' in json) {
      return (json as { url: string }).url
    }

    throw new Error('上传响应格式异常')
  },
}