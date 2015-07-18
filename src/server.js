import http from 'http';
import fs from 'fs-extra';
import path from 'path';

import {transformFileSync} from 'babel';
import {sync as globSync} from 'glob';

export default class NordServer {

  constructor(root='.app', port=8080) {
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
  simpleRouter(req, res) {
    const filePath = path.join(this.rootPath, `${req.url}.js`);
    const fileMethod = req.method.toLowerCase();

    try {
      const UserResource = require(filePath);
      const resource = new UserResource(req, res);
      // calls the user function to process the request
      resource[fileMethod];
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        res.statusCode(404);
        return res.end(`404 error! ${req.url} could not be found.`);
      } else {
        res.statusCode(500);
        return res.end('Internal error');
      }
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
    const appFiles = globSync(`${this.rootPath}/**/*.js`);
    const outFiles = [];
    const babelOptions = {
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

    for (const filePath of appFiles) {
      const {code} = transformFileSync(filePath, babelOptions);
      const filename = path.relative(this.rootPath, filePath);
      const outFile = path.join(outPath, filename);
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

    console.log('Transforming app code into .app/'); // eslint-disable-line no-console
    this.transformAppCode();
    console.log('App code transformed.'); // eslint-disable-line no-console

    // Create a server
    const server = http.createServer(this.simpleRouter.bind(this));

    // Lets start our server
    server.listen(this.port,  () => {
      // Callback triggered when server is successfully listening. Hurray!
      console.log(`Server started on: http://localhost:${this.port}`); // eslint-disable-line no-console
    });
  }
}
