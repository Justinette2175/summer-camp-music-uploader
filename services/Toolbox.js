const uuid = require('uuidv4');

class Toolbox {
  getStudentNamesFromTitle(title) {
    const studentNames = title.split('-')[0];
    return studentNames.split('|');
  }

  getSongTitleFromFileName(fileName) {
    return fileName.split('.')[0]
  }

  createHashedFileNameFromFile(fileName) {
    const extension = fileName.split('.')[1];
    return uuid(fileName) + '.' + extension;
  }

  generateUuid() {
    return uuid();
  }

  generatemp3TitlefromWavName(wavName) {
    const name = wavName.split('.')[0];
    return `${name}.mp3`;
  }
}

module.exports = new Toolbox();