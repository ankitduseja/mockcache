const fs = require('fs');

const get = key => new Promise((resolve, reject) => {
  fs.readFile(key, (error, data) => {
    if (error) {
      reject(error);
    } else {
      resolve(data);
    }
  });
});

const set = (key, value) => new Promise((resolve, reject) => {
  fs.writeFile(key, value, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve(true);
    }
  });
});


const files = {
  get,
  set,
};

module.exports = files;
