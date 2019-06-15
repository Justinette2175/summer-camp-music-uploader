const AWS = require('aws-sdk')
var Promise = require('bluebird');
const fse = require('fs-extra');

const S3BucketPath = "https://pere-lindsay-music-upload.s3.amazonaws.com";
const SOURCE_EMAIL = 'jugagnepain75@gmail.com';

class EmailService {
  constructor(configPath) {
    AWS.config.loadFromPath(configPath);
    this.SES = new AWS.SES({apiVersion: '2010-12-01'});
  }

  sendEmail(student) {
    if (student.email) {
      const params = {
        Destination: {
          ToAddresses: [
            student.email,
          ]
        },
        Message: { 
          Body: { 
            Html: {
              Charset: "UTF-8",
              Data: `<h3>Bonjour ${student.firstName || student.name}!</h3>
                <p>Ton téléchargement est prêt. Clique sur <a href=${S3BucketPath}/${student.htmlPageName}>ce lien</a> pour écouter tes chansons.</p>
              `
            },
           },
           Subject: {
              Charset: 'UTF-8',
              Data: 'Tes chansons sont prêtes à être téléchargées!'
            }
          },
        Source: SOURCE_EMAIL, 
        ReplyToAddresses: [
          SOURCE_EMAIL,
        ],
      };
      if (this.SES) {
        this.SES.sendEmail(params).promise()
        .then((data) => {
        }).catch((err) => {
          console.error("There was a problem sending a message.", err, err.stack);
        });
      }
    }
  }
}

module.exports = EmailService;