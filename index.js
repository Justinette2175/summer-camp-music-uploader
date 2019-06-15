var Promise = require('bluebird');
const fse = require('fs-extra');

const S3FileUploader = require('./services/S3FileUploader');
const EmailRetriever = require('./services/EmailRetriever');
const HTMLPageGenerator = require('./services/HTMLPageGenerator');
const Toolbox = require('./services/Toolbox');
const EmailService = require('./services/EmailService');
const MP3Encoder = require('./services/MP3Encoder');
const cliProgress = require('cli-progress');

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
    this.totalConversionProgress = [];
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
      const conversionProgressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
      conversionProgressBar.start(100, 0);
      return Promise.map(this.songs, (song) => {
        return this.MP3Encoder.convertWavToMp3(song, (progress) => {
          this._updateConversionProgress(song, progress, conversionProgressBar);
        });
      }).then(() => {
        conversionProgressBar.stop();
        console.log('--- All songs have been converted ---');
      })
    }
    return Promise.reject(new Error("There are no songs to convert in the songs object!"));
  }

  _initiateConversionProgress() {
    this.songs.forEach((song) => {
      this.totalConversionProgress[song.uuid] = 0;
    });
  }

  _updateConversionProgress(song, progress, progressBar) {
    this.totalConversionProgress[song.uuid] = progress;
    const totalProgress = (Object.keys(this.totalConversionProgress).reduce((acc, key) => {
      acc += this.totalConversionProgress[key];
      return acc;
    }, 0) / this.songs.length);
    progressBar.update(totalProgress);
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

  createDataFromMusicFiles () {
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
      // .then(() => {
      //   return this._uploadFilesToS3();
      // })
      // .then(() => {
      //   return this.emailRetriever.addEmailsToStudents(this.students);
      // })
      // .then(() => {
      //   return Promise.map(this.students, (student) => {
      //     this.emailService.sendEmail(student);
      //   })
      // });
  }
}

const MyMusicUploader = new MusicUploader();

MyMusicUploader.createDataFromMusicFiles().then(() => {})