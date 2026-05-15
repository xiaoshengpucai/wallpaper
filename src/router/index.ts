import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { progress } from '../utils/progress'

/** 与 `router.push({ name })` 保持一致，避免手写字符串分散在各处 */
export const ROUTE_NAME_WALLPAPER_DETAIL = 'WallpaperDetail'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/pc' },
  { path: '/community', component: () => import('../views/CommunityPage.vue'), meta: { title: '壁纸社区' } },
  { path: '/pc', component: () => import('../views/PcWallpapersPage.vue'), meta: { title: '电脑壁纸' } },
  { path: '/mobile', component: () => import('../views/MobileWallpapersPage.vue'), meta: { title: '手机壁纸' } },
  {
    path: '/wallpaper/:id',
    name: ROUTE_NAME_WALLPAPER_DETAIL,
    component: () => import('../views/WallpaperDetailPage.vue'),
    meta: { title: '壁纸详情' },
  },
  { path: '/avatar', component: () => import('../views/AvatarMakerPage.vue'), meta: { title: '头像制作' } },
  { path: '/download', component: () => import('../views/DownloadPage.vue'), meta: { title: '哲风壁纸下载' } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, from) => {
  if (to.fullPath !== from.fullPath) progress.start()
  return true
})

router.afterEach(() => {
  progress.done()
})

