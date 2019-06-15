const Lame = require("node-lame").Lame;
const Promise = require('bluebird');
class MP3Encoder {
  constructor(wavPath, mp3Path) {
    this.wavPath = wavPath;
    this.mp3Path = mp3Path;
  }

  convertWavToMp3(song, cb) {
    const meta = song.metadata;
    const encoder = new Lame({
      output: `${this.mp3Path}/${song.hashedmp3SongName}`,
      bitrate: 192, 
      meta,
    }).setFile(`${this.wavPath}/${song.fileName}`);
    const emitter = encoder.getEmitter();
    emitter.on("progress", ([progress, eta]) => {
      cb(progress);
    });
    return encoder.encode().catch(error => {
      console.log(error);
  });
  }
}

module.exports = MP3Encoder;