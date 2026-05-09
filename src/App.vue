<template>
  <div
    :class="[`theme-${store.theme}`]"
    class="h-screen transition-colors duration-500 overflow-hidden"
  >
    <div class="h-full relative overflow-hidden flex flex-col">
      <!-- 背景图片 -->
      <div class="absolute inset-0 z-0">
        <img
          v-if="store.theme === 'light'"
          src="/bg-light.svg"
          alt="背景"
          class="w-full h-full object-cover bg-image transition-transform duration-500"
        />
        <img
          v-else-if="store.theme === 'dark'"
          src="/bg-dark.svg"
          alt="背景"
          class="w-full h-full object-cover bg-image transition-transform duration-500"
        />
      </div>
      <div class="absolute inset-0 bg-theme-light-bg/80 theme-dark:bg-theme-dark-bg/80 z-10"></div>

      <div class="relative z-20 h-full flex flex-col">
        <!-- 顶部导航 -->
        <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 theme-dark:bg-theme-dark-card/80 backdrop-blur-lg border-b border-gray-100 theme-dark:border-gray-800 transition-all duration-300 shadow-sm">
          <div class="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div class="text-lg font-bold text-gradient animate-pulse-scale cursor-pointer" @click="goHome">
              🎧 白噪音
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="goHome"
                :class="[
                  'p-2 rounded-full transition-all duration-300',
                  store.currentView === 'home'
                    ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                ]"
                title="首页"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </button>
              <button
                @click="goScenes"
                :class="[
                  'p-2 rounded-full transition-all duration-300',
                  store.currentView === 'scenes'
                    ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                ]"
                title="场景"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </button>
              <button
                @click="goFavorites"
                :class="[
                  'p-2 rounded-full transition-all duration-300',
                  store.currentView === 'favorites'
                    ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                ]"
                title="收藏"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
              <button
                @click="goSettings"
                :class="[
                  'p-2 rounded-full transition-all duration-300',
                  store.currentView === 'settings'
                    ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                ]"
                title="设置"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
            </div>
          </div>
        </nav>

        <!-- 页面内容 -->
        <main class="flex-1 overflow-y-auto pt-16 pb-6 px-4 relative z-10" style="min-height: 0;">
          <transition name="page">
            <Home v-if="store.currentView === 'home'" :key="'home'" />
            <Scenes v-else-if="store.currentView === 'scenes'" :key="'scenes'" />
            <Favorites v-else-if="store.currentView === 'favorites'" :key="'favorites'" />
            <Settings v-else-if="store.currentView === 'settings'" :key="'settings'" />
          </transition>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'
import Home from './components/Home.vue'
import Scenes from './components/Scenes.vue'
import Favorites from './components/Favorites.vue'
import Settings from './components/Settings.vue'

const store = useAppStore()

function goHome() {
  store.setView('home')
}

function goScenes() {
  store.setView('scenes')
}

function goFavorites() {
  store.setView('favorites')
}

function goSettings() {
  store.setView('settings')
}

onMounted(async () => {
  await store.loadSettings()

  // 应用保存的主题
  const themes = ['light', 'dark']
  themes.forEach(theme => {
    document.documentElement.classList.remove(`theme-${theme}`)
  })
  document.documentElement.classList.add(`theme-${store.theme}`)
})
</script>

<style scoped>
/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(15px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}
</style>
