import { ipcRenderer, contextBridge } from 'electron';

declare global {
  interface Window {
    Main: typeof api;
    ipcRenderer: typeof ipcRenderer;
  }
}

const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sayHello`
   */
  sendMessage: (message: string) => {
    ipcRenderer.send('message', message);
  },
  /**
    Here function for AppBar
   */
  Minimize: () => {
    ipcRenderer.send('minimize');
  },
  Maximize: () => {
    ipcRenderer.send('maximize');
  },
  Close: () => {
    ipcRenderer.send('close');
  },
  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },

  execScript: (scriptPath: string) => {
    ipcRenderer.send('exec-script', scriptPath);
  },

  navigate: (targetURL: string) => {
    ipcRenderer.send('navigate', targetURL);
  },
  
  sendNotification: (notificationTitle: string, notificationBody: string, notificationCount: number, pushNotifications: boolean) => {
    ipcRenderer.sendSync('update-badge', notificationCount);
    if (pushNotifications) {
      ipcRenderer.send('fire-notification-test', notificationTitle, notificationBody);
    }
  },

  resetNotification: () => {
    ipcRenderer.sendSync('update-badge', 0);
  },

  onNotificationClick: (callback: (data: any) => void) => {
    ipcRenderer.on('notification-clicked', (_, data) => callback(data));
  },
};
contextBridge.exposeInMainWorld('Main', api);
/**
 * Using the ipcRenderer directly in the browser through the contextBridge ist not really secure.
 * I advise using the Main/api way !!
 */
contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);
