var Promise = require('bluebird');
const fse = require('fs-extra');

const S3FileUploader = require('./services/S3FileUploader');
const EmailRetriever = require('./services/EmailRetriever');
const HTMLPageGenerator = require('./services/HTMLPageGenerator');
const Toolbox = require('./services/Toolbox');
const EmailService = require('./services/EmailService');
const MP3Encoder = require('./services/MP3Encoder');
const ProgressLogger = require('./services/ProgressLogger');

const Student = require('./models/Student');
const Song = require('./models/Song');
 
const AWSConfigPath = './config.json';
const bucketName = 'pere-lindsay-music-upload'
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
    this.S3FileUploader = new S3FileUploader(bucketName, AWSConfigPath);
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
    return Promise.resolve();
  }

  _createSongs(songs) {
    return Promise.map(songs, (fileName) => {
      const song = this._createSong(fileName);
      this.addSongToStudent(song);
    });
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
    Promise.map(this.songs, (song) => {
      return this.S3FileUploader.uploadFile(`${mp3FilesPath}/${song.hashedmp3SongName}`, song.hashedmp3SongName, 'audio');
    })
    .then(() => {
      return Promise.map(this.students, (student) => {
        return this.S3FileUploader.uploadFile(`./htmls/${student.htmlPageName}`, student.htmlPageName, 'html');
      })
    })
  }

  run () {
    return fse.readdir(wavFilesPath)
      .then((items) => {
        return this._createSongs(items);
      })
      .then(() => {
        return this._addGlobalSongsToStudents();
      })
      .then(() => {
        return this._convertSongs()
      })
      .catch((error) => {
          console.log(error);
      })
      .then(() => {
        return this._createHTMLPages();
      })
      .then(() => {
        return this._uploadFilesToS3();
      })
      .then(() => {
        return this.emailRetriever.addEmailsToStudents(this.students);
      })
      .then(() => {
        return Promise.map(this.students, (student) => {
          this.emailService.sendEmail(student);
        })
      });
  }
}

const MyMusicUploader = new MusicUploader();

MyMusicUploader.run();