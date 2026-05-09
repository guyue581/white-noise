# 🎧 白噪音 White Noise

> 一款专注放松的桌面音频混音应用，支持多音轨实时混音、场景预设、定时关闭等功能


---

## ✨ 功能特性

### 🎵 音频播放
- **15种精选音效**：自然音、轻音乐、白噪音、ASMR四大类别
- **多音轨混音**：支持同时播放多个声音，独立调节每个音轨音量
- **总音量控制**：一键调节所有播放中的声音
- **循环播放**：无缝循环，持续陪伴

### 🎭 场景预设
- **6种内置场景**：深度睡眠、雨天专注、森林冥想、咖啡厅工作、海边放松、图书馆学习
- **自定义场景**：保存当前播放组合，创建专属场景
- **一键切换**：快速加载预设音效组合

### ⏱️ 定时关闭
- **快速定时**：15/30/45/60/90/120分钟快捷选项
- **自定义时间**：支持1-999分钟任意设置
- **倒计时显示**：实时显示剩余时间

### 💾 数据管理
- **收藏功能**：收藏喜欢的声音，快速访问
- **主题切换**：浅色/深色模式自适应
- **设置持久化**：自动保存音量、主题等偏好设置

---

## 🛠️ 技术架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron 主进程 (main.js)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ 窗口管理     │  │ IPC 通信    │  │ 文件系统/设置存储    │  │
│  │ BrowserWindow│  │ preload.js  │  │ electron-store     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ IPC 安全通信
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vue 3 渲染进程                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ 组件层       │  │ 状态管理     │  │ 音频引擎             │  │
│  │ Vue SFC     │  │ Pinia Store │  │ Web Audio API       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Electron | 29.1 | 跨平台桌面应用框架 |
| Vue 3 | 3.5.33 | 前端响应式框架 |
| Pinia | 2.3.1 | 状态管理 |
| Vite | 5.4.21 | 构建工具 |
| TailwindCSS | 3.4.19 | 原子化 CSS 框架 |

---

## 📁 项目结构

```
white-noise/
├── electron/                  # Electron 主进程
│   ├── main.js               # 主进程入口（窗口创建、IPC处理）
│   └── preload.js            # 预加载脚本（安全桥接）
├── src/                       # Vue 前端源码
│   ├── main.js               # Vue 应用入口
│   ├── App.vue               # 根组件（导航、主题、页面切换）
│   ├── components/           # 页面组件
│   │   ├── Home.vue          # 首页（音轨控制、声音列表、定时器）
│   │   ├── Scenes.vue        # 场景管理（预设/自定义场景）
│   │   ├── Favorites.vue     # 收藏管理
│   │   └── Settings.vue      # 设置页面（主题、颜色、数据管理）
│   ├── stores/               # Pinia 状态管理
│   │   └── app.js            # 全局状态（主题、设置、场景、收藏）
│   └── style.css             # 全局样式（主题变量、动画）
├── public/                   # 静态资源
│   ├── audio/                # 音频文件（15个MP3）
│   ├── bg-light.svg          # 浅色主题背景
│   ├── bg-dark.svg           # 深色主题背景
│   └── icon.ico/png          # 应用图标
├── package.json              # 项目配置
├── vite.config.js            # Vite 配置
├── tailwind.config.js        # TailwindCSS 配置（自定义主题色）
└── electron-builder.json     # 打包配置
```

---

## 🔧 核心逻辑详解

### 1. 音频引擎（多音轨混音）

```javascript
// 核心数据结构：Map<文件名, 音轨对象>
const audioTracks = new Map()

// 音轨对象结构
{
  audio: Audio,      // HTML5 Audio 实例
  volume: 0.5,       // 音轨独立音量 (0-1)
  playing: true,     // 播放状态
  name: '雨后森林',   // 显示名称
  emoji: '🌲'        // 图标
}

// 实际音量计算
实际音量 = 音轨音量 × 主音量
```

**关键特性：**
- 每个声音独立为一个 `Audio` 实例
- 支持动态添加/移除音轨
- 实时调节单个音轨或主音量
- 预加载音频路径（Electron 环境使用绝对路径）

### 2. 状态管理（Pinia Store）

```javascript
// 核心状态
const theme = ref('light')           // 当前主题
const currentView = ref('home')      // 当前页面
const settings = ref({...})          // 用户设置
const scenes = ref([...])            // 内置场景列表
const customScenes = ref([])         // 自定义场景
const favoriteSounds = ref([])       // 收藏的声音

// 持久化存储（通过 Electron IPC）
window.electronAPI.saveSettings(settings)
window.electronAPI.getSettings()
```

### 3. 场景系统

```javascript
// 场景数据结构
{
  id: 'deep-sleep',
  name: '深度睡眠',
  emoji: '🌙',
  description: '风扇声 + 雨声，助您安然入睡',
  tracks: [
    { file: 'white_fan.mp3', volume: 40 },
    { file: 'nature_rain_forest.mp3', volume: 50 }
  ]
}

// 播放场景逻辑
1. 停止当前所有音轨
2. 遍历场景 tracks 数组
3. 为每个 track 创建 Audio 实例
4. 应用预设音量 × 主音量
5. 开始播放
```

