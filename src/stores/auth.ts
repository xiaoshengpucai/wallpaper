import { defineStore } from 'pinia'

import { authApi } from '../api/auth'
import { toggleWallpaperCollection, fetchUserCollections, type CollectionItem } from '../api/wallpapers'
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
  gender?: 'male' | 'female' | 'unknown' | string
  bio?: string
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
  /** 用户收藏列表（由 /api/v1/auth/collections 返回） */
  collections: CollectionItem[]
  /** collections 是否已加载过（避免重复请求） */
  collectionsLoaded: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    lastError: null,
    collections: [],
    collectionsLoaded: false,
  }),
  getters: {
      isAuthenticated: (s) => Boolean(s.token),
      /** 判断某壁纸是否已收藏 */
      isWallpaperCollected: (s) => {
        return (wallpaperId: string | number) => {
          const id = String(wallpaperId)
          // 同时检查 collections 和 user.favorites，任一命中即为已收藏
          if (s.collections.length > 0) {
            if (s.collections.some((c) => String(c.wallpaperId) === id)) return true
          }
          const pcIds = (s.user?.favorites?.pc?.wallpapers ?? []).map(String)
          const mobileIds = (s.user?.favorites?.mobile?.wallpapers ?? []).map(String)
          return pcIds.includes(id) || mobileIds.includes(id)
        }
      },
      /** 按设备类型过滤的收藏列表 */
      collectionsByDevice: (s) => {
        return (deviceType: 'pc' | 'mobile') =>
          s.collections.filter((c) => c.deviceType === deviceType)
      },
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
      this.collections = []
      this.collectionsLoaded = false
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

    /**
     * 收藏/取消收藏壁纸，同步更新本地 collections 列表。
     * @returns `{ collected }` — true=已收藏，false=已取消
     */
    async toggleCollection(payload: {
      url: string
      wallpaperId?: string | number
      title?: string
      deviceType?: 'pc' | 'mobile'
    }) {
      const res = await toggleWallpaperCollection(payload)
      // 用后端返回的最新列表替换本地
      this.collections = res.collections
      this.collectionsLoaded = true
      // 同步 user.favorites 计数
      if (this.user) {
        const pcCount = res.collections.filter((c) => c.deviceType === 'pc').length
        const mobileCount = res.collections.filter((c) => c.deviceType === 'mobile').length
        this.user.favorites.pc.count = pcCount
        this.user.favorites.pc.wallpapers = res.collections
          .filter((c) => c.deviceType === 'pc' && c.wallpaperId)
          .map((c) => c.wallpaperId!)
        this.user.favorites.mobile.count = mobileCount
        this.user.favorites.mobile.wallpapers = res.collections
          .filter((c) => c.deviceType === 'mobile' && c.wallpaperId)
          .map((c) => c.wallpaperId!)
        this.saveUser(this.user)
      }
      return { collected: res.collected }
    },

    /** 设置 collections（用于登录后从 getCurrentUser 初始化） */
    setCollections(items: CollectionItem[]) {
      this.collections = items
    },

    /** 从后端拉取最新收藏列表并同步 user.favorites（force=true 强制刷新） */
    async loadCollections(force = false) {
      if (!this.token) return
      if (this.collectionsLoaded && !force) return
      try {
        const items = await fetchUserCollections()
        this.collections = items
        this.collectionsLoaded = true
        if (this.user) {
          this.user.favorites.pc.wallpapers = items
            .filter((c) => c.deviceType === 'pc' && c.wallpaperId)
            .map((c) => c.wallpaperId!)
          this.user.favorites.pc.count = this.user.favorites.pc.wallpapers.length
          this.user.favorites.mobile.wallpapers = items
            .filter((c) => c.deviceType === 'mobile' && c.wallpaperId)
            .map((c) => c.wallpaperId!)
          this.user.favorites.mobile.count = this.user.favorites.mobile.wallpapers.length
          this.saveUser(this.user)
        }
      } catch {
        // 静默失败，不影响页面展示
      }
    },

    /** 更新用户资料 */
    async updateProfile(fields: {
      nickname?: string
      email?: string
      gender?: string
      bio?: string
      avatar?: string
    }) {
      const res = await authApi.updateProfile(fields)
      // 如果后端返回了完整用户对象，直接使用；否则只合并字段
      if (this.user) {
        const hasFullUser = res && typeof res === 'object' && 'id' in res && 'nickname' in res
        if (hasFullUser) {
          this.saveUser(res)
        } else {
          this.saveUser({ ...this.user, ...fields } as AuthUser)
        }
      }
    },
  },
})