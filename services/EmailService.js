const AWS = require('aws-sdk')
var Promise = require('bluebird');
const fse = require('fs-extra');

const { senderEmail, bucketUrl } = require('../config.json');

class EmailService {
  constructor(configPath) {
    AWS.config.loadFromPath(configPath);
    this.SES = new AWS.SES({apiVersion: '2010-12-01'});
  }

  sendEmail(student, cb) {
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
                <p>Ton téléchargement est prêt. Clique sur <a href=${bucketUrl}${student.htmlPageName}>ce lien</a> pour écouter tes chansons.</p>
              `
            },
           },
           Subject: {
              Charset: 'UTF-8',
              Data: 'Tes chansons sont prêtes à être téléchargées!'
            }
          },
        Source: senderEmail, 
        ReplyToAddresses: [
          senderEmail,
        ],
      };
      if (this.SES) {
        return this.SES.sendEmail(params).promise()
          .then((data) => {
            if (cb) {
              cb(100);
            }
            return data;
          }).catch((err) => {
            console.error("There was a problem sending a message.", err, err.stack);
          });
      }
    } else {
      return Promise.reject(new Error(`No email found for ${student.name}`))
    }
  }
}

module.exports = EmailService;