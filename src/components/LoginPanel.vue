<template>
  <div
    class="rounded-2xl border border-white/15 bg-black/50 h-[200px] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm"
    :class="isMobile ? 'text-center' : 'text-center'">
    <template v-if="isAuthenticated && user">
      <div class="flex flex-col items-center">
        <span class="mt-8 text-sm font-semibold text-white">{{ user.nickname }}</span>
        <div class="mt-8 flex items-center justify-between gap-10 text-xs text-slate-200/90">
          <div>下载：<span class="font-semibold text-white">{{ user.totalLikes || 0 }}</span></div>
          <div>收藏：<span class="font-semibold text-white">{{ user.totalFavorites || 0 }}</span></div>
        </div>
        <div class="mt-8 flex gap-2 w-full">
          <button type="button" @click="$emit('personal-center')"
            class="flex-1 rounded-lg border border-white/20 py-1.5 text-xs text-white/80 transition-all hover:bg-white/10">
            个人中心
          </button>
          <button type="button" @click="$emit('logout')"
            class="flex-1 rounded-lg border border-white/20 py-1.5 text-xs text-white/80 transition-all hover:bg-red-500/20 hover:text-red-400">
            退出
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="flex flex-col items-center">
        <span class="text-xs text-slate-300">登陆后获取名称和头像</span>
        <div class="mt-2 flex items-center justify-between gap-4 text-xs text-slate-200/90">
          <div>下载：<span class="font-semibold text-white">{{ 0 }}</span></div>
          <div>收藏：<span class="font-semibold text-white">{{ 0 }}</span></div>
        </div>
        <div class="mt-3 flex justify-center gap-3">
          <div
            class="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/20 cursor-pointer transition-transform hover:scale-110"
            @click="$emit('wechat-login')">
            <span class="text-emerald-300">
              <svg t="1777277712040" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="5012" width="22" height="22">
                <path
                  d="M1024 619.52c0-143.36-138.24-256-307.2-256s-307.2 112.64-307.2 256 138.24 256 307.2 256c30.72 0 61.44-5.12 92.16-10.24l97.28 51.2-25.6-76.8c87.04-51.2 143.36-128 143.36-220.16z m-414.72-40.96c-30.72 0-51.2-20.48-51.2-51.2s20.48-51.2 51.2-51.2 51.2 20.48 51.2 51.2c0 25.6-25.6 51.2-51.2 51.2z m209.92 0c-30.72 0-51.2-20.48-51.2-51.2s20.48-51.2 51.2-51.2 51.2 20.48 51.2 51.2c0 25.6-25.6 51.2-51.2 51.2z"
                  fill="#4CBF00" p-id="5013"></path>
                <path
                  d="M358.4 609.28c0-158.72 153.6-286.72 348.16-286.72h15.36c-40.96-133.12-179.2-235.52-353.28-235.52-204.8 0-368.64 138.24-368.64 307.2 0 107.52 66.56 204.8 168.96 256l-30.72 92.16L256 686.08c35.84 10.24 71.68 15.36 112.64 15.36h10.24c-15.36-30.72-20.48-61.44-20.48-92.16z m138.24-414.72c35.84 0 66.56 30.72 66.56 66.56s-30.72 66.56-66.56 66.56C460.8 322.56 430.08 291.84 430.08 256S460.8 194.56 496.64 194.56zM245.76 322.56c-35.84 0-61.44-30.72-61.44-66.56s30.72-66.56 66.56-66.56 61.44 30.72 61.44 66.56-30.72 66.56-66.56 66.56z"
                  fill="#4CBF00" p-id="5014"></path>
              </svg>
            </span>
          </div>

          <div
            class="grid h-9 w-9 place-items-center rounded-full bg-blue-500/20 cursor-pointer transition-transform hover:scale-110"
            @click="$emit('phone-login')">
            <span class="text-blue-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <path d="M12 18h.01" />
                <path d="M8 21h8" />
                <path d="M16 1.5a2.5 2.5 0 0 0-5 0V6" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface User {
  nickname?: string
  avatar?: string
  totalLikes?: number
  totalFavorites?: number
}

defineProps<{
  isAuthenticated: boolean
  user: User | null
  isMobile: boolean
}>()

defineEmits<{
  'wechat-login': []
  'phone-login': []
  'personal-center': []
  'logout': []
}>()
</script>
