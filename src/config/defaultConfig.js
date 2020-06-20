const config = {
  port: 2222,
  domains: [],
  cacheEngine: {
    type: 'files',
    dirName: 'mockcache',
    // root: '',
  },
  cors: true,
  delay: 0,
};


const optionsDefaultConfig = {
  mode: 'network-only',
  /*
    cache-only: cache-only mode serves from the cache if the entry is found else 404
    cache-first: cache-first mode will serve from cache if the entry is cached
    network-first: network-first mode will serve from network, in case the network fails it will serve from cache
    network-only: network-only mode serves from network only else it returns 404
  */
  // method for success
  isSuccess: () => true,
  record: true,
  ignoreRequestData: false,
  ignoreDomain: false,
  changeOrigin: true,
  ignoreQueryParams: false,
  overwriteCache: true,
  ttl: 0, // in ms
  routes: ['/'],
  cacheContentTypes: [
    'json',
  ],
};

module.exports = {
  config,
  optionsDefaultConfig,
};
