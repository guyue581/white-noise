<template>
  <div class="max-w-md mx-auto pb-20">
    <!-- 页面标题 -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">🎧 白噪音</h2>
      <p class="text-gray-500 dark:text-gray-400 text-sm">混合你的专属环境音</p>
    </div>

    <!-- 主控制区 -->
    <div class="bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 rounded-2xl shadow-lg p-5 mb-6">
      <!-- 总音量控制 -->
      <div class="flex items-center gap-3 mb-4">
        <span class="text-lg">🔊</span>
        <input
          type="range"
          min="0"
          max="100"
          v-model="masterVolume"
          @input="setMasterVolume"
          class="flex-1 h-2 accent-primary-500"
        />
        <span class="text-sm text-gray-600 dark:text-gray-300 w-10 text-right">{{ masterVolume }}%</span>
      </div>

      <!-- 播放控制按钮 -->
      <div class="flex items-center justify-center gap-4 mb-4">
        <button
          @click="stopAll"
          class="w-10 h-10 rounded-full bg-white/70 dark:bg-gray-700/70 text-gray-500 hover:text-red-500 hover:bg-white transition-all flex items-center justify-center"
          title="停止全部"
        >
          ⏹️
        </button>
        <button
          @click="togglePlayAll"
          class="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          :class="{ 'animate-pulse': isAnyPlaying }"
        >
          {{ isAnyPlaying ? '⏸️' : '▶️' }}
        </button>
        <button
          @click="showTimerModal = true"
          class="w-10 h-10 rounded-full bg-white/70 dark:bg-gray-700/70 text-gray-500 hover:text-primary-500 hover:bg-white transition-all flex items-center justify-center"
          :class="{ 'text-primary-500': autoStopMinutes > 0 }"
          title="定时关闭"
        >
          ⏱️
        </button>
      </div>

      <!-- 定时显示 -->
      <div v-if="autoStopMinutes > 0 && remainingTime > 0" class="text-center text-sm text-primary-600 dark:text-primary-400">
        ⏰ {{ formatRemainingTime }}
      </div>

      <!-- 当前播放轨道数 -->
      <div class="text-center text-xs text-gray-400 mt-2">
        {{ activeTracksCount }} 个声音正在播放
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
      <button
        v-for="cat in categories"
        :key="cat.value"
        @click="selectedCategory = cat.value"
        :class="[
          'px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all',
          selectedCategory === cat.value
            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
      >
        {{ cat.emoji }} {{ cat.label }}
      </button>
    </div>

    <!-- 声音列表 -->
    <div class="space-y-3">
      <div
        v-for="sound in filteredSounds"
        :key="sound.file"
        class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 transition-all hover:shadow-md"
        :class="{ 'ring-2 ring-primary-500': isPlaying(sound.file) }"
      >
        <div class="flex items-center gap-3">
          <!-- 声音图标 -->
          <span class="text-3xl">{{ sound.emoji }}</span>

          <!-- 声音信息 -->
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-800 dark:text-white text-sm">{{ sound.name }}</h3>
            <p class="text-xs text-gray-400">{{ sound.description }}</p>
          </div>

          <!-- 播放/暂停按钮 -->
          <button
            @click="toggleSound(sound)"
            class="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            :class="isPlaying(sound.file)
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
            "
          >
            {{ isPlaying(sound.file) ? '⏸️' : '▶️' }}
          </button>
        </div>

        <!-- 音量滑块（仅在播放时显示） -->
        <div v-if="isPlaying(sound.file)" class="mt-3 flex items-center gap-2">
          <span class="text-xs text-gray-400">🔈</span>
          <input
            type="range"
            min="0"
            max="100"
            :value="getTrackVolume(sound.file)"
            @input="setTrackVolume(sound.file, $event.target.value)"
            class="flex-1 h-1 accent-primary-500"
          />
          <span class="text-xs text-gray-400 w-8 text-right">{{ getTrackVolume(sound.file) }}%</span>
          <button
            @click="removeTrack(sound.file)"
            class="text-gray-400 hover:text-red-500 transition-colors"
            title="移除"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- 场景预设入口 -->
    <div class="mt-8 mb-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">🎭 快速场景</h3>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="scene in store.scenes.slice(0, 4)"
          :key="scene.id"
          @click="playScene(scene)"
          class="bg-white dark:bg-gray-800 rounded-xl shadow p-3 text-left hover:shadow-md transition-all"
        >
          <span class="text-2xl block mb-1">{{ scene.emoji }}</span>
          <p class="font-medium text-gray-800 dark:text-white text-sm">{{ scene.name }}</p>
          <p class="text-xs text-gray-400 truncate">{{ scene.description }}</p>
        </button>
      </div>
    </div>

    <!-- 定时关闭弹窗 -->
    <div v-if="showTimerModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showTimerModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 m-4 max-w-sm w-full">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">⏱️ 定时关闭</h3>
        
        <!-- 自定义时间输入 -->
        <div class="mb-4">
          <div class="flex items-center gap-2">
            <input
              v-model="customMinutes"
              type="number"
              min="1"
              max="999"
              placeholder="输入分钟数"
              class="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              @click="setCustomAutoStop"
              class="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm hover:bg-primary-600 transition-colors"
            >
              确定
            </button>
          </div>
          <p v-if="customError" class="text-red-500 text-xs mt-1">{{ customError }}</p>
        </div>

        <div class="space-y-2">
          <p class="text-xs text-gray-400 mb-2">快速选择</p>
          <button
            v-for="min in [0, 15, 30, 45, 60, 90, 120]"
            :key="min"
            @click="setAutoStop(min); showTimerModal = false"
            :class="[
              'w-full py-2.5 rounded-xl text-sm transition-all',
              autoStopMinutes === min
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            {{ min === 0 ? '关闭定时' : min + ' 分钟后停止' }}
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

