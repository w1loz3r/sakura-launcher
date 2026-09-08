const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#120f1f',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // ВАЖНО: грузим именно dist/index.html
  win.loadFile(path.join(__dirname, '../dist/index.html'));

  // Открой DevTools в сборке, чтобы видеть ошибку
  win.webContents.openDevTools({ mode: 'detach' });

  win.webContents.on('did-fail-load', (_e, code, desc) => {
    console.log('did-fail-load:', code, desc);
  });

  win.webContents.on('render-process-gone', (_e, details) => {
    console.log('render-process-gone:', details);
  });

  win.webContents.on('console-message', (_e, level, message) => {
    console.log('renderer console:', level, message);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
