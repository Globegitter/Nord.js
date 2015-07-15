import {System} from 'es6-module-loader';

import http from 'http';
import fs from 'fs';

import babel from 'babel';
import {sync as globSync} from 'glob';

System.transpiler = 'babel';

export default class NordServer {

  constructor(root='app', port=8080) {
    this.rootPath = root;
    this.port = port;
  }

  // function to handle requests and send response
  async  handleRequest(req, res) {
    let path = req.url.slice(1);

    try {
      let UserResource = await System.import(`./${this.rootPath}/${path}.js`);
      // console.log(UserResource);
      let resource = new UserResource.default(req, res); // eslint-disable-line new-cap
      console.log(resource.get());
    } catch (error) {
      console.log('error', error);
      console.log(error.stack);
      if (error.message.includes('ENOENT')) {
        // res.statusCode(404)
        return res.end('404 error!');
      } else {
        res.statusCode(500);
        return res.end('Internal error');
      }
      // return res.end('Whhaaa');
    }

    return res.end();
  }

  transformAppCode() {
    let appFiles = globSync('app/**/*.js');
    for (let file of appFiles) {
      console.log(file);
    }
  }

  transformFile(filename) {
    console.log('filename', filename);
    let {code} = babel.transformFileSync(filename, {
      'stage'   : 0,
      'loose'   : true,
      'optional': ['runtime'],
      'modules' : 'common'
    });
    return code;
  }

  copyToTmp(filename, code) {
    // console.log(code)
    fs.writeFileSync(`.app/${filename}`, code);
  }

  start() {
    // Create a server
    let server = http.createServer(::this.handleRequest);

    // Lets start our server
    server.listen(this.port,  () => {
      // Callback triggered when server is successfully listening. Hurray!
      console.log(`Server started on: http://localhost:${this.port}`);
    });
  }
}