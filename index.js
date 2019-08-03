const Promise = require('bluebird');
const fse = require('fs-extra');
const inquirer = require('inquirer');

const S3FileUploader = require('./services/S3FileUploader');
const EmailRetriever = require('./services/EmailRetriever');
const HTMLPageGenerator = require('./services/HTMLPageGenerator');
const Toolbox = require('./services/Toolbox');
const EmailService = require('./services/EmailService');
const MP3Encoder = require('./services/MP3Encoder');
const ProgressLogger = require('./services/ProgressLogger');

const Student = require('./models/Student');
const Song = require('./models/Song');
 
const AWSConfigPath = './AWSconfig.json';
const AWSConfigS3Path = './AWSconfigS3.json';
const { bucketName } = require('./config.json');
const htmlTemplatePath = './template.html';
const htmlStorePath = './htmls';
const emailsDataPath = './emails.csv';
const mp3FilesPath = './mp3';
const wavFilesPath = './wav';


class MusicUploader {
  constructor() {
    this.globalSongs = [];
    this.students = [];
    this.songs = [];
    this.MP3Encoder = new MP3Encoder(wavFilesPath, mp3FilesPath);
    this.emailService = new EmailService(AWSConfigPath);
    this.S3FileUploader = new S3FileUploader(bucketName, AWSConfigS3Path);
    this.emailRetriever = new EmailRetriever(emailsDataPath);
    this.HTMLPageGenerator = new HTMLPageGenerator(htmlTemplatePath, htmlStorePath); 
  }

  addSongToStudent (song) {
    song.students.forEach((studentName) => {
      if (studentName == '*') {
        return 
      } else {
        const indexOfStudentInStudents = this._getIndexOfStudentInStudents(studentName);
        if (indexOfStudentInStudents > -1) {
          this.students[indexOfStudentInStudents].addSongToStudentSongs(song)
        } else {
          const newStudent = new Student(studentName)
          newStudent.addSongToStudentSongs(song);
          this.students.push(newStudent);
        }
      }
    }) 
  }

  _getIndexOfStudentInStudents(name) {
    return this.students.findIndex((student) => {
      return student.name === name;
    })
  }

  _addGlobalSongsToStudents() {
    this.students.forEach((student) => {
      this.globalSongs.forEach((file) => {
        student.addSongToStudentSongs(file);
      })
    })
    console.log('--- Global songs have been added to student files ---')
    return Promise.resolve();
  }

  _createSongs(songs) {
    console.log("--- Creating song objects ---");
    return Promise.map(songs, (fileName) => {
      const song = this._createSong(fileName);
      this.addSongToStudent(song);
    })
    .then(() => {
      console.log("--- Song objects have been created ---");
    })
  }

  _createSong(fileName) {
    const song = new Song(fileName)
    if (song.songIsGlobal()) {
      this.globalSongs.push(song);
    }
    this.songs.push(song);
    return song;
  }

  _convertSongs() {
    if (this.songs.length > 0) {
      const conversionProgressLogger = new ProgressLogger(this.songs, {
        startLog: '--- Converting .WAV songs into .mp3 ---', 
        endLog: '--- All .WAV songs have been converted to .mp3 ---'
      })
      return Promise.map(this.songs, (song, index) => {
        return this.MP3Encoder.convertWavToMp3(song, (progress) => {
          conversionProgressLogger.updateProgress(index, progress);
        });
      }).then(() => {
        conversionProgressLogger.endProgress();
      })
    }
    return Promise.reject(new Error("There are no songs to convert in the songs object!"));
  }

  _createHTMLPages() {
    return Promise.map(this.students, (student) => {
      return this.HTMLPageGenerator.createStudentPage(student);
    })
      .then(() => {
        console.log('--- HTML pages have been created for all students ---');
      return Promise.resolve()
    })
  }

  _uploadFilesToS3() {
    const songUploadProgressLogger = new ProgressLogger(this.songs, {
      startLog: '--- Uploading songs to Amazon s3 ---', 
      endLog: '--- All songs have been uploaded to Amazon s3 ---'
    })
    return Promise.map(this.songs, (song, index) => {
      return this.S3FileUploader.uploadFile(`${mp3FilesPath}/${song.hashedmp3SongName}`, song.hashedmp3SongName, null, song.mp3SongName, (progress) => {
        songUploadProgressLogger.updateProgress(index, progress);
      });
    })
    .then(() => {
      songUploadProgressLogger.endProgress();
      const htmlUploadProgressLogger = new ProgressLogger(this.students, {
        startLog: '--- Uploading html pages to Amazon s3 ---', 
        endLog: '--- All html pages have been uploaded to Amazon s3 ---'
      })
      return Promise.map(this.students, (student, index) => {
        return this.S3FileUploader.uploadFile(`./htmls/${student.htmlPageName}`, student.htmlPageName, 'html', null, (progress) => {
          htmlUploadProgressLogger.updateProgress(index, progress);
        });
      })
      .then(() => {
        htmlUploadProgressLogger.endProgress();
      })
    })
  }

  requireApproval(message, action) {
    const options = {
      message,
      type: 'confirm', 
      name: 'prompt',
    }
    return inquirer.prompt([options])
      .then((answers) => {
        if (answers.prompt === true) {
          return Promise.resolve();
        }
        return Promise.reject(new Error("Song conversion aborted"));
    })
  }

  _sendEmailToStudents() {
    const emailSendingProgressLogger = new ProgressLogger(this.students, {
      startLog: '--- Sending emails to students ---', 
      endLog: '--- All emails have been sent ---'
    })
    return Promise.map(this.students, (student, index) => {
      return this.emailService.sendEmail(student, (progress) => {
        emailSendingProgressLogger.updateProgress(index, progress);
      });
    })
      .then(() => {
        emailSendingProgressLogger.endProgress();
      })
  }

  run () {
    return fse.readdir(wavFilesPath)
      .then((items) => this._createSongs(items))
      .then(() => this._addGlobalSongsToStudents())
      .then(() => this.emailRetriever.addEmailsToStudents(this.students))
      .then(() => this._createHTMLPages())
      .then(() => {
        Toolbox.logStudentsTable(this.students);
        return this.requireApproval("Are you ready to launch the song conversion to mp3?")
      })
      .then(() => this._convertSongs())
      .then(() => this.requireApproval("Are you ready to upload songs and html pages to Amazon S3?"))
      .then(() => this._uploadFilesToS3())
      .then(() => this.requireApproval("Are you ready to send emails to all students?"))
      .then(() => this._sendEmailToStudents())
      .catch(console.log);
  }
}

const MyMusicUploader = new MusicUploader();

MyMusicUploader.run();