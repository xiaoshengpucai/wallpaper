<template>
  <div class="profile-page flex w-full gap-20 max-[899px]:flex-col">
    <!-- 左侧面板：分享圈 -->
    <div class="profile-share-panel w-[400px] h-[600px] shrink-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm max-[899px]:w-full">
      <!-- 标题栏 -->
      <div class="border-b border-white/10 px-5 py-3">
        <span class="text-sm font-semibold text-white/80">
          【{{ user?.nickname || '用户' }}】的分享圈
        </span>
      </div>
      <!-- 空状态 -->
      <div class="flex min-h-[350px] flex-col items-center justify-center px-4 py-10">
        <div class="relative">
          <svg class="h-32 w-32 text-white/15" viewBox="0 0 120 120" fill="none">
            <rect x="20" y="15" width="50" height="60" rx="7" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(-10 45 45)" />
            <rect x="50" y="15" width="50" height="60" rx="7" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(10 75 45)" />
            <rect x="30" y="18" width="58" height="64" rx="7" stroke="currentColor" stroke-width="2.5" fill="none" />
            <circle cx="59" cy="42" r="9" stroke="currentColor" stroke-width="2" fill="none" />
            <circle cx="59" cy="40" r="3.5" fill="currentColor" opacity="0.4" />
            <path d="M48 54 C48 50 52 47 59 47 C66 47 70 50 70 54" stroke="currentColor" stroke-width="1.8" fill="none" />
            <line x1="14" y1="42" x2="14" y2="52" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <line x1="9" y1="47" x2="19" y2="47" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <line x1="106" y1="42" x2="106" y2="52" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <line x1="101" y1="47" x2="111" y2="47" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <circle cx="90" cy="24" r="2" fill="currentColor" opacity="0.3" />
            <ellipse cx="59" cy="98" rx="22" ry="5" fill="currentColor" opacity="0.15" />
          </svg>
        </div>
        <span class="mt-4 text-sm text-white/25">空空如也</span>
      </div>
    </div>

    <!-- 右侧面板：个人主页主体 -->
    <div class="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <!-- 顶部 Banner -->
      <div class="profile-banner relative h-[180px] w-full overflow-hidden sm:h-[200px]">
        <div class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: bannerBg }" />
        <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

        <!-- 用户信息 -->
        <div class="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-10 sm:px-8">
          <div class="flex items-end gap-4">
            <div class="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/40 shadow-lg sm:h-16 sm:w-16">
              <img v-if="user?.avatar" :src="user.avatar" :alt="user.nickname" class="h-full w-full object-cover" />
              <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/50 to-purple-500/50">
                <span class="text-xl font-bold text-white/80">{{ (user?.nickname || '?').slice(0, 1) }}</span>
              </div>
            </div>
            <div class="min-w-0 pb-0.5">
              <div class="flex items-center gap-2">
                <h1 class="truncate text-base font-bold text-white drop-shadow sm:text-lg">
                  {{ user?.nickname || '未登录' }}
                </h1>
                <span v-if="user?.role" class="shrink-0 rounded bg-amber-500/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {{ user.role }}
                </span>
              </div>
              <p class="mt-0.5 truncate text-xs text-white/60">
                签名：{{ user?.bio || '这个家伙很懒，什么也没有写' }}
              </p>
            </div>
          </div>
          <div class="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span class="text-red-400">发帖 <b>{{ stats.posts }}</b></span>
            <span class="text-white/70">分享 <b class="text-white">{{ stats.shares }}</b></span>
            <span class="text-white/70">获赞 <b class="text-white">{{ stats.likes }}</b></span>
            <span class="text-white/70">获赏 <b class="text-white">{{ stats.rewards }}</b></span>
            <span class="text-white/70">关注 <b class="text-white">{{ stats.following }}</b></span>
            <span class="text-white/70">粉丝 <b class="text-white">{{ stats.followers }}</b></span>
          </div>
        </div>
      </div>

      <!-- Tab 导航 -->
      <div class="profile-tabs border-b border-white/10">
        <div class="flex gap-0 overflow-x-auto px-4 sm:px-6">
          <button v-for="tab in tabs" :key="tab.key" type="button"
            class="relative shrink-0 px-3.5 py-2.5 text-sm transition-colors"
            :class="activeTab === tab.key
              ? 'text-white font-semibold'
              : 'text-white/40 hover:text-white/70'"
            @click="activeTab = tab.key">
            {{ tab.label }}
            <div v-if="activeTab === tab.key"
              class="absolute bottom-0 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-blue-400" />
          </button>
        </div>
      </div>

      <!-- 主体内容：左过滤 + 右内容 -->
      <div class="flex w-full">
        <!-- 左侧过滤栏 -->
        <aside class="hidden w-[120px] shrink-0 border-r border-white/10 px-2.5 pt-4 sm:block">
          <button v-for="filter in filters" :key="filter.key" type="button"
            class="mb-1.5 w-full rounded-lg px-3 py-2 text-left text-xs transition-colors"
            :class="activeFilter === filter.key
              ? 'bg-white/15 text-white font-semibold'
              : 'text-white/40 hover:bg-white/8 hover:text-white/60'"
            @click="activeFilter = filter.key">
            {{ filter.label }}
          </button>
        </aside>

        <!-- 右侧内容区 -->
        <div class="min-h-[350px] w-full flex-1 overflow-hidden p-4 sm:p-6">
          <!-- 收藏 Tab -->
          <template v-if="activeTab === 'favorites'">
            <!-- PC / 手机 切换按钮 -->
            <div class="mb-4 flex gap-2">
              <button type="button"
                class="rounded-lg px-4 py-1.5 text-xs font-medium transition-colors"
                :class="favKind === 'pc'
                  ? 'bg-blue-500/80 text-white shadow-md'
                  : 'border border-white/15 text-white/50 hover:bg-white/10 hover:text-white/80'"
                @click="favKind = 'pc'">
                <svg class="mr-1 inline-block h-3.5 w-3.5 align-[-2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                PC壁纸
                <span class="ml-1 text-[10px] opacity-70">({{ pcFavCount }})</span>
              </button>
              <button type="button"
                class="rounded-lg px-4 py-1.5 text-xs font-medium transition-colors"
                :class="favKind === 'mobile'
                  ? 'bg-blue-500/80 text-white shadow-md'
                  : 'border border-white/15 text-white/50 hover:bg-white/10 hover:text-white/80'"
                @click="favKind = 'mobile'">
                <svg class="mr-1 inline-block h-3.5 w-3.5 align-[-2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <path d="M12 18h.01" />
                </svg>
                手机壁纸
                <span class="ml-1 text-[10px] opacity-70">({{ mobileFavCount }})</span>
              </button>
            </div>

            <!-- PC 收藏：TiltedCard 网格，每页最多12张 -->
            <template v-if="favKind === 'pc'">
              <div v-if="pcFavItems.length > 0">
                <div class="grid grid-cols-3 gap-4 max-[899px]:grid-cols-2 max-[899px]:gap-3">
                  <div v-for="item in pcPagedItems" :key="item.id"
                    class="aspect-[4/3] w-full cursor-pointer overflow-visible rounded-2xl"
                    @click="goWallpaperDetail(item)">
                    <TiltedCard
                      :image-src="item.imageUrl"
                      :alt-text="item.title ?? '壁纸'"
                      :caption-text="item.title || `壁纸 #${item.id}`"
                      container-width="100%"
                      container-height="100%"
                      image-width="100%"
                      image-height="100%"
                      :rotate-amplitude="14"
                      :scale-on-hover="1"
                      :show-tooltip="true"
                      :display-overlay-content="true"
                    >
                      <template #overlay>
                        <WallpaperHoverOverlay
                          :wallpaper-id="item.id"
                          :image-url="item.imageUrl"
                          :original-url="item.originalUrl"
                          :download-url="item.downloadUrl"
                          :tags="item.tags ?? []"
                          :classification-tags="item.classificationTags ?? []"
                          :favorite-count="item.favoriteCount"
                          :download-count="item.downloadCount"
                          :is-favorited="true"
                          :resolution="item.resolution"
                          :file-size-label="item.fileSizeLabel"
                        />
                      </template>
                    </TiltedCard>
                  </div>
                </div>
                <!-- 分页 -->
                <div v-if="pcTotalPages > 1" class="mt-4 flex items-center justify-center gap-2">
                  <button type="button"
                    class="rounded-md px-3 py-1 text-xs transition-colors"
                    :class="pcPage === 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:bg-white/10'"
                    :disabled="pcPage === 1"
                    @click="pcPage--">
                    上一页
                  </button>
                  <button v-for="p in pcTotalPages" :key="p" type="button"
                    class="h-7 w-7 rounded-md text-xs transition-colors"
                    :class="p === pcPage
                      ? 'bg-blue-500/80 text-white'
                      : 'text-white/50 hover:bg-white/10'"
                    @click="pcPage = p">
                    {{ p }}
                  </button>
                  <button type="button"
                    class="rounded-md px-3 py-1 text-xs transition-colors"
                    :class="pcPage === pcTotalPages ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:bg-white/10'"
                    :disabled="pcPage === pcTotalPages"
                    @click="pcPage++">
                    下一页
                  </button>
                </div>
              </div>
              <ProfileEmptyState v-else />
            </template>

            <!-- 手机收藏：瀑布流（内部滚动） -->
            <template v-else>
              <div v-if="mobileFavItems.length > 0" class="profile-mobile-scroll -mx-4 -mb-4 overflow-y-auto sm:-mx-6 sm:-mb-6" style="max-height: 520px;">
                <div class="px-4 py-2 sm:px-6">
                  <WallpaperMasonry
                    class="w-full"
                    measure-wrap-class="max-w-none px-0"
                    :items="mobileFavItems"
                    :fixed-columns="5"
                    :has-more="false"
                    :loading="false"
                    :duration="0.6"
                    :stagger="0.05"
                    animate-from="bottom"
                    :scale-on-hover="true"
                    :hover-scale="0.95"
                    :blur-to-focus="true"
                    :color-shift-on-hover="false"
                    @tile-click="goWallpaperDetail"
                  />
                </div>
              </div>
              <ProfileEmptyState v-else />
            </template>
          </template>

          <!-- 资料信息 Tab -->
          <template v-else-if="activeTab === 'info'">
            <div class="relative">
              <!-- 编辑按钮 -->
              <button v-if="!profileEditing" type="button"
                class="absolute right-0 top-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                @click="startEditProfile">
                <svg class="mr-1 inline-block h-3.5 w-3.5 align-[-2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                编辑资料
              </button>
              <!-- 保存/取消按钮 -->
              <div v-else class="absolute right-0 top-0 flex gap-2">
                <button type="button"
                  class="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  :disabled="profileSaving"
                  @click="cancelEditProfile">
                  取消
                </button>
                <button type="button"
                  class="rounded-lg bg-blue-500/80 px-3 py-1.5 text-xs text-white shadow-md transition-colors hover:bg-blue-500"
                  :disabled="profileSaving"
                  @click="saveProfile">
                  {{ profileSaving ? '保存中...' : '保存' }}
                </button>
              </div>

              <!-- 表单字段 -->
              <div class="space-y-5 pt-2">
                <!-- 昵称 -->
                <div class="flex items-start gap-4">
                  <label class="w-20 shrink-0 pt-2 text-xs text-white/50">昵称</label>
                  <div v-if="!profileEditing" class="pt-2 text-sm text-white/90">{{ user?.nickname || '—' }}</div>
                  <input v-else v-model="profileForm.nickname" type="text" placeholder="请输入昵称"
                    class="w-[50%] rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none transition-colors placeholder:text-white/30 focus:border-blue-400/50 focus:bg-white/8" />
                </div>
                <!-- 邮箱 -->
                <div class="flex items-start gap-4">
                  <label class="w-20 shrink-0 pt-2 text-xs text-white/50">邮箱</label>
                  <div v-if="!profileEditing" class="pt-2 text-sm text-white/90">{{ user?.email || '—' }}</div>
                  <input v-else v-model="profileForm.email" type="email" placeholder="请输入邮箱"
                    class="w-[50%] rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none transition-colors placeholder:text-white/30 focus:border-blue-400/50 focus:bg-white/8" />
                </div>
                <!-- 性别 -->
                <div class="flex items-start gap-4">
                  <label class="w-20 shrink-0 pt-2 text-xs text-white/50">性别</label>
                  <div v-if="!profileEditing" class="pt-2 text-sm text-white/90">{{ genderLabel }}</div>
                  <div v-else class="flex gap-3 pt-1.5">
                    <button type="button" v-for="opt in genderOptions" :key="opt.value"
                      class=" rounded-lg border px-3 py-1.5 text-xs transition-colors"
                      :class="profileForm.gender === opt.value
                        ? 'border-blue-400/50 bg-blue-500/20 text-white'
                        : 'border-white/15 text-white/50 hover:bg-white/10'"
                      @click="profileForm.gender = opt.value">
                      {{ opt.label }}
                    </button>
                  </div>
                </div>
                <!-- 个性签名 -->
                <div class="flex items-start gap-4">
                  <label class="w-20 shrink-0 pt-2 text-xs text-white/50">个性签名</label>
                  <div v-if="!profileEditing" class="pt-2 text-sm text-white/90 whitespace-pre-wrap">{{ user?.bio || '—' }}</div>
                  <textarea v-else v-model="profileForm.bio" placeholder="写点什么介绍自己吧..." rows="3"
                    class="w-[50%] h-12 resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none transition-colors placeholder:text-white/30 focus:border-blue-400/50 focus:bg-white/8" />
                </div>
              </div>
            </div>
          </template>

          <!-- 其他 Tab：空状态 -->
          <ProfileEmptyState v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type AuthUser } from '../stores/auth'
