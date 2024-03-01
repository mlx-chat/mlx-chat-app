// Main File for Electron

import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  Tray,
} from 'electron';
import Store from 'electron-store';
import * as net from 'net';

const path = require('path');
const serve = require('electron-serve');
const { spawn } = require('child_process');

function handleSetTitle(event: any, title: string) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  if (win !== null) {
    win.setTitle(title);
  }
}

// Python Server
class ServerManager {
  private serverProcess: any | null = null;

  private findOpenPort(startingPort: number): Promise<number> {
    return new Promise<number>((resolve) => {
      const server = net.createServer();

      server.listen(startingPort, () => {
        const port = (server.address() as net.AddressInfo).port;
        server.close(() => resolve(port));
      });

      server.on(
        'error',
        (err: any) => err.code === 'EADDRINUSE' && resolve(this.findOpenPort(startingPort + 1)),
      );
    });
  }

  private runPythonServer(model: string, port: number): any {
    const args = [`--model ${model}`, '--host 127.0.0.1', `--port ${port}`];
    const modifiedArgs = args.flatMap(arg => arg.split(/\s+/));

    const pythonProcess = spawn('python', ['-m', 'server.server', ...modifiedArgs], {
      cwd: '../',
    });
    pythonProcess.stdout.on(
      'data',
      (data: Buffer) => console.log('Server output:', data.toString('utf8')),
    );
    pythonProcess.stderr.on(
      'data',
      (data: Buffer) => console.log(`Server error: ${data.toString('utf8')}`),
    );

    return pythonProcess;
  }

  start(model: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.stop();

      this.findOpenPort(8080).then((port) => {
        console.log(`Starting server for model: ${model} on port: ${port}`);
        this.serverProcess = this.runPythonServer(model, port);

        this.serverProcess.on('close', (code: number | null) => {
          console.log(`Server process exited with code ${code}`);
          this.serverProcess = null;
        });

        this.serverProcess.on('error', (err: any) => {
          console.error(`Error in server process: ${err}`);
          this.serverProcess = null;
          reject(err);
        });

        resolve();
      });
    });
  }

  stop(): void {
    if (this.serverProcess) {
      console.log('Stopping the server...');
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }
}

// Loading Screen
let splash: BrowserWindow | null;
const createSplashScreen = () => {
  /// create a browser window
  splash = new BrowserWindow(
    {
      width: 200,
      height: 100,
      focusable: false,
      /// remove the window frame, so it will become a frameless window
      frame: false,
      skipTaskbar: true,
      autoHideMenuBar: true,
    },
  );
  splash.setResizable(false);
  splash.loadURL(`file://${__dirname}/../splash/index.html`);
  splash.on('closed', () => (splash = null));
  splash.webContents.on('did-finish-load', () => {
    if (splash) {
      splash.show();
    }
  });
};

