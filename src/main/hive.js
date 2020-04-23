import { ipcMain, dialog } from 'electron'
import store from './store'
import HiveLibrary from './library'

export default class Hive {
    constructor(mainWindow) {
        this.config = store.get('hive-config')
        //store.clear()
        this.ipcSetup()
        this.main = mainWindow
        this.renderer = mainWindow.webContents
        if (!this.config) this.renderer.send('begin-config')
        else this.setup(this.config)
    }

    ipcSetup() {
        ipcMain.on('select-dirs', async (event, arg) => {

        })
        ipcMain.on('begin-config', async (event, arg) => {
            console.log('begin config')
            this.createConfig().then(config => {
                this.setup(config)
                event.reply('config', this.config)
            })
        })
        ipcMain.on('config', async (event) => {
            console.log('config requested')
            if (!this.config) event.reply('begin-config')
            else event.reply('config', this.config)
        })
        ipcMain.on('library', async (event) => {
            console.log('library requested') 
            if (this.library.ready) event.reply('library', this.library.db)
        })
    }

    setup(config) {
        console.log('begin setup', config)
        this.library = new HiveLibrary(config.library)
        this.library.on('scan:begin', path => {
            this.renderer.send('library:loading', path)
        })
        this.library.on('scan:done', library => {
            console.log('scan done, sending library')
            this.renderer.send('library', library)
        })
    }

    async createConfig() {
        const path = await dialog.showOpenDialog(this.main, {
            properties: ['openDirectory']
        })
        console.log('directories selected', path.filePaths)
        const config = {
            library: {
                path: path.filePaths[0],
                ext: ['mp3', 'wav', 'flac']
            }
        }
        store.set('hive-config', config)
        return config
    }

}