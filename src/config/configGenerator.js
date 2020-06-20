const defaultConfig = require('./defaultConfig');
const logger = require('../logger/logger');

const configGenerator = (userConfig) => {
  if (typeof userConfig !== 'object') {
    logger.error('User config is not defined');
    return false;
  }
  if (typeof userConfig.domains === 'undefined') {
    logger.error('Domains array is not defined');
    return false;
  }
  const newConfig = {
    ...defaultConfig.config,
    ...userConfig,
  };
  newConfig.domains = newConfig.domains.filter((domainObj, index) => {
    if (typeof domainObj.target !== 'string') {
      logger.warn(`Skipping domain ${index} as target is not defined`);
      return false;
    }
    return true;
  }).map((domainObj) => {
    const domain = {
      ...defaultConfig.optionsDefaultConfig,
      ...domainObj,
    };
    return domain;
  });
  return newConfig;
};

module.exports = configGenerator;
