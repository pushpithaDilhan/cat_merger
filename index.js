const { writeFile } = require('fs');
const { join } = require('path');
const request = require('request');
const mergeImg = require('merge-img');
const argv = require('minimist')(process.argv.slice(2));

const {
  greeting = 'Hello', who = 'You',
  width = 400, height = 500, color = 'Pink', size = 100,
} = argv;

const firstUrl = `https://cataas.com/cat/says/${greeting}?width=${width}&height=${height}&color=${color}&s=${size}`;
const secondUrl = `https://cataas.com/cat/says/${who}?width=${width}&height=${height}&color=${color}&s=${size}`;

(async () => {
  try {
    const firstBody = await requestPromise(firstUrl, { encoding: 'binary' });
    console.log(`Received response with status: ${firstBody.statusCode}`);

    const secondBody = await requestPromise(secondUrl, { encoding: 'binary' });
    console.log(`Received response with status: ${secondBody.statusCode}`);

    const img = await mergeImg([
      { src: Buffer.from(firstBody.body, 'binary'), x: 0, y: 0 },
      { src: Buffer.from(secondBody.body, 'binary'), x: width, y: 0 }
    ]);

    const buffer = await new Promise((resolve, reject) => {
      img.getBuffer('image/jpeg', (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });

    const fileOut = join(process.cwd(), '/cat-card.jpg');
    await writeFilePromise(fileOut, buffer, 'binary');
    console.log('The file was saved!');
  } catch (err) {
    console.log(err);
  }
})();

function requestPromise(url, options) {
  return new Promise((resolve, reject) => {
    request.get(url, options, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve({ statusCode: res.statusCode, body });
      }
    });
  });
}

function writeFilePromise(file, data, options) {
  return new Promise((resolve, reject) => {
    writeFile(file, data, options, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