// 声音定义
const soundDefinitions = [
  { name: '雨后森林', emoji: '🌲', category: 'nature', description: '森林中的雨声，清新宁静', file: 'nature_rain_forest.mp3' },
  { name: '海浪声', emoji: '🌊', category: 'nature', description: '轻柔的海浪拍岸', file: 'nature_ocean_waves.mp3' },
  { name: '鸟鸣山间', emoji: '🐦', category: 'nature', description: '清晨山林中的鸟叫', file: 'nature_bird_songs.mp3' },
  { name: '溪流潺潺', emoji: '💧', category: 'nature', description: '山间小溪的流水声', file: 'nature_stream.mp3' },
  { name: '篝火噼啪', emoji: '🔥', category: 'nature', description: '温暖的篝火燃烧声', file: 'nature_campfire.mp3' },

  { name: '钢琴曲', emoji: '🎹', category: 'music', description: '轻柔的钢琴旋律', file: 'music_piano.mp3' },
  { name: '吉他弹唱', emoji: '🎸', category: 'music', description: '温馨的吉他曲', file: 'music_guitar.mp3' },
  { name: '古典音乐', emoji: '🎻', category: 'music', description: '舒缓的古典乐章', file: 'music_classical.mp3' },
  { name: '冥想音乐', emoji: '🧘', category: 'music', description: '深度放松冥想曲', file: 'music_meditation.mp3' },

  { name: '风扇声', emoji: '🌀', category: 'white', description: '模拟风扇转动的白噪音', file: 'white_fan.mp3' },
  { name: '咖啡厅', emoji: '☕', category: 'white', description: '咖啡厅的背景音', file: 'white_coffee_shop.mp3' },
  { name: '图书馆', emoji: '📚', category: 'white', description: '安静的图书馆氛围', file: 'white_library.mp3' },

  { name: '敲击声', emoji: '🔔', category: 'asmr', description: '舒缓的敲击ASMR', file: 'asmr_tapping.mp3' },
  { name: '书写声', emoji: '✏️', category: 'asmr', description: '笔尖书写的ASMR', file: 'asmr_writing.mp3' },
  { name: '翻书声', emoji: '📖', category: 'asmr', description: '翻页的沙沙声', file: 'asmr_page_turn.mp3' },
]

