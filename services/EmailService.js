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
                <p>Voici les enregistrements de la première session 2019 du cmpl! <a href=${bucketUrl}${student.htmlPageName}>Ce lien</a> ouvrira une page contenant les pièces de chorale, d'orchestre, de différents ensembles et du marathon.</p>
                <br/>
                <p>Il est conseillé de tout télécharger le plus rapidement possible! Ceci dit, le lien restera actif jusqu'à l'été prochain.</p>
                <br/>
                <p>Pour tous problèmes ou commentaires, merci d'écrire sans hésiter à cette adresse:</p>
                <p>cmpl.enregistrement@gmail.com</p>
                <br/>
                <p>Bonne fin d'été!</p>
                <br/>
                <p>Nataq Huault</p>
                <p>Responsable des enregistrements</p>
                <p>Camp Musical Père Lindsay</p>
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