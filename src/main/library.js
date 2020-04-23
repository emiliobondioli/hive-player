import { ipcMain } from 'electron'
import path from 'path'
import store from './store'
import fs from 'fs'
import consola from 'consola'
import * as mm from 'music-metadata'
import util from 'util'
import { EventEmitter } from 'events'
import { TagItemHeader } from 'music-metadata/lib/apev2/APEv2Token'
import Analizer from './analyzer'

const afs = fs.promises

export default class HiveLibrary extends EventEmitter {
    constructor(config) {
        super()
        this.options = config
        this.path = path.resolve(config.path)
        this.root = path.join(this.path, '/hive-data')
        this.queue = []
        this.dbPath = path.join(this.path, 'hive-data/hive-db.json')
        this.ready = false
        this.analyzer = new Analizer(this.root)
        if (fs.existsSync(this.dbPath)) {
            consola.info('database exists, loading')
            afs.readFile(this.dbPath).then(r => {
                const db = JSON.parse(r)
                if (!db) {
                    consola.info('database corrupted, re-init', db)
                    return this.initDatabase()
                }
                consola.info('database loaded')
                this.initLibrary(db)
            })
        } else this.initDatabase()
    }

    initLibrary(db) {
        this.db = db
        this.nextId = 0
        if (db.tracks.length) this.nextId = this.getMaxId(db.tracks) + 1
        this.emit('scan:begin', this.dbPath)
        this.scan()
            .then(tracks => {
                this.tracks = [...this.tracks, ...tracks.map((t, i) => {
                    return { ...t, id: i + this.nextId }
                })]
            })
            .then(() => {
                this.emit('scan:done', this.db)
                this.ready = true
                const missingWaveforms = this.tracks.filter(t => !t.waveformPath)
                if(missingWaveforms.length) this.computeWaveforms()
                this.analyzer.normalizePeaks(this.tracks[2].waveformPath)
                this.saveDatabase(this.db)
                consola.info(`library loaded, ${this.tracks.length} tracks found`)
            })
    }

    getMaxId(tracks) {
        return Math.max(tracks.map(t => t.id !== undefined ? t.id : 0))
    }

    initDatabase() {
        const db = {
            created: new Date().toISOString(),
            tracks: []
        }
        this.initLibrary(db)
        this.saveDatabase(db)
    }

    saveDatabase(db) {
        return afs.writeFile(this.dbPath, JSON.stringify(db))
    }

    getTrack(id) {
        return this.db.tracks.find(t => t.id === id)
    }

    updateTrack(track) {
        const trackId = this.db.tracks.indexOf(this.getTrack(track.id))
        return this.db.tracks[trackId] = track
    }

    computeWaveforms(tracks) {
        consola.info(`begin analyzing ${tracks.length} tracks`)
        this.queue.push(...tracks)
        const track = this.queue.shift()
        this.analyzer.getPeaks(track)
        this.analyzer.on('analyze:done', track => {
            consola.info(`track ${track.info.title} analyzed`)
            this.updateTrack(track)
            //this.saveDatabase()
            if(this.queue.length) {
                const track = this.queue.shift()
                this.analyzer.getPeaks(track)
            }
        })
    }

    getWaveform(track) {
    }

    scan() {
        return afs.readdir(this.path)
            .then(data => {
                const files = data.filter(d => {
                    const ext = d.split('.')
                    if (ext.length >= 1) return this.options.ext.includes(ext.pop())
                })
                return files
            })
            .then(list => {
                const tracks = []
                list.forEach(file => {
                    if (this.tracks.some(t => t.file === file)) return
                    const trackPath = path.join(this.path, file)
                    tracks.push(this.analyze(trackPath))
                })
                return Promise.all(tracks)
            })
            .catch(e => consola.error(e))
    }

    analyze(path) {
        return mm.parseFile(path)
            .then(metadata => {
                const file = path.split('\\').pop()
                const ext = file.split('.').pop()
                const title = metadata.common.title || file.replace('.' + ext, '')
                const waveformPath = this.getWaveformPath({file, ext})
                return {
                    format: metadata.format,
                    info: { ...metadata.common, title },
                    ext,
                    path,
                    file,
                    waveformPath,
                    added: new Date().toISOString()
                }
            })
    }

    getWaveformPath(track) {
        const waveformPath = path.join(this.root, 'waveforms', track.file.replace('.' + track.ext, '.json'));
        return fs.existsSync(waveformPath) ? waveformPath : false
    }

    get tracks() {
        return this.db.tracks
    }
    set tracks(tracks) {
        this.db.tracks = tracks
    }
}