const categories = [
  { value: 'all', emoji: '🎵', label: '全部' },
  { value: 'nature', emoji: '🌿', label: '自然' },
  { value: 'music', emoji: '🎸', label: '轻音乐' },
  { value: 'white', emoji: '☁️', label: '白噪音' },
  { value: 'asmr', emoji: '🎧', label: 'ASMR' },
]

const audioPathMap = ref(new Map())
const selectedCategory = ref('all')
const masterVolume = ref(80)
const autoStopMinutes = ref(0)
const remainingTime = ref(0)
const showTimerModal = ref(false)
const customMinutes = ref('')
const customError = ref('')

// 多轨道管理
const audioTracks = ref(new Map()) // file -> { audio, volume, playing }
let autoStopTimer = null
let countdownInterval = null
let toastTimer = null

const toast = ref({ show: false, message: '' })

// 计算属性
const filteredSounds = computed(() => {
  if (selectedCategory.value === 'all') return soundDefinitions
  return soundDefinitions.filter(s => s.category === selectedCategory.value)
})

const isAnyPlaying = computed(() => {
  for (const track of audioTracks.value.values()) {
    if (track.playing) return true
  }
  return false
})

const activeTracksCount = computed(() => {
  let count = 0
  for (const track of audioTracks.value.values()) {
    if (track.playing) count++
  }
  return count
})

const formatRemainingTime = computed(() => {
  const mins = Math.floor(remainingTime.value / 60)
  const secs = remainingTime.value % 60
  return `${mins}:${String(secs).padStart(2, '0')} 后停止`
})

// 方法
function showToast(message) {
  toast.value = { show: true, message }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.show = false
  }, 2000)
}

function isPlaying(file) {
  const track = audioTracks.value.get(file)
  return track && track.playing
}

function getTrackVolume(file) {
  const track = audioTracks.value.get(file)
  return track ? Math.round(track.volume * 100) : 50
}

async function getAudioSrc(fileName) {
  // 优先使用预加载的音频路径
  if (audioPathMap.value.has(fileName)) {
    return audioPathMap.value.get(fileName)
  }
  
  // 在 Electron 环境中获取实际文件路径
  if (window.electronAPI && window.electronAPI.getAudioPath) {
    try {
      const filePath = await window.electronAPI.getAudioPath(fileName)
      if (filePath) {
        audioPathMap.value.set(fileName, filePath)
        return filePath
      }
    } catch (e) {
      console.error('获取音频路径失败:', e)
    }
  }
  
  // 开发环境回退到相对路径
  return './audio/' + fileName
}

async function toggleSound(sound) {
  const existing = audioTracks.value.get(sound.file)

  if (existing && existing.playing) {
    // 暂停
    existing.audio.pause()
    existing.playing = false
  } else if (existing && !existing.playing) {
    // 恢复播放
    try {
      await existing.audio.play()
      existing.playing = true
    } catch (err) {
      console.error('音频播放失败:', err)
      showToast('音频加载失败')
    }
  } else {
    // 新建轨道
    const audioSrc = await getAudioSrc(sound.file)
    const audio = new Audio(audioSrc)
    audio.loop = true
    audio.volume = (masterVolume.value / 100) * 0.5

    try {
      await audio.play()
      audioTracks.value.set(sound.file, {
        audio,
        volume: 0.5,
        playing: true,
        name: sound.name,
        emoji: sound.emoji
      })
    } catch (err) {
      console.error('音频播放失败:', err)
      showToast('音频加载失败: ' + sound.name)
    }
  }
}

function removeTrack(file) {
  const track = audioTracks.value.get(file)
  if (track) {
    track.audio.pause()
    track.audio.src = ''
    audioTracks.value.delete(file)
  }
}

