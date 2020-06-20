const files = require('./files');

const pickStorage = (config) => {
  let storage;
  switch (config.cacheEngine.type) {
    case 'redis':

      break;
    case 'files':
    default:
      storage = files;
      break;
  }
  return storage;
};

module.exports = pickStorage;
