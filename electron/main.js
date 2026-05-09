const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow

function getAudioDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'audio')
  }
  return path.join(__dirname, '..', 'public', 'audio')
}

function getAudioPath(fileName) {
  return path.join(getAudioDir(), fileName)
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 760,
    minWidth: 420,
    minHeight: 600,
    frame: true,
    resizable: true,
    backgroundColor: '#f5f7fa',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.ico')
  })

  Menu.setApplicationMenu(null)

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.webContents.on('crashed', () => {
    console.error('渲染进程崩溃')
  })
  mainWindow.webContents.on('unresponsive', () => {
    console.error('渲染进程无响应')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const userDataPath = app.getPath('userData')
const settingsFile = path.join(userDataPath, 'settings.json')
const customScenesFile = path.join(userDataPath, 'customScenes.json')
const favoriteSoundsFile = path.join(userDataPath, 'favoriteSounds.json')

function readFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
    return null
  } catch (error) {
    console.error('读取文件失败:', filePath, error)
    return null
  }
}

function writeFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('写入文件失败:', filePath, error)
    return false
  }
}

// 设置
ipcMain.handle('get-settings', async () => {
  return readFile(settingsFile) || { theme: 'light', masterVolume: 80, autoStopMinutes: 0 }
})

ipcMain.handle('save-settings', async (event, settings) => {
  return writeFile(settingsFile, settings)
})

// 自定义场景
ipcMain.handle('get-custom-scenes', async () => {
  return readFile(customScenesFile) || []
})

ipcMain.handle('save-custom-scene', async (event, scene) => {
  const scenes = readFile(customScenesFile) || []
  const existingIndex = scenes.findIndex(s => s.id === scene.id)
  if (existingIndex >= 0) {
    scenes[existingIndex] = scene
  } else {
    scenes.push(scene)
  }
  return writeFile(customScenesFile, scenes)
})

ipcMain.handle('delete-custom-scene', async (event, id) => {
  const scenes = readFile(customScenesFile) || []
  return writeFile(customScenesFile, scenes.filter(s => s.id !== id))
})

// 收藏声音
ipcMain.handle('get-favorite-sounds', async () => {
  return readFile(favoriteSoundsFile) || []
})

ipcMain.handle('save-favorite-sound', async (event, sound) => {
  const sounds = readFile(favoriteSoundsFile) || []
  sounds.push(sound)
  return writeFile(favoriteSoundsFile, sounds)
})

ipcMain.handle('delete-favorite-sound', async (event, id) => {
  const sounds = readFile(favoriteSoundsFile) || []
  return writeFile(favoriteSoundsFile, sounds.filter(s => s.id !== id))
})

// 音频文件路径 - 返回实际文件路径
ipcMain.handle('get-audio-path', async (event, fileName) => {
  const audioPath = getAudioPath(fileName)
  if (fs.existsSync(audioPath)) {
    return audioPath
  }
  return null
})
