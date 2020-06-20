# Mockcache

This project helps developers to avoid api downtime when the dependent backend goes down. It caches all api request and saves it for the may day (when api's go down).

When api goes down, you just switch a flag and it starts serving cached api's from your disk.

No server garuntees 100% uptime and the backend teams will bring down the dev environment on one fine day. Even then we hate to create mock api's & contracts as its time consuming and this project solves this problem by creating the api contracts automatically as you use your application.

---
Warning: This project is a work in progress. Things may break or API may change frequently. 

---


## Installation
```
npm install
```

Then go to `config.js` file and configure the domain you wish to proxy to. Finally start your proxy server by the following command:
```
npm start
```

Your server will be available at `http://localhost:2222`

## Config Options
These options can be configured in `config.js`

**mode* _[string]_ : (default: "network-only") - If this flag is set to true, responses will be served from the local file system.
```
cache-only: cache-only mode serves from the cache if the entry is found else 404
cache-first: cache-first mode will serve from cache if the entry is cached
network-first: network-first mode will serve from network, in case the network fails it will serve from cache
network-only: network-only mode serves from network only else it returns 404
```
**record** _[boolean]_ : (default: true) - If this flag is set to true, reponses will be recorded when serving from proxy.

**routes** _[object]_ : (default is set to example.com) - You can set the config of which routes to be served from which domain.

```
  routes: {
    '/': 'http://www.example.com/',
  },
```
The `/` route by default serves all routes.

**ignoreRequestData** _[boolean]_ - (default: false) - When this flag is set to true, the POST & PUT requestData is ignored while recording responses.

Normally, we hash the request body and save it in the file name.

## Cache Files

The cache files are recorded in the `responses` directory with the following structure:
```
<file path>~<request method>~<request body hash>~<response status code>.<extension>
```
Note `/` are converted to `|` in file path.

Eg: A successfull response for `GET /api/user/profile` gets converted to:
```
|api|user|profile~GET~200.json
```

## Logs
When you run the server the logs for api's are printed on the console. It also shows if the request was served from cache or by proxy.

## Contribute
PR's are welcome for new features/bugs. First create a github issue to discuss the change you wish to bring in.

## About
Developed by Ankit Duseja. You can find me on twitter [@AnkitDuseja](https://www.twitter.com/AnkitDuseja).

## ISC License
Copyright 2019 Ankit Duseja.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.