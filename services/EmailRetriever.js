const fse = require('fs-extra');
const csv = require('csv-parser');

class EmailRetriever {
  constructor(emailDataPath){
    this.emailsDataPath = emailDataPath
  }

  _fetchStudentEmails() {
    const results = []
    return new Promise((resolve, reject) => {
      fse.createReadStream(this.emailsDataPath)
        .pipe(csv())
        .on('data', (data) => { results.push(data) })
        .on('end', () => {
          resolve(results);
        });
    });
  }

  _sortByObjectKey(arr, key) {
    return arr.sort((a, b) => {
      if(a[key] < b[key]) { return -1; }
      if(a[key] > b[key]) { return 1; }
      return 0;
    })
  }

  addEmailsToStudents(students) {
    return this._fetchStudentEmails()
      .then((emailData) => {
        const sortedEmailData = this._sortByObjectKey(emailData, 'fullName');
        const sortedStudents = this._sortByObjectKey(students, 'name');
        const problemValues = [];
        sortedStudents.forEach((student) => {
          const studentIndex = sortedEmailData.findIndex((row) => {
            return row.fullName === student.name;
          })
          if (studentIndex > -1) {
            const data = sortedEmailData[studentIndex];
            student.email = data.email;
            student.firstName = data.firstName;
            student.lastName = data.lastName;
            emailData.splice(studentIndex, 1);
          } else {
            problemValues.push(student);
            console.log('No email adress was found for student', student.name);
          }
        })
        return Promise.resolve();
      })
  }
}

module.exports = EmailRetriever;
