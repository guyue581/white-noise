<template>
  <div class="max-w-md mx-auto py-8">
    <!-- 标题 -->
    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold text-gradient">⚙️ 设置</h1>
    </div>

    <!-- 设置内容 -->
    <div class="space-y-6 pb-8 settings-scroll" style="max-height: calc(100vh - 140px); overflow-y: auto; padding-right: 8px;">
      <!-- 主题切换 -->
      <div class="card">
        <h3 class="font-medium mb-4 text-gray-700 dark:text-gray-200">主题切换</h3>
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="setTheme('light')"
            :class="[
              'py-3 px-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2',
              store.theme === 'light'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-gray-200 dark:border-gray-700'
            ]"
          >
            <div class="w-12 h-6 rounded-full bg-gradient-to-r from-blue-100 to-gray-100 mb-1"></div>
            <span>☀️</span>
            <span class="text-gray-700 dark:text-gray-300">浅色</span>
          </button>
          <button
            @click="setTheme('dark')"
            :class="[
              'py-3 px-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2',
              store.theme === 'dark'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-gray-200 dark:border-gray-700'
            ]"
          >
            <div class="w-12 h-6 rounded-full bg-gradient-to-r from-gray-900 to-indigo-900 mb-1"></div>
            <span>🌙</span>
            <span class="text-gray-700 dark:text-gray-300">深色</span>
          </button>
        </div>
      </div>

      <!-- 默认音量 -->
      <div class="card">
        <h3 class="font-medium mb-4 text-gray-700 dark:text-gray-200">🔊 默认音量</h3>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-400">🔈</span>
          <input
            type="range"
            min="0"
            max="100"
            v-model="defaultVolume"
            @change="saveDefaultVolume"
            class="flex-1 h-2 accent-primary-500"
          />
          <span class="text-sm text-gray-600 dark:text-gray-300 w-10 text-right">{{ defaultVolume }}%</span>
        </div>
      </div>

      <!-- 定时关闭默认设置 -->
      <div class="card">
        <h3 class="font-medium mb-4 text-gray-700 dark:text-gray-200">⏱️ 默认定时关闭</h3>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="min in [0, 30, 60, 90, 120]"
            :key="min"
            @click="setDefaultTimer(min)"
            :class="[
              'py-2 px-3 rounded-lg border-2 transition-all duration-300 text-sm',
              defaultTimer === min
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-gray-200 dark:border-gray-700'
            ]"
          >
            {{ min === 0 ? '关闭' : min + '分钟' }}
          </button>
        </div>
      </div>

      <!-- 关于 -->
      <div class="card">
        <h3 class="font-medium mb-4 text-gray-700 dark:text-gray-200">📱 关于</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">版本</span>
            <span class="text-gray-800 dark:text-gray-200">{{ appVersion }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">开发者</span>
            <span class="text-gray-800 dark:text-gray-200">古月开发</span>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
            🎧 让声音治愈你的每一刻
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const appVersion = ref('1.0.0')
const defaultVolume = ref(80)
const defaultTimer = ref(0)

onMounted(async () => {
  await store.loadSettings()
  defaultVolume.value = store.settings?.masterVolume || 80
  defaultTimer.value = store.settings?.autoStopMinutes || 0
})

function setTheme(theme) {
  store.setTheme(theme)
  const themes = ['light', 'dark']
  themes.forEach(t => {
    document.documentElement.classList.remove(`theme-${t}`)
  })
  document.documentElement.classList.add(`theme-${theme}`)
}

async function saveDefaultVolume() {
  await store.updateSettings({ masterVolume: defaultVolume.value })
}

async function setDefaultTimer(minutes) {
  defaultTimer.value = minutes
  await store.updateSettings({ autoStopMinutes: minutes })
}
</script>

<style scoped>
.settings-scroll::-webkit-scrollbar {
  width: 4px;
}
.settings-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.settings-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #667eea, #764ba2);
  border-radius: 999px;
}
.settings-scroll {
  scrollbar-width: thin;
  scrollbar-color: #667eea transparent;
}
</style>
