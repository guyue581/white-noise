<template>
  <div class="max-w-md mx-auto pb-20">
    <!-- 页面标题 -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">⭐ 收藏</h2>
      <p class="text-gray-500 dark:text-gray-400 text-sm">你喜爱的声音</p>
    </div>

    <!-- 收藏列表 -->
    <div v-if="store.favoriteSounds.length === 0" class="text-center py-16">
      <span class="text-6xl block mb-4">🎵</span>
      <p class="text-gray-400 text-sm">还没有收藏任何声音</p>
      <p class="text-gray-400 text-xs mt-1">在首页点击声音即可播放</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="sound in store.favoriteSounds"
        :key="sound.id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-md transition-all"
      >
        <div class="flex items-center gap-3">
          <span class="text-3xl">{{ sound.emoji }}</span>
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-gray-800 dark:text-white">{{ sound.name }}</h4>
            <p class="text-xs text-gray-400">{{ sound.category }}</p>
          </div>
          <button
            @click="playSound(sound)"
            class="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm hover:bg-primary-600 transition-colors"
          >
            ▶️
          </button>
          <button
            @click="removeFavorite(sound.id)"
            class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center text-sm hover:bg-red-100 hover:text-red-500 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg text-sm z-50"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const toast = ref({ show: false, message: '' })
let toastTimer = null

function showToast(message) {
  toast.value = { show: true, message }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.show = false
  }, 2000)
}

function playSound(sound) {
  window.dispatchEvent(new CustomEvent('play-sound', { detail: sound }))
  showToast(`正在播放：${sound.name}`)
}

async function removeFavorite(id) {
  await store.removeFavoriteSound(id)
  showToast('已取消收藏')
}

onMounted(async () => {
  await store.loadFavoriteSounds()
})
</script>
