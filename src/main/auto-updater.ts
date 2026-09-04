import { dialog } from 'electron'
import { autoUpdater } from 'electron-updater'

export function initAutoUpdater(): void {
  if (process.platform === 'darwin') {
    return
  }

  try {
    autoUpdater.autoDownload = false

    autoUpdater.on('update-available', async () => {
      const result = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Download now', 'Later'],
        defaultId: 0,
        cancelId: 1,
        title: 'Update available',
        message: 'A new version is available.',
        detail: 'Download and install it now?'
      })
      if (result.response === 0) {
        autoUpdater.downloadUpdate().catch((err) => console.error(err))
      }
    })

    autoUpdater.on('error', (error) => {
      console.error('Auto update error:', error)
    })

    autoUpdater.on('update-not-available', () => {
      // no-op
    })

    autoUpdater.on('update-downloaded', async () => {
      const res = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Restart now', 'Later'],
        defaultId: 0,
        cancelId: 1,
        title: 'Update ready',
        message: 'The update has finished downloading.',
        detail: 'Restart now to apply it?'
      })
      if (res.response === 0) {
        setImmediate(() => autoUpdater.quitAndInstall(false, true))
      }
    })

    // Trigger the check after window creation
    autoUpdater.checkForUpdates().catch((err) => console.error(err))
  } catch (e) {
    console.error('Failed to initialize auto-updater:', e)
  }
}