import { type WallpaperItem, fetchWallpapersPage, fetchMobileWallpapersPage } from '../api/wallpapers'
import { cacheWallpaperForDetail } from '../utils/wallpaperDetailCache'
import { ROUTE_NAME_WALLPAPER_DETAIL } from '../router'
import ProfileEmptyState from '../components/profile/ProfileEmptyState.vue'

const TiltedCard = defineAsyncComponent(() => import('../components/TiltedCard.vue'))
const WallpaperHoverOverlay = defineAsyncComponent(() => import('../components/WallpaperHoverOverlay.vue'))
const WallpaperMasonry = defineAsyncComponent(() => import('../components/WallpaperMasonry.vue'))

const router = useRouter()
const authStore = useAuthStore()

// 进入个人主页时刷新收藏列表（不重新拉 getCurrentUser，避免 401 清除登录态）
onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.loadCollections()
  }
})

const user = computed<AuthUser | null>(() => authStore.user)

const stats = computed(() => ({
  posts: 0,
  shares: 0,
  likes: user.value?.totalLikes ?? 0,
  rewards: 0,
  following: 0,
  followers: 0,
}))

const bannerBg = computed(() => {
  if (user.value?.avatar) {
    return `url(${JSON.stringify(user.value.avatar)})`
  }
  return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
})

