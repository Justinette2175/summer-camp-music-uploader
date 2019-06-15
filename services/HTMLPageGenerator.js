const Toolbox = require('./Toolbox');

var Promise = require('bluebird');
const fse = require('fs-extra');

class HTMLPageGenerator {
  constructor(templatePath, htmlStorePath) {
    this.templatePath = templatePath;
    this.htmlStorePath = htmlStorePath;
  }

  _generateSongsList(songs) {
    return songs.map((song) => {
      return `<li><a href="https://pere-lindsay-music-upload.s3.amazonaws.com/${song.hashedmp3SongName}">${song.title}</a></li>`
    }).toString().replace(',', ' ');
  }

  _generateHTMLMarkup(studentName, songs) {
    return fse.readFile(this.templatePath, 'utf8')
      .then((template) => {
        const blankPage = template;
        const newHtml = `<div className="test-div">
          <p>${studentName}<p>
          <ul> 
            ${this._generateSongsList(songs)}
          </ul>
        </div>`
        return Promise.resolve(blankPage.replace(/placeholder/g, newHtml));
    })
  }

  _writeHTMLPageToDisk(title, htmlPage) {
    return fse.writeFile(`${this.htmlStorePath}/${title}`, htmlPage, 'utf8');
  }

  createStudentPage(student) {
    return this._generateHTMLMarkup(student.name, student.songs)
      .then((markup) => {
        return this._writeHTMLPageToDisk(student.htmlPageName, markup)
        .then(() => {
          return Promise.resolve();
        })
      })
  }
}

module.exports = HTMLPageGenerator;