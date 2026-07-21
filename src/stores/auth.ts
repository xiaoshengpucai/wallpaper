import { defineStore } from 'pinia'

import { authApi } from '../api/auth'
import { toggleWallpaperCollection, type CollectionItem } from '../api/wallpapers'
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
  /** 收藏总数（= collections.length，后端已改为数字） */
  totalFavorites: number
  /** 收藏总数（后端 favorites 现在是数字 = collections.length） */
  favorites: number
  /** 下载总数 */
  downloads: number
  /** 个人主页背景图 */
  background?: string
  likes: {
    pc: WallpaperCollection
    mobile: WallpaperCollection
  }
  /** 用户收藏的壁纸列表（收藏图片列表数据源） */
  collections: CollectionItem[]
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
      /** 用户收藏的壁纸列表（统一由 user.collections 提供） */
      collections: (s): CollectionItem[] => s.user?.collections ?? [],
      /** 判断某壁纸是否已收藏 */
      isWallpaperCollected: (s) => {
        return (wallpaperId: string | number) => {
          const id = String(wallpaperId)
          const list = s.user?.collections ?? []
          return list.some((c) => String(c.wallpaperId) === id)
        }
      },
      /** 按设备类型过滤的收藏列表 */
      collectionsByDevice: (s) => {
        return (deviceType: 'pc' | 'mobile') =>
          (s.user?.collections ?? []).filter((c) => c.deviceType === deviceType)
      },
    },
  actions: {
    hydrate() {
      const token = tokenStorage.get()
      console.log('[auth] hydrate - token exists:', !!token)
      if (token) {
        this.token = token
      } else {
        this.token = null
        this.user = null
        console.log('[auth] hydrate - no token, clearing user')
        return
      }
      
      try {
        const userStr = localStorage.getItem(USER_KEY)
        console.log('[auth] hydrate - userStr exists:', !!userStr)
        if (userStr) {
          const parsed = JSON.parse(userStr) as Record<string, unknown>
          console.log('[auth] hydrate - parsed user has id:', 'id' in parsed, 'has nickname:', 'nickname' in parsed)
          if (parsed && typeof parsed === 'object' && 'id' in parsed && 'nickname' in parsed) {
            const normalized: AuthUser = parsed as AuthUser
            if (!('collections' in parsed)) {
              normalized.collections = []
            }
            if (!('favorites' in parsed) || typeof parsed.favorites !== 'number') {
              normalized.favorites = 0
            }
            if (!('downloads' in parsed) || typeof parsed.downloads !== 'number') {
              normalized.downloads = 0
            }
            this.user = normalized
            console.log('[auth] hydrate - user restored:', normalized.nickname)
          } else {
            this.user = null
            console.log('[auth] hydrate - user missing id/nickname')
          }
        }
      } catch (err) {
        this.user = null
        console.log('[auth] hydrate - parse error:', err)
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
        console.log('[auth] getCurrentUser - calling API...')
        const user = await authApi.getCurrentUser()
        console.log('[auth] getCurrentUser - API response:', user && typeof user === 'object' ? user.nickname : user)
        if (user && typeof user === 'object' && 'id' in user && 'nickname' in user) {       this.saveUser(user)
          console.log('[auth] getCurrentUser - user saved:', user.nickname)
        } else {
          console.log('[auth] getCurrentUser - invalid user data, not saving')
        }
        return user
      } catch (e) {
        this.lastError = e instanceof Error ? e.message : '获取用户信息失败'
        console.log('[auth] getCurrentUser - error:', e instanceof Error ? e.message : e)
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

    /**
     * 收藏/取消收藏壁纸，同步更新本地 user.collections。
     * @returns `{ collected }` — true=已收藏，false=已取消
     */
    async toggleCollection(payload: {
      url: string
      wallpaperId?: string | number
      title?: string
      deviceType?: 'pc' | 'mobile'
    }) {
      const res = await toggleWallpaperCollection(payload)
      if (this.user) {
        this.user.collections = res.collections
        this.user.favorites = res.collections.length
        this.saveUser(this.user)
      }
      return { collected: res.collected }
    },

    /** 更新用户资料 */
    async updateProfile(fields: {
      nickname?: string
      email?: string
      gender?: string
      bio?: string
      avatar?: string
      background?: string
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