type TabKey = 'posts' | 'favorites' | 'following' | 'followers' | 'info'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'posts', label: '帖子' },
  { key: 'favorites', label: '收藏' },
  { key: 'following', label: '关注' },
  { key: 'followers', label: '粉丝' },
  { key: 'info', label: '资料信息' },
]

const activeTab = ref<TabKey>('posts')

type FilterKey = 'recent' | 'top-likes' | 'top-favorites' | 'earliest'

const filters: { key: FilterKey; label: string }[] = [
  { key: 'recent', label: '最近的' },
  { key: 'top-likes', label: '达赞量' },
  { key: 'top-favorites', label: '收藏量' },
  { key: 'earliest', label: '早期的' },
]

const activeFilter = ref<FilterKey>('recent')

// ---- 收藏相关 ----
type FavKind = 'pc' | 'mobile'
const favKind = ref<FavKind>('pc')

// 从 user.favorites 读取收藏 ID（toggleCollection 会同步更新此数据）
const pcFavIds = computed(() => user.value?.favorites?.pc?.wallpapers ?? [])
const mobileFavIds = computed(() => user.value?.favorites?.mobile?.wallpapers ?? [])
const pcFavCount = computed(() => user.value?.favorites?.pc?.count ?? 0)
const mobileFavCount = computed(() => user.value?.favorites?.mobile?.count ?? 0)

