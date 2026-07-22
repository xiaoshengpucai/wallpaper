<template>
  <div class="profile-page flex w-full gap-5 max-[899px]:flex-col max-[899px]:items-center max-[899px]:gap-4"
    :data-theme="themeLight ? 'light' : 'dark'">
    <!-- 左侧面板：分享圈 -->
    <div
      class="profile-share-panel shrink-0 w-[40%] rounded-2xl border backdrop-blur-sm max-[899px]:order-2 max-[899px]:w-full"
      :class="themeLight ? 'border-slate-200 bg-white/80' : 'border-white/10 bg-white/5'"
      :style="{ height: 'clamp(400px, 45vh, 600px)' }">
      <!-- 标题栏 -->
      <div class="border-b" :class="themeLight ? 'border-slate-200' : 'border-white/10'"
        :style="{ padding: 'clamp(8px, 2vw, 12px) clamp(10px, 3vw, 20px)' }">
        <span class="font-semibold" :class="themeLight ? 'text-slate-700' : 'text-white/80'"
          :style="{ fontSize: 'clamp(12px, 1.8vw, 16px)' }">
          【{{ user?.nickname || '用户' }}】的分享圈
        </span>
      </div>
      <!-- 空状态 -->
      <div class="flex flex-col items-center justify-center"
        :style="{ padding: 'clamp(20px, 5vw, 40px)', minHeight: 'clamp(200px, 25vh, 350px)' }">
        <div class="relative">
          <svg :class="themeLight ? 'text-slate-200' : 'text-white/15'"
            :style="{ width: 'clamp(60px, 15vw, 120px)', height: 'clamp(60px, 15vw, 120px)' }" viewBox="0 0 120 120"
            fill="none">
            <rect x="20" y="15" width="50" height="60" rx="7" stroke="currentColor" stroke-width="2" fill="none"
              transform="rotate(-10 45 45)" />
            <rect x="50" y="15" width="50" height="60" rx="7" stroke="currentColor" stroke-width="2" fill="none"
              transform="rotate(10 75 45)" />
            <rect x="30" y="18" width="58" height="64" rx="7" stroke="currentColor" stroke-width="2.5" fill="none" />
            <circle cx="59" cy="42" r="9" stroke="currentColor" stroke-width="2" fill="none" />
            <circle cx="59" cy="40" r="3.5" fill="currentColor" opacity="0.4" />
            <path d="M48 54 C48 50 52 47 59 47 C66 47 70 50 70 54" stroke="currentColor" stroke-width="1.8"
              fill="none" />
            <line x1="14" y1="42" x2="14" y2="52" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <line x1="9" y1="47" x2="19" y2="47" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <line x1="106" y1="42" x2="106" y2="52" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <line x1="101" y1="47" x2="111" y2="47" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <circle cx="90" cy="24" r="2" fill="currentColor" opacity="0.3" />
            <ellipse cx="59" cy="98" rx="22" ry="5" fill="currentColor" opacity="0.15" />
          </svg>
        </div>
        <span :class="themeLight ? 'text-slate-400' : 'text-white/25'"
          :style="{ fontSize: 'clamp(12px, 1.5vw, 16px)', marginTop: 'clamp(8px, 2vw, 16px)' }">空空如也</span>
      </div>
    </div>

    <!-- 右侧面板：个人主页主体 -->
    <div class="flex-1 overflow-hidden rounded-2xl border backdrop-blur-sm max-[899px]:order-1 max-[899px]:w-full"
      :class="themeLight ? 'border-slate-200 bg-white/80' : 'border-white/10 bg-white/5'" style="overflow-x: hidden;">
      <!-- 顶部 Banner -->
      <div class="profile-banner group relative w-full overflow-hidden cursor-pointer"
        :style="{ height: 'clamp(120px, 20vh, 220px)' }" @click="openBackgroundUpload">
        <div class="profile-banner-bg absolute top-0 left-0 w-full h-full bg-cover bg-center"
          :style="{ backgroundImage: bannerBg }" />
        <div class="absolute inset-0"
          :class="themeLight ? 'bg-gradient-to-b from-black/10 via-transparent to-black/30' : 'bg-gradient-to-b from-black/20 via-transparent to-black/60'" />

        <!-- 用户信息 -->
        <div class="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-10 sm:px-8" style="z-index: 1;">
          <div class="flex items-center gap-4">
            <div class="relative shrink-0 overflow-hidden rounded-full border-2 shadow-lg cursor-pointer"
              :class="themeLight ? 'border-white/60' : 'border-white/40'"
              :style="{ width: 'clamp(50px, 8vw, 80px)', height: 'clamp(50px, 8vw, 80px)' }" style="z-index: 30;"
              @click.stop="openAvatarUpload" @mouseenter="onAvatarMouseEnter" @mouseleave="onAvatarMouseLeave">
              <img v-if="user?.avatar" :src="user.avatar" :alt="user.nickname" class="h-full w-full object-cover" />
              <div v-else class="flex h-full w-full items-center justify-center"
                :class="themeLight ? 'bg-gradient-to-br from-indigo-400/60 to-purple-400/60' : 'bg-gradient-to-br from-indigo-500/50 to-purple-500/50'">
                <span class="font-bold" :class="themeLight ? 'text-white/90' : 'text-white/80'"
                  :style="{ fontSize: 'clamp(14px, 3vw, 24px)' }">{{ (user?.nickname || '?').slice(0, 1) }}</span>
              </div>
              <!-- 头像蒙版 -->
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 hover:opacity-100">
                <div class="flex flex-col items-center gap-1">
                  <span class="font-medium text-white" :style="{ fontSize: 'clamp(8px, 1vw, 12px)' }">更换头像</span>
                </div>
              </div>
            </div>
            <div class="min-w-0 pb-1">
              <div class="flex items-center gap-2">
                <h1 class="truncate font-bold"
                  :class="themeLight ? 'text-white drop-shadow-md' : 'text-white drop-shadow'"
                  :style="{ fontSize: 'clamp(16px, 3vw, 24px)' }">
                  {{ user?.nickname || '未登录' }}
                </h1>
              </div>
              <p class="mt-0.5 truncate pt-1.5" :class="themeLight ? 'text-white/70' : 'text-white/60'"
                :style="{ fontSize: 'clamp(10px, 1.5vw, 14px)' }">
                签名：{{ user?.bio || '这个家伙很懒，什么也没有写' }}
              </p>
            </div>
          </div>
          <div class="mt-8 flex flex-wrap"
            :style="{ gap: 'clamp(4px, 1vw, 8px) clamp(8px, 2vw, 16px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }">
            <span :class="themeLight ? 'text-red-400' : 'text-red-400'">发帖 <b>{{ stats.posts }}</b></span>|
            <span :class="themeLight ? 'text-white/80' : 'text-white/70'">分享 <b
                :class="themeLight ? 'text-white' : 'text-white'">{{ stats.shares }}</b></span>|
            <span :class="themeLight ? 'text-white/80' : 'text-white/70'">获赞 <b
                :class="themeLight ? 'text-white' : 'text-white'">{{ stats.likes }}</b></span>|
            <span :class="themeLight ? 'text-white/80' : 'text-white/70'">获赏 <b
                :class="themeLight ? 'text-white' : 'text-white'">{{ stats.rewards }}</b></span>|
            <span :class="themeLight ? 'text-white/80' : 'text-white/70'">关注 <b
                :class="themeLight ? 'text-white' : 'text-white'">{{ stats.following }}</b></span>|
            <span :class="themeLight ? 'text-white/80' : 'text-white/70'">粉丝 <b
                :class="themeLight ? 'text-white' : 'text-white'">{{ stats.followers }}</b></span>
          </div>
        </div>

        <!-- 背景蒙版：覆盖整个 banner，group-hover 触发，头像 hover 时隐藏 -->
        <div
          class="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          :class="[isAvatarHovered ? 'opacity-0' : 'opacity-0 group-hover:opacity-100', themeLight ? 'bg-black/40' : 'bg-black/50']"
          style="z-index: 10;">
          <div class="flex flex-col items-center gap-2">
            <svg class="text-white" :style="{ width: 'clamp(24px, 4vw, 36px)', height: 'clamp(24px, 4vw, 36px)' }"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span class="font-medium text-white" :style="{ fontSize: 'clamp(12px, 2vw, 16px)' }">更换背景</span>
          </div>
        </div>
      </div>

      <!-- Tab 导航 -->
      <div class="profile-tabs border-b" :class="themeLight ? 'border-slate-200' : 'border-white/10'">
        <div class="flex gap-0 overflow-x-auto" :style="{ padding: 'clamp(4px, 1vw, 16px)' }">
          <button v-for="tab in tabs" :key="tab.key" type="button" class="relative shrink-0 transition-colors"
            :style="{ padding: 'clamp(6px, 1.2vw, 12px) clamp(8px, 2vw, 16px)', fontSize: 'clamp(12px, 1.5vw, 16px)' }"
            :class="activeTab === tab.key
              ? themeLight ? 'text-slate-800 font-semibold' : 'text-white font-semibold'
              : themeLight ? 'text-slate-500 hover:text-slate-700' : 'text-white/40 hover:text-white/70'"
            @click="activeTab = tab.key">
            {{ tab.label }}
            <div v-if="activeTab === tab.key" class="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
              :class="themeLight ? 'bg-blue-500' : 'bg-blue-400'"
              :style="{ height: 'clamp(2px, 0.3vw, 4px)', width: 'clamp(20px, 4vw, 28px)' }" />
          </button>
        </div>
      </div>

      <!-- 主体内容：左过滤 + 右内容 -->
      <div class="flex w-full">
        <!-- 左侧过滤栏 -->
        <aside class="hidden shrink-0 border-r sm:block" :class="themeLight ? 'border-slate-200' : 'border-white/10'"
          :style="{ width: 'clamp(80px, 8vw, 120px)', padding: 'clamp(8px, 2vw, 16px) clamp(4px, 1vw, 10px)' }">
          <button v-for="filter in filters" :key="filter.key" type="button"
            class="w-full rounded-lg text-left transition-colors"
            :style="{ marginBottom: 'clamp(4px, 1vw, 6px)', padding: 'clamp(6px, 1.2vw, 8px) clamp(8px, 1.5vw, 12px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
            :class="activeFilter === filter.key
              ? themeLight ? 'bg-blue-500/20 text-slate-800 font-semibold' : 'bg-white/15 text-white font-semibold'
              : themeLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700' : 'text-white/40 hover:bg-white/8 hover:text-white/60'"
            @click="activeFilter = filter.key">
            {{ filter.label }}
          </button>
        </aside>

        <!-- 右侧内容区 -->
        <div class="w-full flex-1 overflow-hidden"
          :style="{ padding: 'clamp(8px, 2vw, 24px)', minHeight: 'clamp(200px, 30vh, 350px)' }">
          <!-- 收藏 Tab -->
          <template v-if="activeTab === 'favorites'">
            <!-- PC / 手机 切换按钮 -->
            <div class="flex" :style="{ marginBottom: 'clamp(8px, 2vw, 16px)', gap: 'clamp(4px, 1vw, 8px)' }">
              <button type="button" class="rounded-lg font-medium transition-colors"
                :style="{ padding: 'clamp(6px, 1vw, 8px) clamp(8px, 2vw, 16px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                :class="favKind === 'pc'
                  ? 'bg-blue-500/80 text-white shadow-md'
                  : themeLight ? 'border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800' : 'border border-white/15 text-white/50 hover:bg-white/10 hover:text-white/80'"
                @click="favKind = 'pc'">
                <svg class="inline-block align-[-2px]"
                  :style="{ width: 'clamp(12px, 1.5vw, 16px)', height: 'clamp(12px, 1.5vw, 16px)', marginRight: 'clamp(4px, 0.5vw, 6px)' }"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                PC壁纸
                <span
                  :style="{ marginLeft: 'clamp(4px, 0.5vw, 6px)', fontSize: 'clamp(8px, 1vw, 12px)', opacity: 0.7 }">({{
                  pcFavCount }})</span>
              </button>
              <button type="button" class="rounded-lg font-medium transition-colors"
                :style="{ padding: 'clamp(6px, 1vw, 8px) clamp(8px, 2vw, 16px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                :class="favKind === 'mobile'
                  ? 'bg-blue-500/80 text-white shadow-md'
                  : themeLight ? 'border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800' : 'border border-white/15 text-white/50 hover:bg-white/10 hover:text-white/80'"
                @click="favKind = 'mobile'">
                <svg class="inline-block align-[-2px]"
                  :style="{ width: 'clamp(12px, 1.5vw, 16px)', height: 'clamp(12px, 1.5vw, 16px)', marginRight: 'clamp(4px, 0.5vw, 6px)' }"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <path d="M12 18h.01" />
                </svg>
                手机壁纸
                <span
                  :style="{ marginLeft: 'clamp(4px, 0.5vw, 6px)', fontSize: 'clamp(8px, 1vw, 12px)', opacity: 0.7 }">({{
                  mobileFavCount }})</span>
              </button>
            </div>

            <!-- PC 收藏：TiltedCard 网格，每页最多12张 -->
            <template v-if="favKind === 'pc'">
              <div v-if="pcFavItems.length > 0">
                <div
                  class="grid gap-4 transition-all duration-300 ease-out max-[899px]:grid-cols-2 max-[899px]:gap-3 min-[900px]:grid-cols-3 min-[1300px]:grid-cols-4">
                  <div v-for="item in pcPagedItems" :key="item.id"
                    class="aspect-[4/3] w-full cursor-pointer overflow-visible rounded-2xl"
                    @click="goWallpaperDetail(item)">
                    <TiltedCard :image-src="item.imageUrl" :alt-text="item.title ?? '壁纸'"
                      :caption-text="item.title || `壁纸 #${item.id}`" container-width="100%" container-height="100%"
                      image-width="100%" image-height="100%" :rotate-amplitude="14" :scale-on-hover="1"
                      :show-tooltip="true" :display-overlay-content="true">
                      <template #overlay>
                        <WallpaperHoverOverlay :wallpaper-id="item.id" :image-url="item.imageUrl"
                          :original-url="item.originalUrl" :download-url="item.downloadUrl" :tags="item.tags ?? []"
                          :classification-tags="item.classificationTags ?? []" :favorite-count="item.favoriteCount"
                          :download-count="item.downloadCount" :is-favorited="true" :resolution="item.resolution"
                          :file-size-label="item.fileSizeLabel" />
                      </template>
                    </TiltedCard>
                  </div>
                </div>
                <!-- 分页 -->
                <div v-if="pcTotalPages > 1" class="flex items-center justify-center"
                  :style="{ marginTop: 'clamp(8px, 2vw, 16px)', gap: 'clamp(4px, 0.8vw, 8px)' }">
                  <button type="button" class="rounded-md transition-colors"
                    :style="{ padding: 'clamp(4px, 0.8vw, 6px) clamp(6px, 1.5vw, 12px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                    :class="pcPage === 1
                      ? themeLight ? 'text-slate-300 cursor-not-allowed' : 'text-white/20 cursor-not-allowed'
                      : themeLight ? 'text-slate-600 hover:bg-slate-100' : 'text-white/60 hover:bg-white/10'"
                    :disabled="pcPage === 1" @click="pcPage--">
                    上一页
                  </button>
                  <button v-for="p in pcTotalPages" :key="p" type="button" class="rounded-md transition-colors"
                    :style="{ width: 'clamp(24px, 3vw, 32px)', height: 'clamp(24px, 3vw, 32px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                    :class="p === pcPage
                      ? 'bg-blue-500/80 text-white'
                      : themeLight ? 'text-slate-600 hover:bg-slate-100' : 'text-white/50 hover:bg-white/10'"
                    @click="pcPage = p">
                    {{ p }}
                  </button>
                  <button type="button" class="rounded-md transition-colors"
                    :style="{ padding: 'clamp(4px, 0.8vw, 6px) clamp(6px, 1.5vw, 12px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                    :class="pcPage === pcTotalPages
                      ? themeLight ? 'text-slate-300 cursor-not-allowed' : 'text-white/20 cursor-not-allowed'
                      : themeLight ? 'text-slate-600 hover:bg-slate-100' : 'text-white/60 hover:bg-white/10'"
                    :disabled="pcPage === pcTotalPages" @click="pcPage++">
                    下一页
                  </button>
                </div>
              </div>
              <ProfileEmptyState v-else />
            </template>

            <!-- 手机收藏：瀑布流（内部滚动） -->
            <template v-else>
              <div v-if="mobileFavItems.length > 0" ref="mobileScrollRef"
                class="profile-mobile-scroll -mx-4 -mb-4 overflow-y-auto overflow-x-hidden sm:-mx-6 sm:-mb-6"
                style="max-height: 720px;">
                <div class="px-4 py-2 sm:px-6">
                  <WallpaperMasonry class="w-full" measure-wrap-class="max-w-none px-0" :items="mobileFavItems"
                    :fixed-columns="masonryColumns" :has-more="false" :loading="false" :duration="0.6"
                    :scroll-target-ref="mobileScrollRef" :stagger="0.05" animate-from="bottom" :scale-on-hover="true"
                    :hover-scale="0.95" :blur-to-focus="true" :color-shift-on-hover="false"
                    @tile-click="goWallpaperDetail" />
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
                class="absolute right-0 top-0 rounded-lg border transition-colors"
                :style="{ padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 12px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                :class="themeLight
                  ? 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  : 'border-white/15 text-white/70 hover:bg-white/10 hover:text-white'" @click="startEditProfile">
                <svg class="inline-block align-[-2px]"
                  :style="{ width: 'clamp(12px, 1.5vw, 16px)', height: 'clamp(12px, 1.5vw, 16px)', marginRight: 'clamp(4px, 0.5vw, 6px)' }"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                编辑资料
              </button>
              <!-- 保存/取消按钮 -->
              <div v-else class="absolute right-0 top-0 flex" :style="{ gap: 'clamp(4px, 1vw, 8px)' }">
                <button type="button" class="rounded-lg border transition-colors"
                  :style="{ padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 12px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                  :class="themeLight
                    ? 'border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    : 'border-white/15 text-white/50 hover:bg-white/10 hover:text-white'" :disabled="profileSaving"
                  @click="cancelEditProfile">
                  取消
                </button>
                <button type="button"
                  class="rounded-lg bg-blue-500/80 text-white shadow-md transition-colors hover:bg-blue-500"
                  :style="{ padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.5vw, 12px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                  :disabled="profileSaving" @click="saveProfile">
                  {{ profileSaving ? '保存中...' : '保存' }}
                </button>
              </div>

              <!-- 表单字段 -->
              <div class="pt-2" :style="{ gap: 'clamp(8px, 2vw, 20px)' }">
                <!-- 昵称 -->
                <div class="flex items-start" :style="{ gap: 'clamp(8px, 2vw, 16px)' }">
                  <label class="shrink-0 pt-2"
                    :style="{ width: 'clamp(60px, 8vw, 80px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                    :class="themeLight ? 'text-slate-500' : 'text-white/50'">昵称</label>
                  <div v-if="!profileEditing" class="pt-2" :style="{ fontSize: 'clamp(12px, 1.5vw, 16px)' }"
                    :class="themeLight ? 'text-slate-800' : 'text-white/90'">{{ user?.nickname || '—' }}</div>
                  <input v-else v-model="profileForm.nickname" type="text" placeholder="请输入昵称"
                    class="rounded-lg border outline-none transition-colors"
                    :style="{ width: 'clamp(200px, 40vw, 300px)', padding: 'clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 16px)', fontSize: 'clamp(12px, 1.5vw, 16px)' }"
                    :class="themeLight
                      ? 'border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white'
                      : 'border-white/15 bg-white/5 text-white/90 placeholder:text-white/30 focus:border-blue-400/50 focus:bg-white/8'" />
                </div>
                <!-- 邮箱 -->
                <div class="flex items-start" :style="{ gap: 'clamp(8px, 2vw, 16px)' }">
                  <label class="shrink-0 pt-2"
                    :style="{ width: 'clamp(60px, 8vw, 80px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                    :class="themeLight ? 'text-slate-500' : 'text-white/50'">邮箱</label>
                  <div v-if="!profileEditing" class="pt-2" :style="{ fontSize: 'clamp(12px, 1.5vw, 16px)' }"
                    :class="themeLight ? 'text-slate-800' : 'text-white/90'">{{ user?.email || '—' }}</div>
                  <input v-else v-model="profileForm.email" type="email" placeholder="请输入邮箱"
                    class="rounded-lg border outline-none transition-colors"
                    :style="{ width: 'clamp(200px, 40vw, 300px)', padding: 'clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 16px)', fontSize: 'clamp(12px, 1.5vw, 16px)' }"
                    :class="themeLight
                      ? 'border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white'
                      : 'border-white/15 bg-white/5 text-white/90 placeholder:text-white/30 focus:border-blue-400/50 focus:bg-white/8'" />
                </div>
                <!-- 性别 -->
                <div class="flex items-start" :style="{ gap: 'clamp(8px, 2vw, 16px)' }">
                  <label class="shrink-0 pt-2"
                    :style="{ width: 'clamp(60px, 8vw, 80px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                    :class="themeLight ? 'text-slate-500' : 'text-white/50'">性别</label>
                  <div v-if="!profileEditing" class="pt-2" :style="{ fontSize: 'clamp(12px, 1.5vw, 16px)' }"
                    :class="themeLight ? 'text-slate-800' : 'text-white/90'">{{ genderLabel }}</div>
                  <div v-else class="flex pt-1.5" :style="{ gap: 'clamp(6px, 1.2vw, 12px)' }">
                    <button type="button" v-for="opt in genderOptions" :key="opt.value"
                      class="rounded-lg border transition-colors"
                      :style="{ padding: 'clamp(6px, 1vw, 8px) clamp(10px, 1.5vw, 16px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                      :class="profileForm.gender === opt.value
                        ? 'border-blue-400/50 bg-blue-500/20 text-white'
                        : themeLight ? 'border-slate-300 text-slate-600 hover:bg-slate-100' : 'border-white/15 text-white/50 hover:bg-white/10'"
                      @click="profileForm.gender = opt.value">
                      {{ opt.label }}
                    </button>
                  </div>
                </div>
                <!-- 个性签名 -->
                <div class="flex items-start" :style="{ gap: 'clamp(8px, 2vw, 16px)' }">
                  <label class="shrink-0 pt-2"
                    :style="{ width: 'clamp(60px, 8vw, 80px)', fontSize: 'clamp(10px, 1.2vw, 14px)' }"
                    :class="themeLight ? 'text-slate-500' : 'text-white/50'">个性签名</label>
                  <div v-if="!profileEditing" class="pt-2 whitespace-pre-wrap"
                    :style="{ fontSize: 'clamp(12px, 1.5vw, 16px)' }"
                    :class="themeLight ? 'text-slate-800' : 'text-white/90'">{{ user?.bio || '—' }}</div>
                  <textarea v-else v-model="profileForm.bio" placeholder="写点什么介绍自己吧..." rows="3"
                    class="resize-none rounded-lg border outline-none transition-colors"
                    :style="{ width: 'clamp(200px, 50vw, 400px)', padding: 'clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 16px)', fontSize: 'clamp(12px, 1.5vw, 16px)', height: 'clamp(60px, 8vh, 80px)' }"
                    :class="themeLight
                      ? 'border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white'
                      : 'border-white/15 bg-white/5 text-white/90 placeholder:text-white/30 focus:border-blue-400/50 focus:bg-white/8'" />
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

  <!-- 背景图上传裁剪弹窗 -->
  <ImageCropperModal :visible="backgroundModalVisible" :loading="backgroundUploading" @close="closeBackgroundModal"
    @confirm="handleBackgroundUpload" />

  <!-- 头像上传裁剪弹窗 -->
  <ImageCropperModal :visible="avatarModalVisible" :loading="avatarUploading" :aspect-ratio="1" title="上传头像"
    fit-mode="cover" @close="closeAvatarModal" @confirm="handleAvatarUpload" />
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, defineAsyncComponent, inject, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type AuthUser } from '../stores/auth'
import { type WallpaperItem, fetchWallpapersPage, fetchMobileWallpapersPage } from '../api/wallpapers'
import { cacheWallpaperForDetail } from '../utils/wallpaperDetailCache'
import { ROUTE_NAME_WALLPAPER_DETAIL } from '../router'
import ProfileEmptyState from '../components/profile/ProfileEmptyState.vue'

