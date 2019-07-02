# Music Uploader
Music Uploader is a node.js application that performs the following operations: 

1. Renaming a list of .WAV files to a hash
2. Converting a folder of .WAV files into .mp3 files
3. Parsing the list of files to, by title, recognize which students have access to each file
4. Uploading these mp3 files to an Amazon S3 bucket
5. Creating an html page for each student with links to the mp3 files that they have access to
6. Uploading these html pages to an Amazon S3 bucket
7. Parsing a list of email adresses and personal information to retrieve the email of each student
8. Sending an email to all students containing a link to their own html page

## Installation

Add the following files and folders are in the root level of your application: 

```javascript
"/htmls" // Empty folder where the temp html files will be stored
"/mp3" // Empty folder where the temp mp3 files will be stored
"/wav" // Place all your wav files here
"cover.jpeg"  // The artwork for the music album
"emails.csv" // The list of emails mapped to students
"config.json" // Config to be shared privately
"AWSconfig.json" // AWS config object
```

The `config.json` file should be in the following format
```javascript
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

Place the .wav files in the `/wav` folder, and name them according to this nomenclature: 
`<student name>_<other student name>--<song title>.wav`. 
Name songs that are accessible to all students like so: 
`*--<song title>.wav`.

Fill out the `emails.csv` file like so: 
```
fullName,email,firstName,lastName
<full name (as in song name)>,<email>,<first name>,<last name>
Julio Smith,julio@email.com,Julio,Smith
```

```bash
npm install # Install
node index.js # Run the application
```
