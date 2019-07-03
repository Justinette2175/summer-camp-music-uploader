var sha1 = require('sha1');
const { salt } = require('../config.json');
const Table = require('cli-table');

class Toolbox {
  getStudentNamesFromTitle(title) {
    const studentNames = title.split('--')[0];
    return studentNames.split('_');
  }

  getSongTitleFromFileName(fileName) {
    return fileName.split('.')[0]
  }

  generateUuid(fileName) {
    return sha1(`${salt}${fileName}`);
  }

  logStudentsTable(students) {
    const table = new Table({
        head: ['Name', 'Email', 'Songs']
      , 
        chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
                , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
    });
    students.forEach((student) => {
      const { name, songs, email } = student;
      table.push([name, email, `${songs.length} songs`])
    }) 
    console.log(table.toString());
  }
}

module.exports = new Toolbox();