const TiltedCard = defineAsyncComponent(() => import('../components/TiltedCard.vue'))
const WallpaperHoverOverlay = defineAsyncComponent(() => import('../components/WallpaperHoverOverlay.vue'))
const WallpaperMasonry = defineAsyncComponent(() => import('../components/WallpaperMasonry.vue'))
const ImageCropperModal = defineAsyncComponent(() => import('../components/ImageCropperModal.vue'))

const router = useRouter()
const authStore = useAuthStore()

const user = computed<AuthUser | null>(() => authStore.user)
const appThemeLight = inject<Ref<boolean> | undefined>('appThemeLight', undefined)
const themeLight = computed(() => appThemeLight?.value === true)

const stats = computed(() => ({
  posts: 0,
  shares: 0,
  likes: user.value?.totalLikes ?? 0,
  rewards: 0,
  following: 0,
  followers: 0,
}))

const bannerBg = computed(() => {
  if (user.value?.background) {
    const cleanBackground = user.value.background.replace(/\n/g, '')
    return `url("${cleanBackground}")`
  }
  if (user.value?.avatar) {
    return `url("${user.value.avatar}")`
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
const mobileScrollRef = ref<HTMLElement | null>(null)

const masonryColumns = ref(4)

function updateMasonryColumns() {
  if (typeof window === 'undefined') return
  masonryColumns.value = window.innerWidth < 900 ? 2 : 4
}

onMounted(() => {
  updateMasonryColumns()
  window.addEventListener('resize', updateMasonryColumns)
})

// ---- 背景图上传 ----
const backgroundModalVisible = ref(false)
const backgroundUploading = ref(false)

function openBackgroundUpload() {
  backgroundModalVisible.value = true
}

function closeBackgroundModal() {
  if (backgroundUploading.value) return
  backgroundModalVisible.value = false
}

async function handleBackgroundUpload(blob: Blob) {
  if (!authStore.isAuthenticated) return

  backgroundUploading.value = true
  try {
    await authStore.uploadBackground(blob)
  } catch {
    // 忽略错误
  } finally {
    backgroundUploading.value = false
  }

  closeBackgroundModal()
}

// ---- 头像上传 ----
const avatarModalVisible = ref(false)
const avatarUploading = ref(false)
const isAvatarHovered = ref(false)

function onAvatarMouseEnter() {
  isAvatarHovered.value = true
}

function onAvatarMouseLeave() {
  isAvatarHovered.value = false
}

function openAvatarUpload() {
  avatarModalVisible.value = true
}

function closeAvatarModal() {
  if (avatarUploading.value) return
  avatarModalVisible.value = false
}

async function handleAvatarUpload(blob: Blob) {
  if (!authStore.isAuthenticated) return

  avatarUploading.value = true
  try {
    await authStore.uploadAvatar(blob)
  } catch {
    // 忽略错误
  } finally {
    avatarUploading.value = false
  }

  closeAvatarModal()
}

// 进入个人主页时刷新用户信息（包含 collections），确保数据与后端一致
onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.getCurrentUser().catch(() => { })
  }

  const savedTab = localStorage.getItem('profile.activeTab') as TabKey
  if (savedTab && tabs.some(t => t.key === savedTab)) {
    activeTab.value = savedTab
  }

  const savedFavKind = localStorage.getItem('profile.favKind') as FavKind
  if (savedFavKind && ['pc', 'mobile'].includes(savedFavKind)) {
    favKind.value = savedFavKind
  }

  const savedFilter = localStorage.getItem('profile.activeFilter') as FilterKey
  if (savedFilter && filters.some(f => f.key === savedFilter)) {
    activeFilter.value = savedFilter
  }
})

