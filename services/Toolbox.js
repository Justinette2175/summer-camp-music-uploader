var sha1 = require('sha1');
const { salt } = require('../config.json');
const Table = require('cli-table');

class Toolbox {
  getStudentNamesFromFileName(fileName) {
    const title = fileName.split('.')[0];
    const studentNames = title.split('--')[0];
    return studentNames.split('_');
  }

  getSongTitleFromFileName(fileName) {
    const noExtension = fileName.split('.')[0];
    const originalTitle = noExtension.split('--')[1];
    const students = this.getStudentNamesFromFileName(fileName);
    let title;
    if (students[0] === '*') {
      title = originalTitle;
    } else {
      title = "Marathon 2019: " + students.join(', ') + ' ' + originalTitle;
    }
    return title;
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