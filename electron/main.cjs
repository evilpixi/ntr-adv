const { app, BrowserWindow } = require('electron')
const path = require('path')

const isDev = !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'NTR Adventure',
    show: false,
  })

  win.once('ready-to-show', () => win.show())

  // Dev: project root is cwd. Packaged: app is in resources/... so app path is the app dir.
  const appPath = isDev ? path.join(__dirname, '..') : app.getAppPath()
  const distPath = path.join(appPath, 'dist', 'index.html')

  win.loadFile(distPath).catch((err) => {
    console.error('loadFile failed:', err)
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