// 收藏壁纸完整数据（通过 API 获取）
const pcFavItems = ref<WallpaperItem[]>([])
const mobileFavItems = ref<WallpaperItem[]>([])
const favLoading = ref(false)

// PC 收藏分页
const PC_PAGE_SIZE = 12
const pcPage = ref(1)
const pcTotalPages = computed(() => Math.max(1, Math.ceil(pcFavItems.value.length / PC_PAGE_SIZE)))
const pcPagedItems = computed(() => {
  const start = (pcPage.value - 1) * PC_PAGE_SIZE
  return pcFavItems.value.slice(start, start + PC_PAGE_SIZE)
})

async function loadPcFavorites() {
  if (pcFavIds.value.length === 0) {
    pcFavItems.value = []
    pcPage.value = 1
    return
  }
  favLoading.value = true
  try {
    const res = await fetchWallpapersPage({
      page: 1,
      pageSize: pcFavIds.value.length,
      ids: pcFavIds.value,
    })
    pcFavItems.value = res.items
  } catch {
    pcFavItems.value = []
  } finally {
    favLoading.value = false
  }
}

async function loadMobileFavorites() {
  if (mobileFavIds.value.length === 0) {
    mobileFavItems.value = []
    return
  }
  favLoading.value = true
  try {
    const res = await fetchMobileWallpapersPage({
      page: 1,
      pageSize: mobileFavIds.value.length,
      ids: mobileFavIds.value,
    })
    mobileFavItems.value = res.items
  } catch {
    mobileFavItems.value = []
  } finally {
    favLoading.value = false
  }
}

