const AWS = require('aws-sdk')
var Promise = require('bluebird');
const fse = require('fs-extra');

class S3FileUploader {
  constructor(bucketName, configPath) {
    this.bucketName = bucketName;
    AWS.config.loadFromPath(configPath);
    this.s3 = new AWS.S3();
  }

  _getContentTypeMetadata(contentType) {
    switch (contentType) {
      case 'html': 
        return 'application/shtml'
      default: 
        return 'application/octet-stream'
    }
  }

  uploadFile(filePath, key, contentType) {
    if (this.bucketName && this.s3) {
      return fse.readFile(filePath).then((data) => {
        var base64data = new Buffer(data, 'binary');
        var params = {
          Bucket: this.bucketName,
          Key: key,
          Body: base64data,
          Metadata: {
            'Content-Type': this._getContentTypeMetadata(contentType)
          }
        }
        this.s3.putObject(params, (err, data) => {
          if (err) console.error(`Upload Error ${err}`)
        })
      })
    }
  }
}

module.exports = S3FileUploader;