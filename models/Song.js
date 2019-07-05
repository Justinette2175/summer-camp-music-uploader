const Toolbox = require('../services/Toolbox');

// Class for the song. Contains _title, _mp3Title, _wavTitle, _hashedTitle;
class Song {
  constructor(fileName) {
    this._uuid = Toolbox.generateUuid(fileName);
    this._fileName = fileName;
  }

  get fileName() {
    return this._fileName;
  }

  get uuid() {
    return this._uuid;
  }

  get title() {
    const { fileName } = this;
    const noExtension = fileName.split('.')[0];
    const originalTitle = noExtension.split('--')[1];
    const students = Toolbox.getStudentNamesFromFileName(fileName);
    let title;
    if (students[0] === '*') {
      title = originalTitle;
    } else {
      title = "Marathon 2019: " + students.join(', ') + ' ' + originalTitle;
    }
    return title;
  }

  get hashedWavSongName() {
    return this._uuid + '.WAV';
  }

  get mp3SongName() {
    return this.title.replace(/\s/g,'').replace(/[,]+/g, "").replace(/[:]+/g, "-") + '.mp3';
  }

  get hashedmp3SongName() {
    return this._uuid + '.mp3';
  }

  get students() {
    return Toolbox.getStudentNamesFromFileName(this._fileName);
  }

  get metadata() {
    return {
      title: this.title, 
      artist: "Camp Père-Lindsay", 
      album: "Camp Père-Lindsay 2019", 
      year: "2019",
      artwork: "./cover.jpeg",
    }
  }

  songIsGlobal() {
    return this.students[0] === '*';
  }
}

module.exports = Song;