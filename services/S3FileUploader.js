const AWS = require('aws-sdk')
var Promise = require('bluebird');
const fse = require('fs-extra');

const ACCURACY_BALANCER = 20;
class S3FileUploader {
  constructor(bucketName, configPath) {
    this.bucketName = bucketName;
    AWS.config.loadFromPath(configPath);
    this.s3 = new AWS.S3();
  }

  _getContentTypeMetadata(contentType) {
    switch (contentType) {
      case 'html': 
        return 'text/html'
      default: 
        return 'application/octet-stream'
    }
  }

  uploadFile(filePath, key, contentType, cb) {
    if (this.bucketName && this.s3) {
      return fse.readFile(filePath).then((data) => {
        var base64data = new Buffer(data, 'binary');
        var params = {
          Bucket: this.bucketName,
          Key: key,
          Body: base64data,
          ContentType: this._getContentTypeMetadata(contentType),
        }
        return new Promise((resolve, reject) => {
          this.s3.upload(params)
            .on('httpUploadProgress', function (progress) {
              if (progress) {
                const percentageProgress = ((progress.loaded / progress.total) * 100) - ACCURACY_BALANCER;
                cb(percentageProgress);
              }
            })
            .send((err, data) => {
              if (err) {
                reject(err);
              } else {
                if (cb) {
                  cb(100);
                }
                resolve(data);
              }
            });
        })
      })
    }
  }
}

module.exports = S3FileUploader;