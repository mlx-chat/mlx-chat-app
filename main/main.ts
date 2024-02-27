// Main File for Electron

import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
} from 'electron';

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
export class ServerManager {
    private serverProcess: any | null = null;
  
    private findOpenPort(startingPort: number): Promise<number> {
      return new Promise<number>((resolve) => {
        const server = net.createServer();
  
        server.listen(startingPort, () => {
          const port = (server.address() as net.AddressInfo).port;
          server.close(() => resolve(port));
        });
  
        server.on('error', (err: any) => err.code === 'EADDRINUSE' && resolve(this.findOpenPort(startingPort + 1)));
      });
    }
  
    private runPythonServer(model: string, port: number): any {
      const args = [`--model ${model}`, '--host 127.0.0.1', `--port ${port}`];
      const modifiedArgs = args.flatMap(arg => arg.split(/\s+/));
  
      const pythonProcess = spawn('python', ['-m', 'server.server', ...modifiedArgs]);
      pythonProcess.stdout.on('data', (data: Buffer) => console.log("Server output:", data.toString('utf8')));
      pythonProcess.stderr.on('data', (data: Buffer) => console.log(`Server error: ${data.toString('utf8')}`));
  
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

const createWindow = () => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: !isProd,
    },
    show: false,
    width: 1000,
    height: 800,
    minHeight: 800,
    minWidth: 1000,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      height: 20,
    },
  });

  win.webContents.openDevTools();

  // Expose URL
  if (isProd) {
    win.loadURL('app://./home.html');
  } else {
    // const port = process.argv[2];
    win.loadURL('http://localhost:3000/');
  }

  win.webContents.on('did-finish-load', () => {
    /// then close the loading screen window and show the main window
    if (splash) {
      splash.close();
    }
    win.show();
  });
};

app.whenReady().then(() => {
  ipcMain.on('set-title', handleSetTitle);
  ipcMain.on('select-directory', (event: any) => {
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then((result: any) => {
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
  
  createSplashScreen();

  // createWindow();
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});
