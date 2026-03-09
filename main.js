const { app, BrowserWindow, shell, session } = require('electron');

let mainWindow;

app.commandLine.appendSwitch('enable-usermedia-screen-capturing');
app.commandLine.appendSwitch('allow-http-screen-capture');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
app.commandLine.appendSwitch('enable-experimental-web-platform-features');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'ExeChat',
    backgroundColor: '#0f0f14',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: false,
      experimentalFeatures: true
    },
    autoHideMenuBar: true,
    show: false
  });

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
  });

  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    callback({ video: request.videoRequested, audio: request.audioRequested });
  });

  mainWindow.loadURL('https://exechat.duckdns.org');
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.log('Render process gone:', details.reason);
    createWindow();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) { e.preventDefault(); mainWindow.hide(); }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => { app.isQuitting = true; });