watch(activeTab, (val) => {
  localStorage.setItem('profile.activeTab', val)
})

watch(favKind, (val) => {
  localStorage.setItem('profile.favKind', val)
})

watch(activeFilter, (val) => {
  localStorage.setItem('profile.activeFilter', val)
})

// 从 user.collections 读取收藏 ID（后端已统一收藏列表数据源），按 createdAt 降序排列
const pcFavIds = computed(() =>
  (user.value?.collections ?? [])
    .filter((c) => c.deviceType === 'pc' && c.wallpaperId)
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })
    .map((c) => c.wallpaperId!)
)
const mobileFavIds = computed(() =>
  (user.value?.collections ?? [])
    .filter((c) => c.deviceType === 'mobile' && c.wallpaperId)
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })
    .map((c) => c.wallpaperId!)
)
const pcFavCount = computed(() => pcFavIds.value.length)
const mobileFavCount = computed(() => mobileFavIds.value.length)

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
    const idOrder = new Map(pcFavIds.value.map((id, idx) => [String(id), idx]))
    pcFavItems.value = res.items.sort((a, b) => {
      const orderA = idOrder.get(String(a.id)) ?? Number.MAX_VALUE
      const orderB = idOrder.get(String(b.id)) ?? Number.MAX_VALUE
      return orderA - orderB
    })
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
    const idOrder = new Map(mobileFavIds.value.map((id, idx) => [String(id), idx]))
    mobileFavItems.value = res.items.sort((a, b) => {
      const orderA = idOrder.get(String(a.id)) ?? Number.MAX_VALUE
      const orderB = idOrder.get(String(b.id)) ?? Number.MAX_VALUE
      return orderA - orderB
    })
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
  z-index: 0;
}

.profile-banner>.profile-banner-bg {
  z-index: -1;
}

.profile-tabs {
  background: rgba(255, 255, 255, 0.03);
}

[data-theme="light"] .profile-tabs {
  background: rgba(0, 0, 0, 0.02);
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

[data-theme="light"] .profile-mobile-scroll::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4);
}

[data-theme="light"] .profile-mobile-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.6);
}
</style>
