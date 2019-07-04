const Toolbox = require('./Toolbox');

var Promise = require('bluebird');
const fse = require('fs-extra');
const { bucketUrl } = require("../config.json");

class HTMLPageGenerator {
  constructor(templatePath, htmlStorePath) {
    this.templatePath = templatePath;
    this.htmlStorePath = htmlStorePath;
  }

  _generateSongsList(songs) {
    return songs.map((song) => {
      const url = `${ bucketUrl }${ song.hashedmp3SongName }`;
      return (
        `<li>
        <a class="song-link" href="${url}">
          <span class="song-title">${song.title}</span>
          <span class="download"><i class="fa fa-download"></i></span>
        </a>
      </li>`
      )
    }).join(' ');
  }

  _generateHTMLMarkup(studentName, songs) {
    return fse.readFile(this.templatePath, 'utf8')
      .then((template) => {
        const blankPage = template;
        const newHtml = `
          <div class="content-box">
            <div class="content-header">
              <h1>Bonjour ${studentName}</h1>
              <p>Tes enregistrements sont prêts à être téléchargés. Clique chacun des liens ci-dessous.</p>
              <button class="download-all" onClick="downloadAll();">Tout télécharger <i class="fa fa-download"></i></button>
            </div>
            <ul> 
              ${this._generateSongsList(songs)}
            </ul>
          </div>
        `
        return Promise.resolve(blankPage.replace(/placeholder/g, newHtml));
    })
  }

  _writeHTMLPageToDisk(title, htmlPage) {
    return fse.writeFile(`${this.htmlStorePath}/${title}`, htmlPage, 'utf8');
  }

  createStudentPage(student) {
    const name = student.firstName || student.name;
    return this._generateHTMLMarkup(name, student.songs)
      .then((markup) => {
        return this._writeHTMLPageToDisk(student.htmlPageName, markup)
        .then(() => {
          return Promise.resolve();
        })
      })
  }
}

module.exports = HTMLPageGenerator;