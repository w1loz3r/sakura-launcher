const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { Client } = require('minecraft-launcher-core');

let win;

const APP_DIR = app.getPath('userData');
const CFG_PATH = path.join(APP_DIR, 'launcher-config.json');
const GAME_DIR = path.join(APP_DIR, 'minecraft');

function ensureDirs() {
  if (!fs.existsSync(APP_DIR)) fs.mkdirSync(APP_DIR, { recursive: true });
  if (!fs.existsSync(GAME_DIR)) fs.mkdirSync(GAME_DIR, { recursive: true });
}

function readConfig() {
  ensureDirs();
  const defaults = { version: '1.20.1', ram: 4096, nickname: 'SakuraPlayer' };
  if (!fs.existsSync(CFG_PATH)) {
    fs.writeFileSync(CFG_PATH, JSON.stringify(defaults, null, 2), 'utf8');
    return defaults;
  }
  try {
    const raw = fs.readFileSync(CFG_PATH, 'utf8');
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function writeConfig(next) {
  ensureDirs();
  fs.writeFileSync(CFG_PATH, JSON.stringify(next, null, 2), 'utf8');
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 680,
    title: 'Sakura Launcher',
    backgroundColor: '#120f1f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) win.loadURL(devUrl);
  else win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('launcher:getConfig', async () => readConfig());

ipcMain.handle('launcher:saveConfig', async (_event, patch) => {
  const prev = readConfig();
  const next = {
    ...prev,
    version: String(patch?.version ?? prev.version),
    ram: Number(patch?.ram ?? prev.ram),
    nickname: String(patch?.nickname ?? prev.nickname)
  };
  writeConfig(next);
  return { ok: true, config: next };
});

ipcMain.handle('launcher:play', async (_event, payload) => {
  const cfg = readConfig();
  const version = String(payload?.version ?? cfg.version);
  const ram = Number(payload?.ram ?? cfg.ram);
  const nickname = String(payload?.nickname ?? cfg.nickname);

  const launcher = new Client();

  const opts = {
    authorization: {
      access_token: '0',
      client_token: '0',
      uuid: '00000000-0000-0000-0000-000000000000',
      name: nickname,
      user_properties: '{}',
      meta: { type: 'mojang' }
    },
    root: GAME_DIR,
    version: { number: version, type: 'release' },
    memory: { max: `${ram}M`, min: '1024M' }
  };

  return new Promise((resolve) => {
    let resolved = false;

    launcher.on('debug', (e) => win?.webContents.send('launcher:log', `[debug] ${String(e)}`));
    launcher.on('data', (e) => win?.webContents.send('launcher:log', `[mc] ${String(e)}`));
    launcher.on('error', (e) => {
      if (!resolved) {
        resolved = true;
        resolve({ ok: false, message: `Ошибка запуска: ${String(e)}` });
      }
    });

    try {
      launcher.launch(opts);
      if (!resolved) {
        resolved = true;
        resolve({ ok: true, message: `Запуск ${version} от имени ${nickname}...` });
      }
    } catch (e) {
      if (!resolved) {
        resolved = true;
        resolve({ ok: false, message: `Launch exception: ${String(e)}` });
      }
    }
  });
});
