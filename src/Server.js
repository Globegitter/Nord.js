import {System} from 'es6-module-loader';

import http from 'http';
import fs from 'fs-extra';
import path from 'path';

import {transformFileSync} from 'babel';
import {sync as globSync} from 'glob';

System.transpiler = 'babel';

export default class NordServer {

  constructor(root='app', port=8080) {
    this.rootPath = root;
    this.port = port;
  }

  /**
   * Handles all incoming requests and forwards them to the right files
   * and functions
   *
   * @param {object} req The Node request object
   * @param {object} res The Node response object
   * @returns when the res ends and gets displayed to the user
   */
  async simpleRouter(req, res) {
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
        res.statusCode(404);
        return res.end('404 error!');
      } else {
        res.statusCode(500);
        return res.end('Internal error');
      }
      // return res.end('Whhaaa');
    }

    return res.end();
  }

/**
 * Transpiles any babel app code and copies into a temporary folder for the
 * server to access it.
 * Ignoring some 'ES7' features due to https://github.com/babel/babel/issues/1990
 *
 * @param {string} outPath defines path where the files get copied to
 * @returns {array} the list of files that have been created
 */
  transformAppCode(outPath='.app') {
    let appFiles = globSync(`${this.rootPath}/**/*.js`);
    let outFiles = [];
    let babelOptions = {
      'stage'    : 0,
      'blacklist': [
        'react',
        'es7.comprehensions',
        'es7.doExpressions',
        'es7.functionBind',
        'es7.objectRestSpread',
        'es7.trailingFunctionCommas'
      ],
      'loose'   : true,
      'optional': ['runtime'],
      'modules' : 'common'
    };

    for (let filePath of appFiles) {
      let {code} = transformFileSync(filePath, babelOptions);
      let filename = path.relative(this.rootPath, filePath);
      let outFile = path.join(outPath, filename);
      fs.outputFileSync(outFile, code);
      outFiles.push(outFile);
    }

    return outFiles;
  }

  /**
   * Starts the http server at the defined port
   * TODO(markus): Implement https support
   */
  start() {
    // Create a server
    let server = http.createServer(this.simpleRouter.bind(this));

    // Lets start our server
    server.listen(this.port,  () => {
      // Callback triggered when server is successfully listening. Hurray!
      console.log(`Server started on: http://localhost:${this.port}`);
    });
  }
}
