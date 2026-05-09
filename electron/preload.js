const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 设置相关
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // 自定义场景相关
  getCustomScenes: () => ipcRenderer.invoke('get-custom-scenes'),
  saveCustomScene: (scene) => ipcRenderer.invoke('save-custom-scene', scene),
  deleteCustomScene: (id) => ipcRenderer.invoke('delete-custom-scene', id),

  // 收藏声音相关
  getFavoriteSounds: () => ipcRenderer.invoke('get-favorite-sounds'),
  saveFavoriteSound: (sound) => ipcRenderer.invoke('save-favorite-sound', sound),
  deleteFavoriteSound: (id) => ipcRenderer.invoke('delete-favorite-sound', id),

  // 音频文件路径
  getAudioPath: (fileName) => ipcRenderer.invoke('get-audio-path', fileName)
})
