const uuid = require('uuidv4');

class Toolbox {
  getStudentNamesFromTitle(title) {
    const studentNames = title.split('-')[0];
    return studentNames.split('|');
  }

  getSongTitleFromFileName(fileName) {
    return fileName.split('.')[0]
  }

  generateUuid() {
    return uuid();
  }
}

module.exports = new Toolbox();