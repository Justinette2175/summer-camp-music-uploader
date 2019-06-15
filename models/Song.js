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
    return Toolbox.getSongTitleFromFileName(this._fileName);
  }

  get hashedWavSongName() {
    return this._uuid + '.WAV';
  }

  get mp3SongName() {
    return this.title + '.mp3';
  }
  
  get hashedmp3SongName() {
    return this._uuid + '.mp3';
  }

  get students() {
    return Toolbox.getStudentNamesFromTitle(this.title);
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