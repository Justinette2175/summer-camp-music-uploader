const Toolbox = require('../services/Toolbox');
  
class Student {
  constructor(name) {
    this._name = name;
    this._songs = [];
    this._htmlPageName = Toolbox.generateUuid() + '.html';
  }

  addSongToStudentSongs(song) {
    this._songs.push(song)
  }

  get htmlPageName() {
    return this._htmlPageName;
  }

  get name() {
    return this._name;
  }

  get songs() {
    return this._songs;
  }

  set email(email) {
    this._email = email;
  }

  get email() {
    return this._email;
  }

}

module.exports = Student;