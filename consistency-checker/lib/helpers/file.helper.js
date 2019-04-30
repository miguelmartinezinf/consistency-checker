// file.helper.js

const parsePath = require('parse-filepath');
const fs = require('fs');

function isPathCorrect(givenPath) {
  return new Promise((resolve, reject) => {
    const parsedPath = parsePath(givenPath);
    if (parsedPath.ext === '.json') {
      fs.access(parsedPath.absolute, fs.constants.F_OK, (err) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    } else {
      reject(new Error('Please, provide a JSON file.'));
    }
  });
}


function getAbsolutePath(givenPath) {
  return parsePath(givenPath).absolute;
}

function readFile(givenPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(getAbsolutePath(givenPath), (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(Buffer.from(data).toString('utf8')));
    });
  });
}

function readPlainFile(givenPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(getAbsolutePath(givenPath), (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(Buffer.from(data).toString('utf8'));
    });
  });
}


module.exports = {
  isPathCorrect,
  readFile,
  readPlainFile,
};
