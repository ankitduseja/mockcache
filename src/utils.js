const md5 = require('md5');
const path = require('path');

const appDir = path.dirname(require.main.filename);

const convertSlashes = domain => domain.split('/').join('|');

const getDomainPath = (domain) => {
  if (domain) {
    const newDomain = `${domain}`;
    return newDomain.split('//')[1];
  }
  return '';
};

const getFileName = (req, statusCode) => {
  const config = req.domainOptions;
  const fileParts = [];
  let urlPath = '';
  // if (config.ignoreDomain !== true) {
  //   urlPath = req.domainOptions.target;
  // }
  urlPath += config.ignoreQueryParams === true ? req.path : req.originalUrl;
  fileParts.push(convertSlashes(urlPath));
  fileParts.push(req.method);
  if ((req.method === 'POST'
      || req.method === 'PUT')
      && config.ignoreRequestData !== true
      && req.body) {
    const md5Hash = md5(JSON.stringify(req.body));
    fileParts.push(md5Hash);
  }
  fileParts.push(`${statusCode}.json`);
  return fileParts.join('~');
};


const getRootDir = (config) => {
  const filePath = [];
  if (config.cacheEngine && config.cacheEngine.root) {
    filePath.push(config.cacheEngine.root);
  } else {
    filePath.push(appDir);
  }
  return filePath.join('/');
};

const getMockDir = (config) => {
  const filePath = [];
  filePath.push(getRootDir(config));
  filePath.push(config.cacheEngine.dirName);
  return filePath.join('/');
};

const getFilePath = (config, fileName, req) => {
  const filePath = [];
  if (config.cacheEngine && config.cacheEngine.root) {
    filePath.push(config.cacheEngine.root);
  } else {
    filePath.push(appDir);
  }
  filePath.push(getMockDir(config));
  if (config.ignoreDomain !== true) {
    filePath.push(getDomainPath(req.domainOptions.target));
  }
  filePath.push(fileName);
  return filePath.join('/');
};


const includesArray = (stringToSearch, arr) => {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    if (stringToSearch.includes(element)) {
      return true;
    }
  }
  return false;
};

const shouldRecord = (proxyRes, req, res, body) => {
  const config = req.domainOptions;
  const contentType = proxyRes.headers['content-type'];
  if (config.record === true
        // && proxyRes.statusCode === 200
        && config.isSuccess(body)
        && (
          (typeof config.cacheContentTypes === 'object'
                && includesArray(contentType, config.cacheContentTypes))
            || typeof config.cacheContentTypes === 'undefined'
        )
  ) {
    return true;
  }
  return false;
};

// // TODO
// const getExtensionFromHeader;
// const getHeaderForExtension;

const utils = {
  convertSlashes,
  getDomainPath,
  getFileName,
  getFilePath,
  getMockDir,
  getRootDir,
  shouldRecord,
  includesArray,
};

module.exports = utils;