// run renderer
const isProd = process.env.NODE_ENV !== 'development';
if (isProd) {
  serve({ directory: 'out' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

let directoryOpen = false;

let globalWindow: BrowserWindow | null = null;

const triggerShortcut = () => {
  if (directoryOpen || !globalWindow) {
    return;
  }
  if (globalWindow.isFocused()) {
    globalWindow.blur();
    return;
  }
  globalWindow.show();
};

const store = new Store({
  schema: {
    keybind: {
      type: 'string',
      default: 'Cmd+O',
    },
  },
});

const createWindow = () => {
  const icon = nativeImage.createFromPath('path/to/asset.png');
  let tray = new Tray(icon);
  tray.setTitle('M');

  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: !isProd,
    },
    show: false,
    width: 600,
    height: 99,
    resizable: false,
    type: 'panel',
    frame: false,
    skipTaskbar: true,
    autoHideMenuBar: true,
    vibrancy: 'under-window', // on MacOS
    backgroundMaterial: 'acrylic',
  });
  globalWindow = win;
  win.setWindowButtonVisibility(false);
  win.setAlwaysOnTop(true, 'floating');
  win.setVisibleOnAllWorkspaces(true);

  // Expose URL
  if (isProd) {
    win.loadURL('app://./home.html');
  } else {
    // const port = process.argv[2];
    win.loadURL('http://localhost:3000/');
  }

  tray.addListener('click', () => {
    if (win.isFocused()) {
      win.blur();
      return;
    }
    win.show();
  });

  win.webContents.on('did-finish-load', () => {
    /// then close the loading screen window and show the main window
    if (splash) {
      splash.close();
    }
    win.show();
    globalShortcut.register(store.get('keybind') as string, triggerShortcut.bind(null));
  });

  // @ts-expect-error -- We don't have types for electron
  win.on('blur', (event) => {
    if (directoryOpen) {
      win.setAlwaysOnTop(false);
    }
    globalShortcut.unregister('Escape');
    win.hide();
    if (directoryOpen) {
      return;
    }

    Menu.sendActionToFirstResponder('hide:');
  });

  win.on('focus', () => {
    globalShortcut.register('Escape', () => {
      if (!win.isFocused()) {
        return;
      }
      win.blur();
    });
  });

  win.on('close', (event) => {
    event.preventDefault();
    win.hide();
  });
  let settingsModal: BrowserWindow | null = null;

  const createSettings = () => {
    settingsModal = new BrowserWindow({
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
      width: 500,
      height: 500,
      resizable: false,
      minimizable: false,
      titleBarStyle: 'hidden',
      show: false,
      backgroundColor: '#000',
    });

    if (isProd) {
      settingsModal.loadURL('app://./home.html');
    } else {
      // const port = process.argv[2];
      settingsModal.loadURL('http://localhost:3000/settings');
    }

    settingsModal.on('closed', () => {
      directoryOpen = false;
      settingsModal?.destroy();
      settingsModal = null;
    });

    settingsModal.on('ready-to-show', () => {
      settingsModal?.show();
    });

    return settingsModal;
  };

  const nativeMenus: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    {
      label: 'MLX Chat',
      submenu: [
        {
          label: 'Settings',
          click() {
            directoryOpen = true;
            if (settingsModal !== null) {
              settingsModal.close();
            }
            createSettings();
          },
          accelerator: 'Cmd+,',
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(nativeMenus);
  Menu.setApplicationMenu(menu);
};

app.whenReady().then(() => {
  ipcMain.on('set-title', handleSetTitle);
  ipcMain.on('select-directory', (event: any) => {
    directoryOpen = true;
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then((result: any) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      // Weird hack to bring the window to the front after allowing windows in front of it
      win?.setAlwaysOnTop(true, 'floating');

      directoryOpen = false;
      event.sender.send('selected-directory', result.filePaths);
    });
  });

  const serverManager = new ServerManager();
  ipcMain.on('start-server', (event: any, model: string) => {
    event;
    serverManager.start(model)
      .then(() => console.log('Server started successfully'))
      .catch(error => console.error('Error starting server:', error));
  });

  ipcMain.on('resize-window', (event, arg) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      return;
    }
    win.setBounds({
      height: arg.height,
    });
    win.center();
  });

  ipcMain.on('fetch-setting', (event, arg) => {
    event.returnValue = store.get(arg);
  });

  ipcMain.on('update-setting', (_event, arg) => {
    if (arg.key === 'keybind') {
      globalShortcut.unregister(store.get('keybind') as string);
      globalShortcut.register(arg.value, triggerShortcut.bind(null));
    }
    store.set(arg.key, arg.value);
  });

  createSplashScreen();

  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
  });
});

// @ts-expect-error -- We don't have types for electron
app.on('window-all-closed', (event) => {
  event.preventDefault();
});

const nativeMenus = [
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Settings',
        click() {
          openSettings();
          directoryOpen = true;
        },
      },
    ],
  },
];

function openSettings() {
  const newWindow = new BrowserWindow({
    height: 185,
    resizable: false,
    width: 270,
    title: 'Settings',
    minimizable: false,
    fullscreenable: false,
  });

  if (isProd) {
    newWindow.loadURL('app://./home.html');
  } else {
    // const port = process.argv[2];
    newWindow.loadURL('http://localhost:3000/settings');
  }

  newWindow.on('closed', () => {
    directoryOpen = false;
    newWindow.destroy();
  });

  newWindow.on('hide', () => {
    directoryOpen = false;
    newWindow.destroy();
  });
}

const menu = Menu.buildFromTemplate(nativeMenus);
Menu.setApplicationMenu(menu);
