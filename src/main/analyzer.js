import { EventEmitter } from 'events';
import fs from 'fs'

const afs = fs.promises

const execFile = require('child_process').execFile;
const exec = require('child_process').exec;
const path = require('path')

export default class HiveAnalyzer extends EventEmitter {
    constructor(root) {
        super()
        this.root = root
        this.waveformsDir = path.join(this.root, 'waveforms')
        if (!fs.existsSync(this.waveformsDir)) {
            fs.mkdirSync(this.waveformsDir);
        }
    }

    getPeaks(track) {
        console.log(`begin analyzing ${track.info.title}`)
        const awPath = path.resolve('static/audiowaveform.exe')
        const outputPath = path.join(this.waveformsDir, track.file.replace('.' + track.ext, '.json'))
        this.execute(awPath + ' -i "' + track.path + '" -o "' + outputPath + '" --pixels-per-second 20 --bits 8').then(r => {
            this.emit('analyze:done', { ...track, waveformPath: outputPath })
            this.normalizePeaks(outputPath)
        })
        //return this.execute(awPath, ['-i "' + file+'" -o - --output-format json --pixels-per-second 20 --bits 8'])
    }
    execute(command) {
        let promise = new Promise((resolve, reject) => {
            exec(command, null, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });

        });
        return promise;
    }
    executeFile(fileName, params) {
        let promise = new Promise((resolve, reject) => {
            exec(fileName, params, {}, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });

        });
        return promise;
    }
    normalizePeaks(file) {
        // number of decimals to use when rounding the peak value
        console.log(`normalizing ${file}`)
        const digits = 2
        let rawdata = fs.readFileSync(file);
        let waveform = JSON.parse(rawdata);
        let data = waveform.data
        let max = 0
        data.forEach(d => {
            if(d>max) max = d
        })
        console.log(`normalizing ${data.length} samples`)
        const normalized = []
        data.forEach(d => {
            normalized.push((d / max).toFixed(digits))
        });
        waveform.data = normalized
        afs.writeFile(file, JSON.stringify(waveform)).then(r => {
            consola.info(`normalized ${file}`)
        })
    }
}