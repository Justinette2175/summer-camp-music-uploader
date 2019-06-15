const Lame = require("node-lame").Lame;

class MP3Encoder {
  constructor(wavPath, mp3Path) {
    this.wavPath = wavPath;
    this.mp3Path = mp3Path;
  }

  convertWavToMp3(song, cb) {
    const encoder = new Lame({
        output: `${this.mp3Path}/${song.hashedmp3SongName}`,
        bitrate: 192
    }).setFile(`${this.wavPath}/${song.fileName}`);
    const emitter = encoder.getEmitter();
    emitter.on("progress", ([progress, eta]) => {
      cb(progress);
    });
    return encoder.encode();
  }
}

module.exports = MP3Encoder;