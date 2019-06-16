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
          <p class="song-title">${song.title}</p>
          <div class="actions">
            <a class="download" href="${url}">
              <i class="fa fa-download"></i>
              Télécharger
            </a>
          </div>
        </li>`
      )
    }).join(' ');
  }

  _generateHTMLMarkup(studentName, songs) {
    return fse.readFile(this.templatePath, 'utf8')
      .then((template) => {
        const blankPage = template;
        const newHtml = `
          <h1>Bonjour ${studentName},</h1>
          <p>Tes enregistrements sont prêts à être téléchargés. Clique chacun des liens ci-dessous.</p>
          <ul> 
            ${this._generateSongsList(songs)}
          </ul>
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