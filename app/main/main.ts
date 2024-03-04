// Main File for Electron

import {
  exec,
  execFile,
} from 'child_process';
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
import * as contextMenu from 'electron-context-menu';
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
  public port: number | null = null;

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

  private runPythonServer(port: number): any {
    const args = ['--host 127.0.0.1', `--port ${port}`];
    const modifiedArgs = args.flatMap(arg => arg.split(/\s+/));
    const pythonProcess = isProd
      ? execFile(path.join(process.resourcesPath, 'server', 'runner'), modifiedArgs)
      : spawn('python', ['-m', 'server.server', ...modifiedArgs], {
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
        this.port = port;
        console.log(`APP: Starting server for model: ${model} on port: ${port}`);
        this.serverProcess = this.runPythonServer(port);

        this.serverProcess.stdout.on('data', async (data: Buffer) => {
          const output = data.toString('utf8');
          console.log('Server output:', output);

          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if the server is ready
          if (output.includes('Starting httpd')) {
            fetch(`http://127.0.0.1:${port}/api/init`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ model }),
            }).then(() => {
              resolve(); // Resolve the promise when the server is ready
            }).catch((err) => {
              console.error('Error initializing the server:', err);
              reject(err);
            });
          }
        });

        this.serverProcess.on('close', (code: number | null) => {
          console.log(`Server process exited with code ${code}`);
          this.serverProcess = null;
        });

        this.serverProcess.on('error', (err: any) => {
          console.error(`Error in server process: ${err}`);
          this.serverProcess = null;
          reject(err);
        });
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

contextMenu.default({
  showInspectElement: !isProd,
});

let openModal: 'settings' | 'directory' | null = null;

let globalWindow: BrowserWindow | null = null;

const triggerShortcut = () => {
  if (openModal || !globalWindow) {
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
    model: {
      type: 'string',
      default: 'mistralai/Mistral-7B-Instruct-v0.2',
    },
    personalization: {
      type: 'string',
      default: '',
    },
    customResponse: {
      type: 'string',
      default: '',
    },
  },
});

const serverManager = new ServerManager();

const createWindow = () => {
  const icon = nativeImage.createFromPath(
    !isProd
      ? '../assets/IconTemplate.png'
      : path.join(process.resourcesPath, 'IconTemplate.png'),
  );
  // if you want to resize it, be careful, it creates a copy
  const trayIcon = icon.resize({ width: 16 });
  // here is the important part (has to be set on the resized version)
  trayIcon.setTemplateImage(true);
  let tray = new Tray(trayIcon);
  tray.setTitle(isProd ? '' : 'M');

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
    icon: __dirname + '../../assets/public/icon.icns',
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

  win.webContents.on('did-finish-load', async () => {
    await serverManager.start(store.get('model') as string);
    /// then close the loading screen window and show the main window
    if (splash) {
      splash.close();
    }
    app.dock.hide();
    win.show();
    globalShortcut.register(store.get('keybind') as string, triggerShortcut.bind(null));
  });

  // @ts-expect-error -- We don't have types for electron
  win.on('blur', (event) => {
    if (openModal) {
      win.setAlwaysOnTop(false);
    }
    if (openModal === 'directory') {
      return;
    }
    globalShortcut.unregister('Escape');
    globalShortcut.unregister('Cmd+Q');
    win.hide();
    if (openModal) {
      return;
    }

    Menu.sendActionToFirstResponder('hide:');
  });

  win.on('focus', () => {
    globalShortcut.register('Cmd+Q', () => {
      if (!win.isFocused()) {
        return;
      }
      app.quit();
    });
    globalShortcut.register('Escape', () => {
      if (!win.isFocused()) {
        return;
      }
      win.blur();
    });
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
      settingsModal.loadURL('app://./settings.html');
    } else {
      // const port = process.argv[2];
      settingsModal.loadURL('http://localhost:3000/settings');
    }

    settingsModal.on('closed', () => {
      openModal = null;
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
            openModal = 'settings';
            if (settingsModal !== null) {
              settingsModal.close();
            }
            createSettings();
          },
          accelerator: 'Cmd+,',
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' },
          ],
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
    openModal = 'directory';
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then((result: any) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      // Weird hack to bring the window to the front after allowing windows in front of it
      win?.setAlwaysOnTop(true, 'floating');

      openModal = null;
      event.sender.send('selected-directory', result.filePaths);
    });
  });

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
  }, 500);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
  });
});

// @ts-expect-error -- We don't have types for electron
app.on('will-quit', (event) => {
  exec(
    `lsof -i :${serverManager.port} -P | awk 'NR>1 {print $2}' | xargs kill`,
    (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    },
  );
  BrowserWindow.getAllWindows().forEach((win) => {
    win.close();
    win.destroy();
  });
});
