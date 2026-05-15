<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click.self="handleClose"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        <Transition name="scale">
          <div
            v-if="visible"
            class="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <button
              type="button"
              class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20"
              @click="handleClose"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h3 class="mb-6 text-center text-xl font-semibold text-white">欢迎登录</h3>

            <div class="mb-6 flex rounded-lg bg-white/5 p-1">
              <button
                type="button"
                class="flex-1 rounded-md py-2.5 text-sm font-medium transition-all"
                :class="loginType === 'phone' ? 'bg-white text-slate-800' : 'text-slate-300 hover:text-white'"
                @click="setLoginType('phone')"
              >
                手机登录
              </button>
              <button
                type="button"
                class="flex-1 rounded-md py-2.5 text-sm font-medium transition-all"
                :class="loginType === 'email' ? 'bg-white text-slate-800' : 'text-slate-300 hover:text-white'"
                @click="setLoginType('email')"
              >
                邮箱登录
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="mb-2 block text-sm text-slate-300">
                  {{ loginType === 'phone' ? '手机号' : '邮箱' }}
                </label>
                <input
                  v-model="account"
                  type="text"
                  :placeholder="loginType === 'phone' ? '请输入手机号' : '请输入邮箱'"
                  class="w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  @blur="validateAccount"
                />
                <p v-if="accountError" class="mt-2 text-sm text-red-400">{{ accountError }}</p>
              </div>

              <div>
                <label class="mb-2 block text-sm text-slate-300">密码</label>
                <div class="relative">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="请输入密码"
                    class="w-full rounded-xl border bg-white/5 px-4 py-3 pr-10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    @blur="validatePassword"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    @click="togglePassword"
                  >
                    <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
                <p v-if="passwordError" class="mt-2 text-sm text-red-400">{{ passwordError }}</p>
              </div>

              <div class="flex items-center justify-between text-sm">
                <label class="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" v-model="rememberMe" class="h-4 w-4 rounded border-white/30 bg-white/10 text-indigo-500 focus:ring-indigo-500" />
                  <span>记住我</span>
                </label>
                <a href="#" class="text-indigo-400 hover:text-indigo-300">忘记密码?</a>
              </div>
            </div>

            <div class="mt-6 space-y-3">
              <button
                type="button"
                class="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
                :disabled="!isValid || isLoading"
                :class="{ 'opacity-50 cursor-not-allowed': !isValid || isLoading }"
                @click="handleLogin"
              >
                <span v-if="isLoading" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  登录中...
                </span>
                <span v-else>确认登录</span>
              </button>
              <button
                type="button"
                class="w-full rounded-xl border border-white/20 py-3 font-medium text-slate-300 transition-all hover:bg-white/5 hover:text-white"
                @click="handleClose"
              >
                取消
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showRegisterConfirm"
        class="fixed inset-0 z-[101] flex items-center justify-center p-4"
        @click.self="showRegisterConfirm = false"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        <Transition name="scale">
          <div
            v-if="showRegisterConfirm"
            class="relative w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <h3 class="mb-4 text-lg font-semibold text-white">注册账号</h3>
            <p class="mb-4 text-slate-300">该手机号/邮箱尚未注册，请设置昵称完成注册</p>
            
            <div class="mb-4">
              <label class="mb-2 block text-sm text-slate-300">昵称</label>
              <input
                v-model="nickname"
                type="text"
                placeholder="请输入昵称（2-30位）"
                class="w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                @blur="validateNickname"
              />
              <p v-if="nicknameError" class="mt-2 text-sm text-red-400">{{ nicknameError }}</p>
            </div>
            
            <div class="flex gap-3">
              <button
                type="button"
                class="flex-1 rounded-xl border border-white/20 py-3 font-medium text-slate-300 transition-all hover:bg-white/5 hover:text-white"
                @click="showRegisterConfirm = false"
              >
                取消
              </button>
              <button
                type="button"
                class="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
                :disabled="isRegistering || !isNicknameValid"
                :class="{ 'opacity-50 cursor-not-allowed': isRegistering || !isNicknameValid }"
                @click="handleRegisterAndLogin"
              >
                <span v-if="isRegistering" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  注册中...
                </span>
                <span v-else>确认注册</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'loginSuccess', data: { nickname: string; avatar: string }): void
}>()

const authStore = useAuthStore()

const loginType = ref<'phone' | 'email'>('phone')
const account = ref('')
const password = ref('')
const nickname = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const accountError = ref('')
const passwordError = ref('')
const nicknameError = ref('')
const isLoading = ref(false)
const isRegistering = ref(false)
const showRegisterConfirm = ref(false)

const phoneRegex = /^1[3-9]\d{9}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const setLoginType = (type: 'phone' | 'email') => {
  loginType.value = type
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const validateNickname = () => {
  if (!nickname.value.trim()) {
    nicknameError.value = '昵称不能为空'
    return false
  }
  if (nickname.value.length < 2) {
    nicknameError.value = '昵称长度不能少于2位'
    return false
  }
  if (nickname.value.length > 30) {
    nicknameError.value = '昵称长度不能超过30位'
    return false
  }
  nicknameError.value = ''
  return true
}

const isNicknameValid = computed(() => {
  return validateNickname()
})

const validateAccount = () => {
  if (!account.value.trim()) {
    accountError.value = `${loginType.value === 'phone' ? '手机号' : '邮箱'}不能为空`
    return false
  }
  if (loginType.value === 'phone' && !phoneRegex.test(account.value)) {
    accountError.value = '请输入有效的手机号'
    return false
  }
  if (loginType.value === 'email' && !emailRegex.test(account.value)) {
    accountError.value = '请输入有效的邮箱地址'
    return false
  }
  accountError.value = ''
  return true
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = '密码不能为空'
    return false
  }
  if (password.value.length < 8) {
    passwordError.value = '密码长度不能少于8位'
    return false
  }
  if (password.value.length > 128) {
    passwordError.value = '密码长度不能超过128位'
    return false
  }
  passwordError.value = ''
  return true
}

const isValid = computed(() => {
  return validateAccount() && validatePassword()
})

watch(loginType, () => {
  account.value = ''
  accountError.value = ''
})

const handleClose = () => {
  emit('close')
}

const handleLogin = async () => {
  if (!isValid.value || isLoading.value) return
  
  isLoading.value = true
  
  try {
    await authStore.login({
      account: account.value,
      password: password.value,
    })
    
    handleLoginSuccess({
      nickname: authStore.user?.nickname || '用户',
      avatar: authStore.user?.avatar || '',
    })
  } catch (error: any) {
    console.error('登录失败:', error)
    if (error.api?.code === 'USER_NOT_FOUND' || error.message?.includes('用户不存在')) {
      showRegisterConfirm.value = true
    } else {
      alert(error.message || '登录失败')
    }
  } finally {
    isLoading.value = false
  }
}

const handleRegisterAndLogin = async () => {
  if (isRegistering.value || !validateNickname()) return
  
  isRegistering.value = true
  
  try {
    await authStore.register({
      account: account.value,
      password: password.value,
      nickname: nickname.value,
    })
    
    showRegisterConfirm.value = false
    nickname.value = ''
    
    handleLoginSuccess({
      nickname: authStore.user?.nickname || '用户',
      avatar: authStore.user?.avatar || '',
    })
  } catch (error: any) {
    console.error('注册失败:', error)
    alert(error.message || '注册失败')
  } finally {
    isRegistering.value = false
  }
}

const handleLoginSuccess = (data: { nickname: string; avatar: string }) => {
  emit('loginSuccess', data)
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>