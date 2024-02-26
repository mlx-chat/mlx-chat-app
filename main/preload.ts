// eslint-disable-next-line import/no-extraneous-dependencies
import {
  contextBridge,
  ipcRenderer,
} from 'electron';

export const electronAPI = {
  setTitle: (title: string) => ipcRenderer.send('set-title', title),
  selectDirectory: () => ipcRenderer.send('select-directory'),
  onSelectDirectory: (cb: (customData: string[]) => void) => {
    ipcRenderer.on('selected-directory', (event, customData) => {
      // eslint-disable-next-line no-console
      console.log(event);
      cb(customData);
    });
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
