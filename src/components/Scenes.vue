<template>
  <div class="max-w-md mx-auto pb-20">
    <!-- 页面标题 -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">🎭 场景预设</h2>
      <p class="text-gray-500 dark:text-gray-400 text-sm">一键切换专属环境音组合</p>
    </div>

    <!-- 内置场景 -->
    <div class="mb-8">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">✨ 推荐场景</h3>
      <div class="space-y-3">
        <div
          v-for="scene in store.scenes"
          :key="scene.id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ scene.emoji }}</span>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-800 dark:text-white">{{ scene.name }}</h4>
              <p class="text-xs text-gray-400">{{ scene.description }}</p>
              <div class="flex gap-1 mt-1">
                <span
                  v-for="track in scene.tracks"
                  :key="track.file"
                  class="text-[10px] px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full"
                >
                  {{ getSoundName(track.file) }}
                </span>
              </div>
            </div>
            <button
              @click="playScene(scene)"
              class="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all"
            >
              ▶️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义场景 -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">💾 我的场景</h3>
        <button
          @click="showCreateModal = true"
          class="text-sm text-primary-500 hover:text-primary-600 transition-colors"
        >
          + 新建场景
        </button>
      </div>

      <div v-if="store.customScenes.length === 0" class="text-center py-8 text-gray-400 text-sm">
        还没有自定义场景，点击上方创建
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="scene in store.customScenes"
          :key="scene.id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ scene.emoji || '🎵' }}</span>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-800 dark:text-white">{{ scene.name }}</h4>
              <p class="text-xs text-gray-400">{{ scene.description || '自定义场景' }}</p>
              <div class="flex gap-1 mt-1">
                <span
                  v-for="track in scene.tracks"
                  :key="track.file"
                  class="text-[10px] px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full"
                >
                  {{ getSoundName(track.file) }}
                </span>
              </div>
            </div>
            <div class="flex gap-1">
              <button
                @click="playScene(scene)"
                class="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm hover:bg-primary-600 transition-colors"
              >
                ▶️
              </button>
              <button
                @click="deleteScene(scene.id)"
                class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center text-sm hover:bg-red-100 hover:text-red-500 transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建场景弹窗 -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showCreateModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 m-4 max-w-sm w-full max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">🎵 新建场景</h3>

        <div class="space-y-4">
          <!-- 场景名称 -->
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">场景名称</label>
            <input
              v-model="newScene.name"
              type="text"
              placeholder="如：我的睡眠组合"
              class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
            />
          </div>

          <!-- 场景描述 -->
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">描述（可选）</label>
            <input
              v-model="newScene.description"
              type="text"
              placeholder="简短描述这个场景..."
              class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
            />
          </div>

          <!-- 选择声音 -->
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">选择声音并设置音量</label>
            <div class="space-y-2 max-h-60 overflow-y-auto">
              <div
                v-for="sound in allSounds"
                :key="sound.file"
                class="flex items-center gap-2 p-2 rounded-lg"
                :class="selectedTracks[sound.file] ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-50 dark:bg-gray-700/50'"
              >
                <input
                  type="checkbox"
                  :checked="!!selectedTracks[sound.file]"
                  @change="toggleTrack(sound.file)"
                  class="w-4 h-4 accent-primary-500"
                />
                <span class="text-lg">{{ sound.emoji }}</span>
                <span class="text-sm flex-1">{{ sound.name }}</span>
                <input
                  v-if="selectedTracks[sound.file]"
                  type="range"
                  min="0"
                  max="100"
                  v-model="selectedTracks[sound.file].volume"
                  class="w-20 h-1 accent-primary-500"
                />
                <span v-if="selectedTracks[sound.file]" class="text-xs text-gray-400 w-8">{{ selectedTracks[sound.file].volume }}%</span>
              </div>
            </div>
          </div>

          <!-- 按钮 -->
          <div class="flex gap-3 pt-2">
            <button
              @click="showCreateModal = false"
              class="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              @click="createScene"
              :disabled="!canCreate"
              class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm hover:shadow-lg transition-all disabled:opacity-50"
            >
              保存场景
            </button>
          </div>
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
import { ref, computed, reactive } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const allSounds = [
  { name: '雨后森林', emoji: '🌲', file: 'nature_rain_forest.mp3' },
  { name: '海浪声', emoji: '🌊', file: 'nature_ocean_waves.mp3' },
  { name: '鸟鸣山间', emoji: '🐦', file: 'nature_bird_songs.mp3' },
  { name: '溪流潺潺', emoji: '💧', file: 'nature_stream.mp3' },
  { name: '篝火噼啪', emoji: '🔥', file: 'nature_campfire.mp3' },
  { name: '钢琴曲', emoji: '🎹', file: 'music_piano.mp3' },
  { name: '吉他弹唱', emoji: '🎸', file: 'music_guitar.mp3' },
  { name: '古典音乐', emoji: '🎻', file: 'music_classical.mp3' },
  { name: '冥想音乐', emoji: '🧘', file: 'music_meditation.mp3' },
  { name: '粉红噪音', emoji: '💗', file: 'white_pink_noise.mp3' },
  { name: '风扇声', emoji: '🌀', file: 'white_fan.mp3' },
  { name: '咖啡厅', emoji: '☕', file: 'white_coffee_shop.mp3' },
  { name: '图书馆', emoji: '📚', file: 'white_library.mp3' },
  { name: '敲击声', emoji: '🔔', file: 'asmr_tapping.mp3' },
  { name: '书写声', emoji: '✏️', file: 'asmr_writing.mp3' },
  { name: '翻书声', emoji: '📖', file: 'asmr_page_turn.mp3' },
]

const showCreateModal = ref(false)
const newScene = reactive({
  name: '',
  description: '',
  emoji: '🎵'
})
const selectedTracks = reactive({})
const toast = ref({ show: false, message: '' })
let toastTimer = null

const canCreate = computed(() => {
  return newScene.name.trim() && Object.keys(selectedTracks).length > 0
})

function showToast(message) {
  toast.value = { show: true, message }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.show = false
  }, 2000)
}

function getSoundName(file) {
  const sound = allSounds.find(s => s.file === file)
  return sound ? sound.name : file
}

function toggleTrack(file) {
  if (selectedTracks[file]) {
    delete selectedTracks[file]
  } else {
    selectedTracks[file] = { file, volume: 50 }
  }
}

async function createScene() {
  const tracks = Object.values(selectedTracks).map(t => ({
    file: t.file,
    volume: parseInt(t.volume)
  }))

  const scene = {
    id: Date.now().toString(),
    name: newScene.name.trim(),
    description: newScene.description.trim(),
    emoji: newScene.emoji,
    tracks
  }

  await store.saveCustomScene(scene)

  // 重置表单
  newScene.name = ''
  newScene.description = ''
  Object.keys(selectedTracks).forEach(key => delete selectedTracks[key])
  showCreateModal.value = false

  showToast('场景已保存')
}

async function deleteScene(id) {
  await store.deleteCustomScene(id)
  showToast('场景已删除')
}

function playScene(scene) {
  // 发送事件给 Home 组件播放场景
  window.dispatchEvent(new CustomEvent('play-scene', { detail: scene }))
  showToast(`正在播放：${scene.name}`)
}
</script>
