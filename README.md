# Music Uploader
Music Uploader is a node.js application that performs the following operations: 

1. Renaming a list of .WAV files to a hash
2. Converting a folder of .WAV files into .mp3 files
3. Uploading these mp3 files to an Amazon s3 bucket
4. sending an email to a csv list of students, the email containing a link to an html page where they can download the songs that they are allowed to have access to.

## Installation

Add the following files and folders are in the root level of your application: 

```javascript
/htmls // Empty folder where the temp html files will be stored
/mp3 // Empty folder where the temp mp3 files will be stored
/wav // Place all your wav files here
cover.jpeg  // The artwork for the music album
emails.csv // The list of emails mapped to students
config.json // Config to be shared privately
AWSconfig.json // AWS config object
```

The `config.json` file should be in the following format
```json
{
  "salt": "", // A salt to hash the files with, replace 'string' with any string of characters
  "bucketName": "" // The AWS bucket name where files will be stored
}
```

Create an AWS s3 bucket, IAM user and: 
- Set permission policies to AllowPublicRead to all users
- Set permission policies to Allow everything to the IAM user
- Set "Use this bucket to host a website" in the properties of the bucket


The `AWSconfig.json` file should be in the following format. Obtain these credentials from your AWS account.
```json
{ 
  "accessKeyId": "", 
  "secretAccessKey": "", 
  "region": "" 
}
```

```bash
npm install # Install
node index.js # Run the application
```
