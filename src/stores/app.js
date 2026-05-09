import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const theme = ref('light')
  const currentView = ref('home')
  const settings = ref({
    theme: 'light',
    customPrimaryColor: '#667eea',
    customSecondaryColor: '#764ba2',
    backgroundType: 'default',
    backgroundImage: '',
    autoStopMinutes: 0,
    masterVolume: 80
  })

  const isDark = computed(() => theme.value === 'dark')

  function setTheme(newTheme) {
    theme.value = newTheme
    settings.value.theme = newTheme
    saveSettings()
  }

  function setView(view) {
    currentView.value = view
  }

  async function loadSettings() {
    if (window.electronAPI) {
      try {
        const savedSettings = await window.electronAPI.getSettings()
        settings.value = { ...settings.value, ...savedSettings }
        theme.value = savedSettings.theme || 'light'
      } catch (e) {
        console.error('加载设置失败:', e)
      }
    }
  }

  async function saveSettings() {
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveSettings(settings.value)
      } catch (e) {
        console.error('保存设置失败:', e)
      }
    }
  }

  async function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings }
    await saveSettings()
  }

  // 场景预设
  const scenes = ref([
    {
      id: 'deep-sleep',
      name: '深度睡眠',
      emoji: '🌙',
      description: '风扇声 + 雨声，助您安然入睡',
      tracks: [
        { file: 'white_fan.mp3', volume: 40 },
        { file: 'nature_rain_forest.mp3', volume: 50 }
      ]
    },
    {
      id: 'rain-focus',
      name: '雨天专注',
      emoji: '🌧️',
      description: '雨声 + 咖啡厅背景音，提升专注力',
      tracks: [
        { file: 'nature_rain_forest.mp3', volume: 60 },
        { file: 'white_coffee_shop.mp3', volume: 30 }
      ]
    },
    {
      id: 'forest-meditation',
      name: '森林冥想',
      emoji: '🌲',
      description: '鸟鸣 + 溪流，放松身心',
      tracks: [
        { file: 'nature_bird_songs.mp3', volume: 50 },
        { file: 'nature_stream.mp3', volume: 45 },
        { file: 'nature_campfire.mp3', volume: 25 }
      ]
    },
    {
      id: 'cafe-work',
      name: '咖啡厅工作',
      emoji: '☕',
      description: '咖啡厅 + 轻音乐，高效工作',
      tracks: [
        { file: 'white_coffee_shop.mp3', volume: 55 },
        { file: 'music_piano.mp3', volume: 35 }
      ]
    },
    {
      id: 'ocean-relax',
      name: '海边放松',
      emoji: '🌊',
      description: '海浪 + 吉他，舒缓压力',
      tracks: [
        { file: 'nature_ocean_waves.mp3', volume: 55 },
        { file: 'music_guitar.mp3', volume: 30 }
      ]
    },
    {
      id: 'library-study',
      name: '图书馆学习',
      emoji: '📚',
      description: '图书馆 + 风扇声，安静学习',
      tracks: [
        { file: 'white_library.mp3', volume: 50 },
        { file: 'white_fan.mp3', volume: 30 }
      ]
    }
  ])

  // 自定义场景
  const customScenes = ref([])

  async function loadCustomScenes() {
    if (window.electronAPI) {
      try {
        customScenes.value = await window.electronAPI.getCustomScenes() || []
      } catch (e) {
        console.error('加载自定义场景失败:', e)
      }
    }
  }

  async function saveCustomScene(scene) {
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveCustomScene(scene)
        await loadCustomScenes()
      } catch (e) {
        console.error('保存自定义场景失败:', e)
        customScenes.value.push(scene)
      }
    } else {
      customScenes.value.push(scene)
    }
  }

  async function deleteCustomScene(id) {
    if (window.electronAPI) {
      try {
        await window.electronAPI.deleteCustomScene(id)
        await loadCustomScenes()
      } catch (e) {
        console.error('删除自定义场景失败:', e)
        customScenes.value = customScenes.value.filter(s => s.id !== id)
      }
    } else {
      customScenes.value = customScenes.value.filter(s => s.id !== id)
    }
  }

  // 收藏的声音
  const favoriteSounds = ref([])

  async function loadFavoriteSounds() {
    if (window.electronAPI) {
      try {
        favoriteSounds.value = await window.electronAPI.getFavoriteSounds() || []
      } catch (e) {
        console.error('加载收藏失败:', e)
      }
    }
  }

  async function addFavoriteSound(sound) {
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveFavoriteSound(sound)
        await loadFavoriteSounds()
      } catch (e) {
        console.error('保存收藏失败:', e)
        favoriteSounds.value.push(sound)
      }
    } else {
      favoriteSounds.value.push(sound)
    }
  }

  async function removeFavoriteSound(id) {
    if (window.electronAPI) {
      try {
        await window.electronAPI.deleteFavoriteSound(id)
        await loadFavoriteSounds()
      } catch (e) {
        console.error('删除收藏失败:', e)
        favoriteSounds.value = favoriteSounds.value.filter(f => f.id !== id)
      }
    } else {
      favoriteSounds.value = favoriteSounds.value.filter(f => f.id !== id)
    }
  }

  return {
    theme,
    currentView,
    settings,
    isDark,
    scenes,
    customScenes,
    favoriteSounds,
    setTheme,
    setView,
    loadSettings,
    saveSettings,
    updateSettings,
    loadCustomScenes,
    saveCustomScene,
    deleteCustomScene,
    loadFavoriteSounds,
    addFavoriteSound,
    removeFavoriteSound
  }
})