// 切换到收藏 Tab 或切换 PC/手机时加载数据
watch([activeTab, favKind], ([tab, kind]) => {
  if (tab !== 'favorites') return
  if (kind === 'pc') loadPcFavorites()
  else loadMobileFavorites()
}, { immediate: true })

// 收藏 ID 列表变化时（取消收藏后 user.favorites 更新），同步过滤已加载的壁纸
watch(pcFavIds, (ids) => {
  if (activeTab.value !== 'favorites' || favKind.value !== 'pc') return
  const idSet = new Set(ids.map(String))
  const filtered = pcFavItems.value.filter((item) => idSet.has(String(item.id)))
  if (filtered.length !== pcFavItems.value.length) {
    pcFavItems.value = filtered
  }
})
watch(mobileFavIds, (ids) => {
  if (activeTab.value !== 'favorites' || favKind.value !== 'mobile') return
  const idSet = new Set(ids.map(String))
  const filtered = mobileFavItems.value.filter((item) => idSet.has(String(item.id)))
  if (filtered.length !== mobileFavItems.value.length) {
    mobileFavItems.value = filtered
  }
})

function goWallpaperDetail(item: WallpaperItem) {
  const kind = favKind.value === 'pc' ? 'pc' : 'mobile'
  // 收藏状态由 authStore 实时判断，不在缓存中硬编码
  cacheWallpaperForDetail({ ...item, kind })
  router.push({ name: ROUTE_NAME_WALLPAPER_DETAIL, params: { id: item.id } })
}

// ---- 资料信息编辑 ----
const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'unknown', label: '保密' },
]

const genderLabel = computed(() => {
  const g = user.value?.gender
  if (g === 'male') return '男'
  if (g === 'female') return '女'
  return '保密'
})

const profileEditing = ref(false)
const profileSaving = ref(false)
const profileForm = ref({
  nickname: '',
  email: '',
  gender: 'unknown',
  bio: '',
})

function startEditProfile() {
  profileForm.value = {
    nickname: user.value?.nickname ?? '',
    email: user.value?.email ?? '',
    gender: user.value?.gender ?? 'unknown',
    bio: user.value?.bio ?? '',
  }
  profileEditing.value = true
}

function cancelEditProfile() {
  profileEditing.value = false
}

async function saveProfile() {
  profileSaving.value = true
  try {
    // 只发送与当前值不同的字段
    const diff: Record<string, string> = {}
    if (profileForm.value.nickname !== (user.value?.nickname ?? '')) diff.nickname = profileForm.value.nickname
    if (profileForm.value.email !== (user.value?.email ?? '')) diff.email = profileForm.value.email
    if (profileForm.value.gender !== (user.value?.gender ?? 'unknown')) diff.gender = profileForm.value.gender
    if (profileForm.value.bio !== (user.value?.bio ?? '')) diff.bio = profileForm.value.bio

    if (Object.keys(diff).length === 0) {
      profileEditing.value = false
      return
    }

    await authStore.updateProfile(diff)
    profileEditing.value = false
  } catch (e) {
    const msg = e instanceof Error ? e.message : '保存失败'
    window.alert(msg)
  } finally {
    profileSaving.value = false
  }
}
</script>

<style scoped>
.profile-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(40px) saturate(1.4);
  -webkit-backdrop-filter: blur(40px) saturate(1.4);
}

.profile-banner > * {
  position: relative;
  z-index: 1;
}

.profile-tabs {
  background: rgba(255, 255, 255, 0.03);
}

.profile-mobile-scroll::-webkit-scrollbar {
  width: 5px;
}
.profile-mobile-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.profile-mobile-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}
.profile-mobile-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
