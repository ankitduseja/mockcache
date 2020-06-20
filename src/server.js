const express = require('express');
const app = require('express')();
const zlib = require('zlib');
const proxy = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const logger = require('./logger/logger');
const configGenerator = require('./config/configGenerator');
const storage = require('./storage');

const appDir = path.dirname(require.main.filename);
console.log('appDir: ', appDir);

function restream(proxyReq, req, res, options) {
  if (req.body) {
    const bodyData = JSON.stringify(req.body);
    // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    // stream the content
    proxyReq.write(bodyData);
  }
}


const server = (userConfig) => {
  const config = configGenerator(userConfig);
  const store = storage(config);
  if (config.cacheEngine && config.cacheEngine.type === 'files') {
    const mockDirPath = utils.getMockDir(config);
    if (!fs.existsSync(`${mockDirPath}`)) {
      fs.mkdirSync(`${mockDirPath}`);
    }

    if (config.ignoreDomain !== true) {
      for (let i = 0; i < config.domains.length; i++) {
        const domain = utils.getDomainPath(config.domains[i].target);
        if (!fs.existsSync(`${mockDirPath}/${domain}`)) {
          fs.mkdirSync(`${mockDirPath}/${domain}`);
        }
      }
    }
    // if (!fs.existsSync(`${mockDirPath}/responses`)) {
    //   fs.mkdirSync(`${mockDirPath}/responses`);
    // }
  }
  function onProxyRes(proxyRes, req, res) {
    logger.log('Proxying: ', req.method, req.path, proxyRes.statusCode);
    const fileName = utils.getFileName(req, 200); // proxyRes.statusCode
    const filePath = utils.getFilePath(config, fileName, req);
    //   proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 400) {
      logger.log('From Network');
      let originalBody = ''; // Buffer.from([]);
      proxyRes.on('data', (data) => {
        console.log('data: ', data);
        // originalBody = Buffer.concat([originalBody, data]);
        data = data.toString('utf-8');
        originalBody += data;
      });
      proxyRes.on('end', () => {
        console.log('originalBody: ', originalBody.length, originalBody);
        let body = '';
        if (originalBody) {
          body = zlib.gunzipSync(originalBody).toString('utf8');
        }
        console.log('body gunzip: ', body);
        // body = body.toString();
        try {
          // eval(`output=${body}`);
          const writeToCache = () => {
            store.set(filePath, body)
              .then((r) => {
                logger.log('Recorded', filePath);
              })
              .catch((error) => {
                logger.error('Unable to record to cache', filePath);
              });
          };
          if (utils.shouldRecord(proxyRes, req, res, body)) {
            if (req.domainOptions.overwriteCache === false) {
              store.get(filePath)
                .then((cacheData) => {
                // do nothing
                })
                .catch(() => {
                  writeToCache();
                });
            } else {
              writeToCache();
            }
            // fs.writeFile(filePath, body, (r) => {
            // });
          }
        } catch (err) {}
      });
      // res.write = (data) => {
      // const _write = res.write;
      // _write.call(res, body);
      // };
    }
  }

  function cacheMiddleware(req, res, next) {
    const fileName = utils.getFileName(req, 200);
    const filePath = utils.getFilePath(config, fileName, req);
    store.get(filePath)
      .then((data) => {
        logger.log(`From cache: ${filePath}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(data);
        res.end();
      })
      .catch((error) => {
        logger.error('Cache error:', error);
        return next();
      });
  }

  if (config.cors === true) {
    app.use(cors());
  }
  app.use(express.json());

  for (let i = 0; i < config.domains.length; i++) {
    const options = config.domains[i];

    const { routes } = options;

    app.use((req, res, next) => {
      setTimeout(next, config.delay);
    });
    app.use((req, res, next) => {
      req.domainOptions = options;
      next();
    });


    if (utils.includesArray(options.mode, ['cache-first', 'cache-only'])) {
      app.use(cacheMiddleware);
    }

    if (utils.includesArray(options.mode, ['cache-first', 'network-first', 'network-only'])) {
      // app.use(bodyParser.json({ type: ['application/json', 'application/*+json'] }));
      // app.use(bodyParser.urlencoded());
      app.use(routes, proxy({
        target: options.target,
        changeOrigin: options.changeOrigin,
        onProxyReq: restream,
        onProxyRes,
        selfHandleResponse: true,
      }));
    }

    if (utils.includesArray(options.mode, ['network-first'])) {
      app.use(cacheMiddleware);
    }
  }

  /* For server 404 & errors */
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  app.use((err, req, res, next) => {
    res.locals.error = err;
    // res.status(err.status);
    return res.status(err.status).end(JSON.stringify(err));
  });

  app.listen(config.port);
};


module.exports = server;