### 4. 定时关闭系统

```javascript
// 双定时器设计
let autoStopTimer = null      // setTimeout - 最终停止
let countdownInterval = null  // setInterval - 倒计时更新

// 工作流程
设置定时 → 启动 countdownInterval（每秒更新剩余时间）
       → 启动 autoStopTimer（到时间执行停止）
       
// 倒计时显示格式
剩余时间 = Math.floor(remainingTime / 60) + ':' + String(remainingTime % 60).padStart(2, '0')
```

### 5. Electron 安全通信

```javascript
// preload.js - 暴露安全 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 设置读写
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // 场景管理
  getCustomScenes: () => ipcRenderer.invoke('get-custom-scenes'),
  saveCustomScene: (scene) => ipcRenderer.invoke('save-custom-scene', scene),
  deleteCustomScene: (id) => ipcRenderer.invoke('delete-custom-scene', id),
  
  // 收藏管理
  getFavoriteSounds: () => ipcRenderer.invoke('get-favorite-sounds'),
  saveFavoriteSound: (sound) => ipcRenderer.invoke('save-favorite-sound', sound),
  deleteFavoriteSound: (id) => ipcRenderer.invoke('delete-favorite-sound', id),
  
  // 音频路径（Electron 环境使用绝对路径）
  getAudioPath: (fileName) => ipcRenderer.invoke('get-audio-path', fileName)
})
```

---

## 🚀 开发指南

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
# 同时启动 Vite 开发服务器和 Electron
npm run electron:dev
```

### 构建应用
```bash
# 构建 Windows 安装包
npm run electron:build

# 仅构建（不打包）
npm run electron:build:win
```

---

## 📦 打包配置说明

```json
{
  "appId": "com.whitenoise.app",
  "productName": "白噪音",
  "asarUnpack": ["dist/audio/**/*"],  // 音频文件不解包，避免播放问题
  "win": {
    "target": "nsis",
    "arch": ["x64"]
  },
  "nsis": {
    "oneClick": false,                // 允许自定义安装路径
    "createDesktopShortcut": true,    // 创建桌面快捷方式
    "language": "2052"                // 简体中文
  }
}
```

---

## 🎨 主题系统

### CSS 变量定义
```css
/* 浅色主题 */
.theme-light {
  --color-bg: #f5f5f5;
  --color-card: #ffffff;
  --color-text: #1f2937;
  --color-primary: #667eea;
  --color-secondary: #764ba2;
}

/* 深色主题 */
.theme-dark {
  --color-bg: #1a1a2e;
  --color-card: #16213e;
  --color-text: #e5e7eb;
  --color-primary: #667eea;
  --color-secondary: #764ba2;
}
```

### 主题切换逻辑
```javascript
// 切换时动态修改 html class
document.documentElement.classList.remove('theme-light', 'theme-dark')
document.documentElement.classList.add(`theme-${newTheme}`)
```

---

## 📄 音频资源清单

| 类别 | 文件名 | 名称 | 用途 |
|------|--------|------|------|
| 自然 | nature_rain_forest.mp3 | 雨后森林 | 助眠、放松 |
| 自然 | nature_ocean_waves.mp3 | 海浪声 | 冥想、减压 |
| 自然 | nature_bird_songs.mp3 | 鸟鸣山间 | 清晨唤醒 |
| 自然 | nature_stream.mp3 | 溪流潺潺 | 专注学习 |
| 自然 | nature_campfire.mp3 | 篝火噼啪 | 温暖氛围 |
| 音乐 | music_piano.mp3 | 钢琴曲 | 工作背景 |
| 音乐 | music_guitar.mp3 | 吉他弹唱 | 休闲放松 |
| 音乐 | music_classical.mp3 | 古典音乐 | 深度专注 |
| 音乐 | music_meditation.mp3 | 冥想音乐 | 瑜伽冥想 |
| 白噪音 | white_fan.mp3 | 风扇声 | 睡眠辅助 |
| 白噪音 | white_coffee_shop.mp3 | 咖啡厅 | 工作氛围 |
| 白噪音 | white_library.mp3 | 图书馆 | 学习专注 |
| ASMR | asmr_tapping.mp3 | 敲击声 | 放松解压 |
| ASMR | asmr_writing.mp3 | 书写声 | 助眠 |
| ASMR | asmr_page_turn.mp3 | 翻书声 | 阅读陪伴 |

---

## 🔒 安全说明

- **contextIsolation**: true - 启用上下文隔离
- **nodeIntegration**: false - 禁用 Node.js 集成
- **preload 脚本**: 通过 IPC 安全暴露必要 API
- **CSP 策略**: 限制外部资源加载

---

## 📄 许可证

MIT License - 自由使用、修改和分发

---

## 🙏 致谢

- 音频资源来自优质免版权素材
- UI 设计采用现代化毛玻璃风格
- 感谢 Electron 和 Vue 社区