function setTrackVolume(file, value) {
  const track = audioTracks.value.get(file)
  if (track) {
    const vol = value / 100
    track.volume = vol
    track.audio.volume = vol * (masterVolume.value / 100)
  }
}

function setMasterVolume() {
  for (const track of audioTracks.value.values()) {
    track.audio.volume = track.volume * (masterVolume.value / 100)
  }
}

function togglePlayAll() {
  if (isAnyPlaying.value) {
    pauseAll()
  } else {
    resumeAll()
  }
}

function pauseAll() {
  for (const track of audioTracks.value.values()) {
    track.audio.pause()
    track.playing = false
  }
}

function resumeAll() {
  for (const track of audioTracks.value.values()) {
    track.audio.play().then(() => {
      track.playing = true
    }).catch(err => {
      console.error('恢复播放失败:', err)
    })
  }
}

function stopAll() {
  for (const [file, track] of audioTracks.value.entries()) {
    track.audio.pause()
    track.audio.src = ''
  }
  audioTracks.value.clear()
  clearAutoStop()
}

async function playScene(scene) {
  // 停止当前所有
  stopAll()

  // 播放场景中的轨道
  for (const trackInfo of scene.tracks) {
    const sound = soundDefinitions.find(s => s.file === trackInfo.file)
    if (!sound) continue

    const audioSrc = await getAudioSrc(trackInfo.file)
    const audio = new Audio(audioSrc)
    audio.loop = true
    const vol = trackInfo.volume / 100
    audio.volume = vol * (masterVolume.value / 100)

    try {
      await audio.play()
      audioTracks.value.set(trackInfo.file, {
        audio,
        volume: vol,
        playing: true,
        name: sound.name,
        emoji: sound.emoji
      })
    } catch (err) {
      console.error('场景音频播放失败:', err)
    }
  }

  showToast(`已加载场景：${scene.name}`)
}

function setAutoStop(minutes) {
  autoStopMinutes.value = minutes
  clearAutoStop()
  customMinutes.value = ''
  customError.value = ''

  if (minutes > 0) {
    remainingTime.value = minutes * 60

    countdownInterval = setInterval(() => {
      remainingTime.value--
      if (remainingTime.value <= 0) {
        stopAll()
        showToast('定时关闭，已停止播放')
        clearAutoStop()
      }
    }, 1000)

    autoStopTimer = setTimeout(() => {
      // 由 countdownInterval 处理停止逻辑
    }, minutes * 60 * 1000)

    showToast(`${minutes}分钟后自动停止`)
  } else {
    showToast('已关闭定时')
  }
}

function setCustomAutoStop() {
  customError.value = ''
  const minutes = parseInt(customMinutes.value)

  if (isNaN(minutes) || minutes < 1) {
    customError.value = '请输入有效的分钟数（至少1分钟）'
    return
  }

  if (minutes > 999) {
    customError.value = '最多支持999分钟'
    return
  }

  setAutoStop(minutes)
  showTimerModal.value = false
}

function clearAutoStop() {
  if (autoStopTimer) {
    clearTimeout(autoStopTimer)
    autoStopTimer = null
  }
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  remainingTime.value = 0
}

// 初始化
onMounted(async () => {
  // 预加载所有音频路径
  if (window.electronAPI && window.electronAPI.getAudioPath) {
    try {
      for (const sound of soundDefinitions) {
        const filePath = await window.electronAPI.getAudioPath(sound.file)
        if (filePath) {
          audioPathMap.value.set(sound.file, filePath)
        }
      }
      console.log('音频路径预加载完成:', audioPathMap.value)
    } catch (e) {
      console.error('预加载音频路径失败:', e)
    }
  }

  await store.loadSettings()
  masterVolume.value = store.settings?.masterVolume || 80
  autoStopMinutes.value = store.settings?.autoStopMinutes || 0
})

onUnmounted(() => {
  stopAll()
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
