// Native
import { join } from 'path';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent, Menu } from 'electron';
import isDev from 'electron-is-dev';

const height = 600;
const width = 800;

let window : BrowserWindow;

function createWindow() {
  // Create the browser window.
  window = new BrowserWindow({
    width,
    height,
    //  change to false to use AppBar
    frame: true,
    icon : path.join(__dirname, '../src/assets/icons/Bitbit.png'),
    show: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    }
  });

  const menuTemplate = [
    {
      label: 'Back',
      click: () => {
        if (window.webContents.canGoBack()) {
          window.webContents.goBack();
        }
      },
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  const port = process.env.PORT || 3000;
  const url = isDev ? `http://localhost:${port}` : join(__dirname, '../src/out/index.html');

  // and load the index.html of the app.
  if (isDev) {
    window?.loadURL(url);
  } else {
    window?.loadFile(url);
  }
  // Open the DevTools.
  // window.webContents.openDevTools();

  // For AppBar
  ipcMain.on('minimize', () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMinimized() ? window.restore() : window.minimize();
    // or alternatively: win.isVisible() ? win.hide() : win.show()
  });
  ipcMain.on('maximize', () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMaximized() ? window.restore() : window.maximize();
  });

  ipcMain.on('close', () => {
    window.close();
  });

  window.webContents.session.on('will-download', (event, item, webContents) => {
    const savePath = path.join(__dirname, '../src/assets/alcascripts', item.getFilename());

    console.log(`File will be downloaded to: ${savePath}`);
    
    item.setSavePath(savePath);
  
    item.on('updated', (updateEvent, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`);
        }
      }
    });
  
    item.once('done', (doneEvent, state) => {
      if (state === 'completed') {
        const browserWindow = BrowserWindow.fromWebContents(webContents);
        if (browserWindow) {
            browserWindow.close();
        } else {
            console.error('No browser window associated with the webContents');
        }
        console.log('Download successfully');
        try {
          if (!fs.existsSync(savePath)) {
            throw new Error(`Script file does not exist: ${savePath}`);
          }
          // Set execute permissions for the script
          if (process.platform !== 'win32') {
            fs.chmodSync(savePath, 0o755);
          }
          // Execute the script
          exec(`powershell.exe -ExecutionPolicy Bypass -File ${savePath}`, (error, stdout, stderr) => {
            if (error) {
              console.error(`Execution error: ${error.message}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            if (stderr) {
              console.error(`stderr: ${stderr}`);
            }
    
            // Script executed, now remove the script file
            fs.unlink(savePath, (unlinkError) => {
              if (unlinkError) {
                console.error(`Error removing script file: ${unlinkError.message}`);
              } else {
                console.log(`Script file removed: ${savePath}`);
              }
            });
          });
      
        } catch (error) {
          console.error('Script execution error:', error);
        }
      } else if (state === 'cancelled') {
        console.log('Download cancelled');
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
    
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on('message', (event: IpcMainEvent, message: any) => {
  console.log(message);
  setTimeout(() => event.sender.send('message', 'Reconnected'), 500);
});

ipcMain.on('exec-script', (event, scriptPath: string) => {
  try {
    // Define the full path to the script within your app's directory
    const scriptFullPath = path.join(app.getAppPath(), scriptPath);

    // Check if the script file exists
    if (!fs.existsSync(scriptFullPath)) {
      throw new Error(`Script file does not exist: ${scriptFullPath}`);
    }

    // Set execute permissions for the script (only for non-Windows platforms)
    if (process.platform !== 'win32') {
      fs.chmodSync(scriptPath, 0o755);
    }

    // Execute the script
    exec(`powershell.exe -ExecutionPolicy Bypass -File ${scriptFullPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error.message}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
    });

  } catch (error) {
    console.error('Script execution error:', error);
  }
});

ipcMain.on('navigate', (event, targetURL: string) => {
  window.loadURL(targetURL)
});