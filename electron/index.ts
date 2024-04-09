// Native
import { join } from 'path';
import * as fs from 'fs';
import * as path from 'path';

// Packages
import { BrowserWindow, BrowserView, app, ipcMain, IpcMainEvent, Menu, Notification, screen } from 'electron';
import isDev from 'electron-is-dev';

const Badge = require('electron-windows-badge');
const os = require('os');

const height = 600;
const width = 800;

let window: BrowserWindow;

function createWindow() {
  // Create the browser window.
  window = new BrowserWindow({
    width,
    height,
    //  change to false to use AppBar
    icon: path.join(__dirname, '../src/assets/icons/Bitbit.png'),
    show: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  });

  // const view = new BrowserView()
  // window.setBrowserView(view)
  // view.setBounds({ x: 325, y: 10, width: 400, height: 250 })
  // view.setAutoResize({width:true, height:true, vertical:true, horizontal: true})
  // view.webContents.loadURL('https:ntouch.nus.edu.sg')

  const badgeOptions = {};
  new Badge(window, badgeOptions);

  const menuTemplate = [
    {
      label: 'Back',
      click: () => {
        if (window.webContents.canGoBack()) {
          window.webContents.goBack();
        }
      }
    }
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

  // For AppBar
  ipcMain.on('minimize', () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMinimized() ? window.restore() : window.minimize();
    // or alternatively: win.isVisible() ? win.hide() : win.show()
  });

  ipcMain.on('maximize', () => {
    // eslint-disable-next-line no-unused-expression
    window.isMaximized() ? window.restore() : window.maximize();
  });

  ipcMain.on('close', () => {
    window.close();
  });

  window.webContents.on('before-input-event', (_, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      window.webContents.isDevToolsOpened()
        ? window.webContents.closeDevTools()
        : window.webContents.openDevTools({ mode: 'right' });
    }
  });

  // Alca direct script download logic
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
          elevate(`powershell.exe -ExecutionPolicy Bypass -File ${savePath}`, (error, stdout, stderr) => {
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
  setTimeout(() => event.sender.send('message'), 500);
});

// Manual script downloading logic
function requiresElevation(platform) {
  return platform === 'win32';
}

const fsPromises = require('fs').promises;
const elevate = require('node-windows').elevate;

ipcMain.on('exec-script', async (event, scriptPath) => {
  const extension = '.ps1';
  const scriptFullPath = path.join(app.getAppPath(), `${scriptPath}${extension}`);
  const outputFilePath = path.join(app.getAppPath(), '/src/assets/scripts/script-output.txt');

  try {
    // Check if the script file exists
    if (
      !(await fsPromises
        .access(scriptFullPath)
        .then(() => true)
        .catch(() => false))
    ) {
      throw new Error(`Script file does not exist: ${scriptFullPath}`);
    }

    // Execute the PowerShell script with elevation
    await new Promise<void>((resolve, reject) => {
      elevate(
        `powershell.exe -Command "& {powershell.exe -ExecutionPolicy Bypass -File '${scriptFullPath}' > '${outputFilePath}'}"`,
        function (error) {
          if (error) {
            console.error(`Execution error: ${error.message}`);
            reject(error);
            return;
          }
          resolve();
        }
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 10000));

    const data = await fsPromises.readFile(outputFilePath, 'UTF-16LE');
    console.log(`stdout: ${data}`);
    event.sender.send('scriptCompleted', data);

    await fsPromises.unlink(outputFilePath);
    console.log('Output file removed successfully.');
  } catch (error) {
    console.error('Error in script execution or file handling:', error.message);
  }
});

const imgSrc = imageToBase64(path.join(__dirname, '../src/assets/icons/Bitbit.png'));

function imageToBase64(imgPath) {
  // Ensure the path is absolute
  const absolutePath = path.resolve(imgPath);
  // Read the file into a buffer
  const file = fs.readFileSync(absolutePath);
  // Convert the buffer to a base64 string
  return `data:image/png;base64,${file.toString('base64')}`;
}

function createCustomNotification(title, message) {
  app.whenReady().then(() => {
    // Get the size of the primary display.
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    let notificationWindow = new BrowserWindow({
      width: 400,
      height: 100,
      x: width - 400,
      y: height - 100,
      frame: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    // Custom CSS for styling + animation
    const customStyle = `
      <style>
        body {
          margin: 0;
          padding: 10px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #ADD8E6;
          color: #000000;
          display: flex;
          flex-direction: row; 
          border-radius: 10px;
        }
        .notification {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: start;
        }
        .title {
          font-weight: bold;
        }
        .message {
          margin: 5px 0; 
        }
        .close-button {
          cursor: pointer;
          padding: 5px;
          margin-left: auto; 
        }
        .logo {
          margin-right: 10px;
        }
      </style>
    `;

    const notificationHTML = `
      <html>
        <head>${customStyle}</head>
        <body>
          <div class="logo">
            <img src=${imgSrc} height="50">
          </div>
          <div class="notification">
            <div class="title">${title}</div>
            <div class="message">${message}</div>
          </div>
          <div class="close-button" onclick="closeNotification()">
            X
          </div>
          <script>
            const { ipcRenderer } = require('electron');
            function closeNotification() {
              ipcRenderer.send('close-notification');
            }
          </script>
        </body>
      </html>
    `;

    notificationWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(notificationHTML)}`);

    ipcMain.on('close-notification', () => {
      if (!notificationWindow.isDestroyed()) {
        notificationWindow.close();
      }
    });

    // Close the notification window after a delay
    setTimeout(() => {
      if (!notificationWindow.isDestroyed()) {
        notificationWindow.close();
      }
    }, 20000);
  });
}

// Listen for click events from the notification window
ipcMain.on('notification-clicked', () => {
  console.log('Custom Notification clicked');
  if (window && window.isMinimized()) window.restore();
  window.focus();
});

// Listen for click events from the notification window
ipcMain.on('notification-clicked', () => {
  console.log('Custom Notification clicked');
  if (window && window.isMinimized()) window.restore();
  window.focus();
});

// Adjusted fire-notification-test event without native Notification
ipcMain.on('fire-notification-test', (event, notificationTitle) => {
  // Create a custom notification with the title and a custom message
  createCustomNotification(notificationTitle, 'This is a custom notification.');
});

// Run Alca page
ipcMain.on('navigate', (event, targetURL: string) => {
  window.loadURL(targetURL);
});
