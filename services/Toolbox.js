var sha1 = require('sha1');
const { salt } = require('../config.json');

class Toolbox {
  getStudentNamesFromTitle(title) {
    const studentNames = title.split('-')[0];
    return studentNames.split('|');
  }

  getSongTitleFromFileName(fileName) {
    return fileName.split('.')[0]
  }

  generateUuid(fileName) {
    return sha1(`${salt}${fileName}`);
  }
}

module.exports = new Toolbox();