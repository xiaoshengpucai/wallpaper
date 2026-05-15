import { defineStore } from 'pinia'

import { authApi } from '../api/auth'
import { tokenStorage } from '../utils/tokenStorage'

type WallpaperCollection = {
  count: number
  wallpapers: string[]
}

export type AuthUser = {
  id: string
  email: string | null
  phone: string
  nickname: string
  avatar: string
  role: string
  totalLikes: number
  totalFavorites: number
  likes: {
    pc: WallpaperCollection
    mobile: WallpaperCollection
  }
  favorites: {
    pc: WallpaperCollection
    mobile: WallpaperCollection
  }
}

const USER_KEY = 'wallpaper.user'

type AuthState = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  lastError: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    lastError: null,
  }),
  getters: {
    isAuthenticated: (s) => Boolean(s.token),
  },
  actions: {
    hydrate() {
      const token = tokenStorage.get()
      if (token) this.token = token
      
      try {
        const userStr = localStorage.getItem(USER_KEY)
        if (userStr) {
          this.user = JSON.parse(userStr) as AuthUser
        }
      } catch {
        this.user = null
      }
    },
    saveUser(user: AuthUser) {
      this.user = user
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      } catch {
        // ignore
      }
    },
    async login(input: { account: string; password: string }) {
      this.loading = true
      this.lastError = null
      try {
        const res = await authApi.login(input)
        
        this.token = res.token
        this.saveUser(res.user)
        tokenStorage.set(res.token)
      } catch (e) {
        this.lastError = e instanceof Error ? e.message : '登录失败'
        throw e
      } finally {
        this.loading = false
      }
    },
    async register(input: { account: string; password: string; nickname: string }) {
      this.loading = true
      this.lastError = null
      try {
        const res = await authApi.register(input)
        this.token = res.token
        this.saveUser(res.user)
        tokenStorage.set(res.token)
      } catch (e) {
        this.lastError = e instanceof Error ? e.message : '注册失败'
        throw e
      } finally {
        this.loading = false
      }
    },
    async getCurrentUser() {
      if (!this.token) {
        const token = tokenStorage.get()
        if (token) {
          this.token = token
        } else {
          throw new Error('未登录')
        }
      }
      
      this.loading = true
      this.lastError = null
      try {
        const user = await authApi.getCurrentUser()
        this.saveUser(user)
        return user
      } catch (e) {
        this.lastError = e instanceof Error ? e.message : '获取用户信息失败'
        throw e
      } finally {
        this.loading = false
      }
    },
    async logout() {
      this.user = null
      this.token = null
      this.lastError = null
      tokenStorage.clear()
      try {
        localStorage.removeItem(USER_KEY)
      } catch {
        // ignore
      }
    },
    async wechatLogin(input: { code: string }) {
      this.loading = true
      this.lastError = null
      try {
        const res = await authApi.wechatLogin(input)
        this.token = res.token
        this.saveUser(res.user)
        tokenStorage.set(res.token)
      } catch (e) {
        this.lastError = e instanceof Error ? e.message : '微信登录失败'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})