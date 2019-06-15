const cliProgress = require('cli-progress');

class ProgressLogger {
  constructor(arr, { startLog, endLog }) {
    this._startLog = startLog;
    this._endLog = endLog;
    this._arr = arr;
    this.initiateProgress();
  }

  endProgress() {
    this.progressBar.stop();
    console.log(this._endLog);
  }

  initiateProgress() {
    this.progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
    this._progressStore = this._arr.map(() => 0);
    console.log(this._startLog);
    this.progressBar.start(100, 0);
  }

  updateProgress(index, progress) {
    this._progressStore[index] = progress;
    const totalProgress = (this._progressStore.reduce((acc, progress) => {
      acc += progress;
      return acc;
    }, 0) / this._progressStore.length);
    this.progressBar.update(totalProgress);
  }
}

module.exports = ProgressLogger;