import { http } from './http'

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
    console.log(http.post<AuthResponse>('/auth/login', input))
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
}